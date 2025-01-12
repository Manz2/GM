package com.group.gm.property_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.GmTenant;
import com.group.gm.openapi.model.Property;
import com.group.gm.property_backend.config.FirestoreConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.group.gm.openapi.model.ParkingProperty;


import java.io.IOException;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreParkingDatabase {

    private CollectionReference propertyCollection;
    private CollectionReference ticketCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreParkingDatabase.class);


    public FirestoreParkingDatabase() {
    }

    private void tenantSpecificConfig(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        GmTenant gmTenant = (GmTenant) authentication.getDetails();
        String dbId = gmTenant.getServices().getParkingDb().getUrl();
        Firestore firestore;
        try {
            firestore = new FirestoreConfig(dbId).firestore();
            logger.info("Firestore with id: " + dbId);
        } catch (IOException e) {
            logger.error("unable to get firestore"+ e.getMessage());
            throw new RuntimeException(e);
        }
        String tenantId = (String) authentication.getCredentials();
        if(gmTenant.getTier()== GmTenant.TierEnum.ENTRY){
            propertyCollection = firestore.collection("tenants").document(tenantId).collection("properties");
        } else {
            propertyCollection = firestore.collection("properties");
        }
    }

    public ParkingProperty add(ParkingProperty property) {
        tenantSpecificConfig();
        try {
            if (property.getId() == null || property.getId().isEmpty()) {
                throw new IllegalArgumentException("Property ID must not be null or empty");
            }

            // Dokument mit der spezifischen ID erstellen
            DocumentReference document = propertyCollection.document(property.getId());
            ApiFuture<WriteResult> future = document.set(property);
            WriteResult result = future.get();

            logger.info("Added property with ID: {} to collection: {} at time: {}",
                    property.getId(), propertyCollection.getId(), result.getUpdateTime());

            return property;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error adding property: {}", e.getMessage());
            return null;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid property ID: {}", e.getMessage());
            return null;
        }
    }


    public ParkingProperty getById(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = propertyCollection.document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                ParkingProperty property = document.toObject(ParkingProperty.class);
                if (property != null) {
                    property.setId(document.getId());
                }
                return property;
            } else {
                logger.warn("No property found with id: {}", id);
                return null;
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching property by id: {}", e.getMessage());
            return null;
        }
    }

    public ParkingProperty update(ParkingProperty property) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = propertyCollection.document(property.getId());
            ApiFuture<WriteResult> future = docRef.set(property);
            future.get();
            logger.info("Updated property: {} in: {}", property, propertyCollection.getId());
            return property;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error updating property: {}", e.getMessage());
            return null;
        }
    }

    public boolean delete(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = propertyCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get();
            logger.info("Successfully deleted property with id: {} in: {}", id, propertyCollection.getId());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error deleting property: {}", e.getMessage());
            return false;
        }
    }
}

