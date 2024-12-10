package com.group.gm.owner_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.Tenant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreTenantDatabase implements TenantDbService {

    private final CollectionReference tenantCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreTenantDatabase.class);

    @Autowired
    public FirestoreTenantDatabase(Firestore firestore) {
        tenantCollection = firestore.collection("tenants");
    }

    @Override
    public Tenant addTenant(Tenant tenant) {
        try {
            ApiFuture<DocumentReference> future = tenantCollection.add(tenant);
            DocumentReference document = future.get();
            tenant.setId(document.getId());
            document.set(tenant);
            logger.info("Added tenant: {}to: {}", tenant, tenantCollection.getId());

            return tenant;
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
            return null;
        }
    }


    @Override
    public List<Tenant> getAllTenants() {
        List<Tenant> tenants = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = tenantCollection.get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                Tenant tenant = doc.toObject(Tenant.class);
                tenant.setId(doc.getId());
                tenants.add(tenant);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
        }
        return tenants;
    }

    @Override
    public Tenant getTenantById(String id) {
        try {
            DocumentReference docRef = tenantCollection.document(id);
            ApiFuture<com.google.cloud.firestore.DocumentSnapshot> future = docRef.get();
            com.google.cloud.firestore.DocumentSnapshot document = future.get();
            if (document.exists()) {
                Tenant tenant = document.toObject(Tenant.class);
                if (tenant != null) {
                    tenant.setId(document.getId());
                }
                return tenant;
            } else {
                return null;
            }
        } catch (InterruptedException | ExecutionException e) {

            logger.error(e.getMessage());
            return null;
        }
    }

    @Override
    public List<Tenant> filterTenants(String property, String status) {
        List<Tenant> tenants = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = tenantCollection.whereEqualTo("property", property)
                    .whereEqualTo("status", status).get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                Tenant tenant = doc.toObject(Tenant.class);
                tenant.setId(doc.getId());
                tenants.add(tenant);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
        }
        return tenants;
    }

    @Override
    public Tenant updateTenant(Tenant tenant) {
        try {
            DocumentReference docRef = tenantCollection.document(tenant.getId());
            ApiFuture<WriteResult> future = docRef.set(tenant);
            future.get();
            logger.info("Updated tenant: {} in: {}", tenant, tenantCollection.getId());
            return tenant;
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
            return null;
        }
    }

    @Override
    public boolean deleteTenant(String id) {
        try {
            DocumentReference docRef = tenantCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get();
            logger.info("Successfully deleted tenant with id: {} in: {}", id, tenantCollection.getId());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
            return false;
        }
    }
}
