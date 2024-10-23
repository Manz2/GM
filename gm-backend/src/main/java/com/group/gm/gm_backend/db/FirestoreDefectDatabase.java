package com.group.gm.gm_backend.db;

import com.group.gm.openapi.model.Defect;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreDefectDatabase implements GMDBService {

    // Statische Konstanten für die Firestore Konfiguration
    private static final String PROJECT_ID = "ca-test2-438111";
    private static final String COLLECTION_NAME = "gm-firestore";

    private final Firestore firestore;
    private final CollectionReference defectCollection;

    public FirestoreDefectDatabase() {
        // Firestore-Instanz initialisieren
        FirestoreOptions firestoreOptions = FirestoreOptions.getDefaultInstance().toBuilder()
                .setProjectId(PROJECT_ID)
                .build();
        firestore = firestoreOptions.getService();
        defectCollection = firestore.collection(COLLECTION_NAME);


    }
    @Override
    public Defect addDefect(Defect defect) {
        try {
            // Dokument zu Firestore hinzufügen
            ApiFuture<DocumentReference> future = defectCollection.add(defect);
            // Warten auf die Antwort und das neue Dokumentreferenzobjekt erhalten
            DocumentReference document = future.get();
            // Setzt die generierte ID zurück in das Defect-Objekt
            defect.setId(document.getId());

            // Optional: Defect erneut in Firestore speichern, wenn du die ID in der Datenbank benötigst
            document.set(defect);

            return defect; // Gibt das aktualisierte Defect-Objekt zurück
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
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
            e.printStackTrace();
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
            e.printStackTrace();
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
            e.printStackTrace();
        }
        return defects;
    }

    @Override
    public Defect updateDefect(Defect defect) {
        try {
            DocumentReference docRef = defectCollection.document(defect.getId());
            ApiFuture<WriteResult> future = docRef.set(defect);
            future.get(); // Wartet, bis das Update abgeschlossen ist
            return defect;
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public boolean deleteDefect(String id) {
        try {
            DocumentReference docRef = defectCollection.document(id);
            ApiFuture<WriteResult> future = docRef.delete();
            future.get(); // Wartet, bis das Löschen abgeschlossen ist
            return true;
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return false;
        }
    }
}
