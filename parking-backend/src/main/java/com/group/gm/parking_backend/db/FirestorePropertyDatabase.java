package com.group.gm.parking_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.GmTenant;
import com.group.gm.openapi.model.Property;
import com.group.gm.parking_backend.config.FirestoreConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Component
public class FirestorePropertyDatabase implements GMDBService<Property> {

    private CollectionReference propertyCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestorePropertyDatabase.class);


    public FirestorePropertyDatabase() {
    }

    private void tenantSpecificConfig(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        GmTenant gmTenant = (GmTenant) authentication.getDetails();
        String dbId = gmTenant.getServices().getPropertyDb().getUrl();
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

    @Override
    public Property add(Property property) {
        tenantSpecificConfig();
        try {
            ApiFuture<DocumentReference> future = propertyCollection.add(property);
            DocumentReference document = future.get();
            property.setId(document.getId());
            document.set(property);
            logger.info("Added property: {} to: {}", property, propertyCollection.getId());

            return property;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error adding property: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<Property> getAll() {
        tenantSpecificConfig();
        List<Property> properties = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = propertyCollection.get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                Property property = doc.toObject(Property.class);
                property.setId(doc.getId());
                properties.add(property);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching all properties: {}", e.getMessage());
        }
        return properties;
    }

    @Override
    public Property getById(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = propertyCollection.document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                Property property = document.toObject(Property.class);
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

    @Override
    public List<Property> filter(String city, String status) {
        tenantSpecificConfig();
        List<Property> properties = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = propertyCollection.whereEqualTo("city", city)
                    .whereEqualTo("status", status).get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                Property property = doc.toObject(Property.class);
                property.setId(doc.getId());
                properties.add(property);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error filtering properties: {}", e.getMessage());
        }
        return properties;
    }

    @Override
    public Property update(Property property) {
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

    @Override
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
