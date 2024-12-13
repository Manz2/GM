package com.group.gm.property_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreUserDatabase implements GMDBService<User> {

    private final CollectionReference userCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreUserDatabase.class);

    @Autowired
    public FirestoreUserDatabase(Firestore firestore) {
        userCollection = firestore.collection("users");
    }

    @Override
    public User add(User user) {
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
