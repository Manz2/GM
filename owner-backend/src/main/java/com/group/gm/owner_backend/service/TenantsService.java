package com.group.gm.owner_backend.service;

import com.group.gm.openapi.api.TenantsApiDelegate;
import com.group.gm.openapi.model.GmService;
import com.group.gm.openapi.model.Services;
import com.group.gm.openapi.model.Tenant;
import com.group.gm.owner_backend.db.TenantDbService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

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
    public ResponseEntity<Tenant> addTenant(Tenant tenant) {
        if (tenant == null || tenant.getName() == null) {
            logger.error("Invalid tenant data provided.");
            return ResponseEntity.badRequest().build();
        }
        Services services = getServices(tenant.getTier());

        tenant.setServices(services);

        tenantDbService.addTenant(tenant);
        logger.info("Added tenant with ID: {}", tenant.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
    }

    private Services getServices(Tenant.TierEnum tier) {
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
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Tenant> getTenantById(String id) {
        Tenant tenant = tenantDbService.getTenantById(id);
        if (tenant != null) {
            logger.info("Retrieved tenant with ID: {}", id);
            return ResponseEntity.ok(tenant);
        } else {
            logger.warn("Tenant with ID: {} not found.", id);
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Tenant> updateTenant(String id, Tenant Tenant) {
        Tenant existingTenant = tenantDbService.getTenantById(id);

        if (existingTenant == null) {
            return ResponseEntity.notFound().build();
        }
        existingTenant.setName(Tenant.getName());
        existingTenant.setTenantId(Tenant.getTenantId());
        existingTenant.setServices(Tenant.getServices());
        existingTenant.setCustomisation(Tenant.getCustomisation());
        existingTenant.setPreferedRegion(Tenant.getPreferedRegion());
        existingTenant.setTier(Tenant.getTier());

        tenantDbService.updateTenant(existingTenant);

        return ResponseEntity.ok(existingTenant);
    }

    @Override
    public ResponseEntity<List<Tenant>> listTenants(String tier) {
        List<Tenant> tenants = tenantDbService.getAllTenants();
        if (tier != null && !tier.isEmpty()) {
            tenants = tenants.stream()
                    .filter(defect -> tier.equals(defect.getTier() != null ? defect.getTier().getValue() : null))
                    .toList();
        }
        return ResponseEntity.ok(tenants);
    }
}
