package com.group.gm.owner_backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.multitenancy.Tenant;
import com.google.firebase.auth.multitenancy.TenantAwareFirebaseAuth;
import com.group.gm.openapi.api.TenantsApiDelegate;
import com.group.gm.openapi.model.GmService;
import com.group.gm.openapi.model.Services;
import com.group.gm.openapi.model.GmTenant;
import com.group.gm.owner_backend.config.FirebaseConfig;
import com.group.gm.owner_backend.db.TenantDbService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.multitenancy.TenantManager;



import java.util.List;
import java.util.Locale;

@Service
public class TenantsService implements TenantsApiDelegate {

    private final TenantDbService tenantDbService;

    @Value("${google.cloud.commonPropertyBackend.url}")
    private String commonPropertyBackendUrl;

    @Value("${google.cloud.commonPropertyDb.id}")
    private String commonPropertyDb;

    Logger logger = LoggerFactory.getLogger(TenantsService.class);

    public TenantsService(TenantDbService tenantDbService) {
        this.tenantDbService = tenantDbService;
    }

    @Override
    public ResponseEntity<GmTenant> addTenant(GmTenant gmTenant) {
        if (gmTenant == null || gmTenant.getName() == null) {
            logger.error("Invalid tenant data provided.");
            return ResponseEntity.badRequest().build();
        }
        Services services = getServices(gmTenant.getTier());
        gmTenant.setServices(services);

        Tenant googelTenant;
        try {
            Tenant.CreateRequest request = new Tenant.CreateRequest()
                    .setDisplayName(gmTenant.getName().toLowerCase().trim())
                    .setEmailLinkSignInEnabled(true)
                    .setPasswordSignInAllowed(true);
            googelTenant = FirebaseAuth.getInstance().getTenantManager().createTenant(request);
            logger.info("Created tenant: {}", googelTenant.getTenantId());
        } catch (FirebaseAuthException e) {
            logger.error("Failed to create tenant.");
            throw new RuntimeException(e);
        }
        gmTenant.setId(googelTenant.getTenantId());
        tenantDbService.addTenant(gmTenant);
        logger.info("Added tenant with ID: {}", gmTenant.getId());

        TenantAwareFirebaseAuth auth = FirebaseAuth.getInstance().getTenantManager().getAuthForTenant(googelTenant.getTenantId());
        try {
            auth.createUser(new UserRecord.CreateRequest()
                    .setEmail(gmTenant.getAdminMail())
                    .setPassword("changeMe123")  // Initiales Passwort
                    .setEmailVerified(false)); // Optional, Display Name setzen
        } catch (FirebaseAuthException e) {
            logger.error("Failed to create admin user.");
            throw new RuntimeException(e);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(gmTenant);
    }

    private Services getServices(GmTenant.TierEnum tier) {
        Services services = new Services();
        // TODO implement other tiers here

        // This case is for Entry Tier
        GmService propertyBackend = new GmService();
        propertyBackend.setName("Common Property Backend");
        propertyBackend.setUrl(commonPropertyBackendUrl);
        services.setPropertyBackend(propertyBackend);

        GmService propertyDb = new GmService();
        propertyDb.setName("Common Property DB");
        propertyDb.setUrl(commonPropertyDb);
        services.setPropertyDb(propertyDb);

        return services;
    }

    @Override
    public ResponseEntity<Void> deleteTenant(String id) {
        try {
            boolean deleted = tenantDbService.deleteTenant(id);
            if (deleted) {
                FirebaseAuth.getInstance().getTenantManager().deleteTenant(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<GmTenant> getTenantById(String id) {
        GmTenant tenant = tenantDbService.getTenantById(id);
        if (tenant != null) {
            logger.info("Retrieved tenant with ID: {}", id);
            return ResponseEntity.ok(tenant);
        } else {
            logger.warn("Tenant with ID: {} not found.", id);
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<GmTenant> updateTenant(String id, GmTenant Tenant) {
        GmTenant existingTenant = tenantDbService.getTenantById(id);

        if (existingTenant == null) {
            return ResponseEntity.notFound().build();
        }
        existingTenant.setName(Tenant.getName());
        existingTenant.setServices(Tenant.getServices());
        existingTenant.setCustomisation(Tenant.getCustomisation());
        existingTenant.setPreferedRegion(Tenant.getPreferedRegion());
        existingTenant.setTier(Tenant.getTier());

        tenantDbService.updateTenant(existingTenant);

        return ResponseEntity.ok(existingTenant);
    }

    @Override
    public ResponseEntity<List<GmTenant>> listTenants(String tier) {
        List<GmTenant> tenants = tenantDbService.getAllTenants();
        if (tier != null && !tier.isEmpty()) {
            tenants = tenants.stream()
                    .filter(defect -> tier.equals(defect.getTier() != null ? defect.getTier().getValue() : null))
                    .toList();
        }
        return ResponseEntity.ok(tenants);
    }
}
