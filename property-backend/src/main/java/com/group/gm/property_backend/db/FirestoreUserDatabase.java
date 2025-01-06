package com.group.gm.property_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.GmTenant;
import com.group.gm.openapi.model.User;
import com.group.gm.property_backend.config.FirestoreConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreUserDatabase implements GMDBService<User> {

    private CollectionReference userCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreUserDatabase.class);


    public FirestoreUserDatabase() {}

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
        userCollection = firestore.collection("tenants").document(tenantId).collection("users");
    }

    @Override
    public User add(User user) {
        tenantSpecificConfig();
        try {
            ApiFuture<DocumentReference> future = userCollection.add(user);
            DocumentReference document = future.get();
            user.setId(document.getId());
            document.set(user);
            logger.info("Added user: {} to: {}", user, userCollection.getId());

            return user;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error adding user: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<User> getAll() {
        tenantSpecificConfig();
        List<User> users = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = userCollection.get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                User user = doc.toObject(User.class);
                user.setId(doc.getId());
                users.add(user);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching all users: {}", e.getMessage());
        }
        return users;
    }

    @Override
    public User getById(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = userCollection.document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                User user = document.toObject(User.class);
                if (user != null) {
                    user.setId(document.getId());
                }
                return user;
            } else {
                logger.warn("No user found with id: {}", id);
                return null;
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching user by id: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<User> filter(String role, String name) {
        tenantSpecificConfig();
        List<User> users = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = userCollection.whereEqualTo("role", role)
                    .whereEqualTo("status", name).get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                User user = doc.toObject(User.class);
                user.setId(doc.getId());
                users.add(user);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error filtering users: {}", e.getMessage());
        }
        return users;
    }

    @Override
    public User update(User user) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = userCollection.document(user.getId());
            ApiFuture<WriteResult> future = docRef.set(user);
            future.get();
            logger.info("Updated user: {} in: {}", user, userCollection.getId());
            return user;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error updating user: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean delete(String id) {
        tenantSpecificConfig();
        try {
            DocumentReference docRef = userCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get();
            logger.info("Successfully deleted user with id: {} in: {}", id, userCollection.getId());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error deleting user: {}", e.getMessage());
            return false;
        }
    }
}
