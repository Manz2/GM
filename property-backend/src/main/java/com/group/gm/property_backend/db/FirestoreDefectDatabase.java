package com.group.gm.property_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.Defect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreDefectDatabase implements GMDBService<Defect> {

    private CollectionReference defectCollection;
    private final Firestore firestore;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreDefectDatabase.class);

    @Autowired
    public FirestoreDefectDatabase(Firestore firestore) {
        this.firestore = firestore;
    }

    private void getDefectCollection(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String tenantId = (String) authentication.getDetails();
        defectCollection = firestore.collection("tenants").document(tenantId).collection("defects");
    }

    @Override
    public Defect add(Defect defect) {
        getDefectCollection();
        try {
            ApiFuture<DocumentReference> future = defectCollection.add(defect);
            DocumentReference document = future.get();
            defect.setId(document.getId());
            defect.setUpdatedAt(Instant.now().atZone(ZoneId.of("UTC+1")).toEpochSecond());
            document.set(defect);
            logger.info("Added defect: {} to: {}", defect, defectCollection.getId());

            return defect;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error adding defect: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<Defect> getAll() {
        getDefectCollection();
        List<Defect> defects = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = defectCollection.get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                Defect defect = doc.toObject(Defect.class);
                defect.setId(doc.getId());
                defects.add(defect);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching all defects: {}", e.getMessage());
        }
        return defects;
    }

    @Override
    public Defect getById(String id) {
        getDefectCollection();
        try {
            DocumentReference docRef = defectCollection.document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            if (document.exists()) {
                Defect defect = document.toObject(Defect.class);
                if (defect != null) {
                    defect.setId(document.getId());
                }
                return defect;
            } else {
                logger.warn("No defect found with id: {}", id);
                return null;
            }
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error fetching defect by id: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<Defect> filter(String property, String status) {
        getDefectCollection();
        List<Defect> defects = new ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = defectCollection.whereEqualTo("property", property)
                    .whereEqualTo("status", status).get();
            QuerySnapshot snapshot = future.get();
            snapshot.getDocuments().forEach(doc -> {
                Defect defect = doc.toObject(Defect.class);
                defect.setId(doc.getId());
                defects.add(defect);
            });
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error filtering defects: {}", e.getMessage());
        }
        return defects;
    }

    @Override
    public Defect update(Defect defect) {
        getDefectCollection();
        try {
            DocumentReference docRef = defectCollection.document(defect.getId());
            defect.setUpdatedAt(Instant.now().atZone(ZoneId.of("UTC+1")).toEpochSecond());
            ApiFuture<WriteResult> future = docRef.set(defect);
            future.get();
            logger.info("Updated defect: {} in: {}", defect, defectCollection.getId());
            return defect;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error updating defect: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean delete(String id) {
        getDefectCollection();
        try {
            DocumentReference docRef = defectCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get();
            logger.info("Successfully deleted defect with id: {} in: {}", id, defectCollection.getId());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error deleting defect: {}", e.getMessage());
            return false;
        }
    }
}
