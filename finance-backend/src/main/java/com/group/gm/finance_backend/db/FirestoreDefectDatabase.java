package com.group.gm.finance_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.Defect;
import com.group.gm.finance_backend.config.FirestoreConfig;
import com.group.gm.finance_backend.db.GMDBService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreDefectDatabase implements GMDBService<Defect> {

    private CollectionReference defectCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreDefectDatabase.class);

    public FirestoreDefectDatabase() {}

    private void tenantSpecificConfig(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String dbId = (String) authentication.getDetails();
        Firestore firestore;
        try {
            firestore = new FirestoreConfig(dbId).firestore();
            logger.info("Firestore with id: " + dbId);
        } catch (IOException e) {
            logger.error("unable to get firestore"+ e.getMessage());
            throw new RuntimeException(e);
        }
        String tenantId = (String) authentication.getCredentials();
        defectCollection = firestore.collection("tenants").document(tenantId).collection("defects");
    }

    @Override
    public List<Defect> getAll() {
        tenantSpecificConfig();
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
    public Map<String, Object> generateDefectReport(String property) {
        System.out.println("Starting to generate defect report for property: " + property);
        tenantSpecificConfig();
        Map<String, Object> report = new HashMap<>();
        try {
            ApiFuture<QuerySnapshot> future = defectCollection.whereEqualTo("property", property).get();
            QuerySnapshot snapshot = future.get();
            int totalDefects = snapshot.size();

            report.put("property", property);
            report.put("total_defects", totalDefects);
            report.put("generated_at", new Date());

            logger.info("Report generated for property {}: total defects = {}", property, totalDefects);
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error generating defect report: {}", e.getMessage());
        }
        return report;
    }

    @Override
    public MultipartFile generatePdfFromReport(Map<String, Object> report) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Generate PDF
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.beginText();
                contentStream.setLeading(14.5f);
                contentStream.newLineAtOffset(50, 750);

                contentStream.showText("Defect Report");
                contentStream.newLine();
                contentStream.showText("Generated at: " + report.get("generated_at"));
                contentStream.newLine();
                contentStream.showText("Property: " + report.get("property"));
                contentStream.newLine();
                contentStream.showText("Total Defects: " + report.get("total_defects"));
                contentStream.newLine();

                contentStream.endText();
            }

            // Save PDF to the ByteArrayOutputStream
            document.save(outputStream);
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }

        // Convert ByteArrayOutputStream to MultipartFile
        try {
            return new MockMultipartFile(
                    "report",                                   // Name of the file
                    "defect-report.pdf",                        // Original filename
                    "application/pdf",                          // Content type
                    outputStream.toByteArray()                  // File content as byte array
            );
        } catch (Exception e) {
            throw new RuntimeException("Error creating MultipartFile: " + e.getMessage(), e);
        }
    }

    @Override
    public Defect getById(String id) {
        tenantSpecificConfig();
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
        tenantSpecificConfig();
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
}
