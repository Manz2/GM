package com.group.gm.owner_backend.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
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
import com.group.gm.owner_backend.service.TerraformService;




import java.util.List;
import java.util.Locale;

@Service
public class TenantsService implements TenantsApiDelegate {

    private final TenantDbService tenantDbService;
    private final TerraformService terraformService;

    @Value("${google.cloud.commonPropertyBackend.url}")
    private String commonPropertyBackendUrl;

    @Value("${google.cloud.commonPropertyDb.id}")
    private String commonPropertyDb;

    @Value("${google.cloud.commonParkingDb.id}")
    private String commonParkingDb;

    @Value("${google.cloud.commonStorage.id}")
    private String commonStorage;

    @Value("${google.cloud.projectId}")
    private String projectId;


    Logger logger = LoggerFactory.getLogger(TenantsService.class);

    public TenantsService(TenantDbService tenantDbService,TerraformService terraformService) {
        this.tenantDbService = tenantDbService;
        this.terraformService = terraformService;
    }

    @Override
    public ResponseEntity<GmTenant> addTenant(GmTenant gmTenant) {
        if (gmTenant == null || gmTenant.getName() == null) {
            logger.error("Invalid tenant data provided.");
            return ResponseEntity.badRequest().build();
        }

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
        getServices(gmTenant);
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

        if(gmTenant.getTier() == GmTenant.TierEnum.PREMIUM) {
           String ip = terraformService.start(googelTenant.getTenantId(),gmTenant);
           gmTenant.getServices().getPropertyBackend().setUrl(ip);
           tenantDbService.updateTenant(gmTenant);
        } else if (gmTenant.getTier() == GmTenant.TierEnum.ENHANCED) {
            terraformService.startMid(gmTenant);
        }



        return ResponseEntity.status(HttpStatus.CREATED).body(gmTenant);
    }

    @Override
    public ResponseEntity<GmTenant> restartTenant(String id, GmTenant gmTenant){
        if (gmTenant == null || gmTenant.getName() == null) {
            logger.error("Invalid tenant data provided.");
            return ResponseEntity.badRequest().build();
        }

        if(gmTenant.getTier() == GmTenant.TierEnum.PREMIUM) {
            String ip = terraformService.relaunch(gmTenant.getId(),gmTenant);
            if(ip != null && !ip.isEmpty()){
                gmTenant.getServices().getPropertyBackend().setUrl(ip);
                tenantDbService.updateTenant(gmTenant);
            }

        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only Premium Tenants can be restarted.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(gmTenant);
    }

    private void getServices(GmTenant gmTenant) {
        if(gmTenant.getTier() == GmTenant.TierEnum.PREMIUM || gmTenant.getTier() == GmTenant.TierEnum.ENHANCED) {
            GmService propertyDb = new GmService();
            propertyDb.setName(gmTenant.getId() + " Property DB");
            propertyDb.setUrl(gmTenant.getId());
            gmTenant.getServices().setPropertyDb(propertyDb);
            GmService parkingDb = new GmService();
            parkingDb.setName(gmTenant.getId() + " Parking DB");
            parkingDb.setUrl(gmTenant.getId()+ "parking");
            gmTenant.getServices().setParkingDb(parkingDb);
            GmService storage = new GmService();
            storage.setName(gmTenant.getId() + " storage");
            storage.setUrl(gmTenant.getId());
            gmTenant.getServices().setStorage(storage);
        } else {
            GmService propertyDb = new GmService();
            propertyDb.setName("Common Property DB");
            propertyDb.setUrl(commonPropertyDb);
            gmTenant.getServices().setPropertyDb(propertyDb);
            GmService parkingDb = new GmService();
            parkingDb.setName(gmTenant.getId() + " Parking DB");
            parkingDb.setUrl(commonParkingDb);
            gmTenant.getServices().setParkingDb(parkingDb);
            GmService storage = new GmService();
            storage.setName("common storage");
            storage.setUrl(commonStorage);
            gmTenant.getServices().setStorage(storage);
        }

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
    public ResponseEntity<GmTenant> updateTenant(String id, GmTenant tenant) {
        GmTenant existingTenant = tenantDbService.getTenantById(id);

        if (existingTenant == null) {
            return ResponseEntity.notFound().build();
        }
        GmTenant.TierEnum oldTier = existingTenant.getTier();
        existingTenant.setName(tenant.getName());
        existingTenant.setServices(tenant.getServices());
        existingTenant.setCustomisation(tenant.getCustomisation());
        existingTenant.setPreferedRegion(tenant.getPreferedRegion());
        existingTenant.setTier(tenant.getTier());
        existingTenant.setNumberOfDefects(tenant.getNumberOfDefects());
        existingTenant.setNumberOfProperties(tenant.getNumberOfProperties());
        existingTenant.setNumberOfUsers(tenant.getNumberOfUsers());

        tenantDbService.updateTenant(existingTenant);


        if(tenant.getTier() == GmTenant.TierEnum.PREMIUM && oldTier == GmTenant.TierEnum.PREMIUM) {
            terraformService.startUpdate(tenant.getId(),tenant);
        } else if (tenant.getTier() == GmTenant.TierEnum.PREMIUM && oldTier == GmTenant.TierEnum.ENHANCED) {
            logger.info("updating tenant: {} from ENHANCED TO PREMIUM", tenant.getId());
            String ip = terraformService.relaunch(tenant.getId(),tenant);
            if(ip != null && !ip.isEmpty()){
                tenant.getServices().getPropertyBackend().setUrl(ip);
                tenantDbService.updateTenant(tenant);
            }
        } else if (tenant.getTier() == GmTenant.TierEnum.ENHANCED && oldTier == GmTenant.TierEnum.ENTRY) {
            logger.info("updating tenant: {} from ENTRY TO ENHANCED", tenant.getId());
            getServices(tenant);
            tenantDbService.addTenant(tenant);
            terraformService.startMid(tenant);
        }

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
