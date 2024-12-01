package com.group.gm.property_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.Defect;
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
public class FirestoreDefectDatabase implements GMDBService {

    private final CollectionReference defectCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreDefectDatabase.class);

    @Autowired
    public FirestoreDefectDatabase(Firestore firestore) {
        defectCollection = firestore.collection("defects");
    }

    @Override
    public Defect addDefect(Defect defect) {
        try {
            ApiFuture<DocumentReference> future = defectCollection.add(defect);
            DocumentReference document = future.get();
            defect.setId(document.getId());
            defect.setUpdatedAt(Instant.now().atZone(ZoneId.of("UTC+1")).toEpochSecond());
            document.set(defect);
            logger.info("Added defect: {}to: {}", defect, defectCollection.getId());

            return defect;
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
            return null;
        }
    }


    @Override
    public List<Defect> getAllDefects() {
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
            logger.error(e.getMessage());
        }
        return defects;
    }

    @Override
    public Defect getDefectById(String id) {
        try {
            DocumentReference docRef = defectCollection.document(id);
            ApiFuture<com.google.cloud.firestore.DocumentSnapshot> future = docRef.get();
            com.google.cloud.firestore.DocumentSnapshot document = future.get();
            if (document.exists()) {
                Defect defect = document.toObject(Defect.class);
                if (defect != null) {
                    defect.setId(document.getId());
                }
                return defect;
            } else {
                return null;
            }
        } catch (InterruptedException | ExecutionException e) {

            logger.error(e.getMessage());
            return null;
        }
    }

    @Override
    public List<Defect> filterDefects(String property, String status) {
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
            logger.error(e.getMessage());
        }
        return defects;
    }

    @Override
    public Defect updateDefect(Defect defect) {
        try {
            DocumentReference docRef = defectCollection.document(defect.getId());
            defect.setUpdatedAt(Instant.now().atZone(ZoneId.of("UTC+1")).toEpochSecond());
            ApiFuture<WriteResult> future = docRef.set(defect);
            future.get();
            logger.info("Updated defect: {} in: {}", defect, defectCollection.getId());
            return defect;
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
            return null;
        }
    }

    @Override
    public boolean deleteDefect(String id) {
        try {
            DocumentReference docRef = defectCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get();
            logger.info("Successfully deleted defect with id: {} in: {}", id, defectCollection.getId());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error(e.getMessage());
            return false;
        }
    }
}

