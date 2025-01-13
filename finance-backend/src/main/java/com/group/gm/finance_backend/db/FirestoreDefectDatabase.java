package com.group.gm.finance_backend.db;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.group.gm.openapi.model.Defect;
import com.group.gm.finance_backend.config.FirestoreConfig;
import com.group.gm.openapi.model.GmTenant;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreDefectDatabase implements GMDBService<Defect> {

    private CollectionReference defectCollection;
    private CollectionReference ticketCollection;
    private CollectionReference propertyCollection;
    private static final Logger logger = LoggerFactory.getLogger(FirestoreDefectDatabase.class);

    public FirestoreDefectDatabase() {}

    private void tenantSpecificConfig(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        GmTenant gmTenant = (GmTenant) authentication.getDetails();
        String dbId = gmTenant.getServices().getPropertyDb().getUrl();
        Firestore firestore;
        Firestore firestoreProperty;
        Firestore firestoreParking;
        try {
            firestore = new FirestoreConfig(dbId).firestore();
            logger.info("Firestore with id: " + dbId);
            firestoreProperty = new FirestoreConfig(dbId).firestore();
            firestoreParking = new FirestoreConfig(dbId+"parking").firestore();
            logger.info("FirestoreProperty with id: " + dbId);
            logger.info("FirestoreParking with id: " + dbId+"parking");
        } catch (IOException e) {
            logger.error("unable to get firestore"+ e.getMessage());
            throw new RuntimeException(e);
        }
        String tenantId = (String) authentication.getCredentials();
        if(gmTenant.getTier()== GmTenant.TierEnum.ENTRY){
            defectCollection = firestore.collection("tenants").document(tenantId).collection("defects");
            ticketCollection = firestoreParking.collection("tenant").document(tenantId).collection("tickets");
            propertyCollection = firestoreProperty.collection("tenant").document(tenantId).collection("properties");
        } else {
            defectCollection = firestore.collection("defects");
            ticketCollection = firestoreParking.collection("tickets");
            propertyCollection = firestoreProperty.collection("properties");
        }
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
    public Map<String, Object> generateDefectReport(String location, String status, String startDatum, String endDatum) {
        System.out.println("Starting to generate defect report for property: " + location);
        System.out.println("Parameters used: " + location + " " + status + " "+ startDatum + " "+ endDatum);
        tenantSpecificConfig();
        Map<String, Object> report = new HashMap<>();
        try {
            Query query = defectCollection.whereEqualTo("location", location);

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            if (startDatum != null && !startDatum.isEmpty()) {
                Date startDate = sdf.parse(startDatum);
                long startMillis = startDate.getTime();
                System.out.println("Startdate in Milliseconds: " + startMillis);
                query = query.whereGreaterThanOrEqualTo("reportingDate", startMillis);
            }
            if (endDatum != null && !endDatum.isEmpty()) {
                Date endDate = sdf.parse(endDatum);
                long endMillis = endDate.getTime();
                System.out.println("Enddate in Milliseconds: " + endMillis);
                query = query.whereLessThanOrEqualTo("reportingDate", endMillis);
            }
            if (endDatum != null && !endDatum.isEmpty()) {
                String UppercaseStatus = status.toUpperCase();
                query = query.whereEqualTo("status", UppercaseStatus);
            }

            ApiFuture<QuerySnapshot> future = query.get();
            QuerySnapshot snapshot = future.get();
            int totalDefects = snapshot.size();

            report.put("location", location);
            report.put("status", status);
            report.put("total_defects", totalDefects);
            report.put("start_date", startDatum);
            report.put("end_date", endDatum);
            report.put("generated_at", new Date());

            logger.info("Report generated for location {}: total defects = {}", location, totalDefects);
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error generating defect report: {}", e.getMessage());
        } catch (ParseException e) {
            logger.error("Error parsing dates: {}", e.getMessage());
        }

        System.out.println(report);
        return report;
    }

    @Override
    public Map<String, Object> generateFinanceReport(String location, String startDatum, String endDatum) {
        System.out.println("Starting to generate Finance report for property: " + location);
        System.out.println("Parameters used: " + location + " "+ startDatum + " "+ endDatum);
        tenantSpecificConfig();
        Map<String, Object> report = new HashMap<>();
        try {

            Query propertyQuery = propertyCollection.whereEqualTo("name", location);
            ApiFuture<QuerySnapshot> propertyFuture = propertyQuery.get();
            QuerySnapshot propertySnapshot = propertyFuture.get();

            if (propertySnapshot.isEmpty()) {
                logger.warn("No property found with name: {}", location);
                report.put("location", location);
                report.put("error", "Property not found");
                return report;
            }


            DocumentSnapshot propertyDocument = propertySnapshot.getDocuments().get(0);
            String propertyId = propertyDocument.getId();
            logger.info("Found property ID for location {}: {}", location, propertyId);


            Query ticketQuery = ticketCollection.whereEqualTo("propertyId", propertyId);

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            if (startDatum != null && !startDatum.isEmpty()) {
                Date startDate = sdf.parse(startDatum);
                long startMillis = startDate.getTime();

                ticketQuery = ticketQuery.whereGreaterThanOrEqualTo("creationDate", startMillis);
            }
            if (endDatum != null && !endDatum.isEmpty()) {
                Date endDate = sdf.parse(endDatum);
                long endMillis = endDate.getTime();

                ticketQuery = ticketQuery.whereLessThanOrEqualTo("creationDate", endMillis);
            }


            ApiFuture<QuerySnapshot> ticketFuture = ticketQuery.get();
            QuerySnapshot ticketSnapshot = ticketFuture.get();

            double totalPrice = 0.0;


            for (DocumentSnapshot ticketDocument : ticketSnapshot.getDocuments()) {
                Double price = ticketDocument.getDouble("price"); // Assuming the price field is named "price"
                if (price != null) {
                    totalPrice += price;
                }
            }


            report.put("location", location);
            report.put("property_id", propertyId);
            report.put("total_tickets", ticketSnapshot.size());
            report.put("total_price", totalPrice);
            report.put("start_date", startDatum);
            report.put("end_date", endDatum);
            report.put("generated_at", new Date());

            logger.info("Report generated for location {}: total tickets = {}, total price = {}", location, ticketSnapshot.size(), totalPrice);

        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error generating defect report: {}", e.getMessage());
        } catch (ParseException e) {
            logger.error("Error parsing dates: {}", e.getMessage());
        }

        System.out.println(report);
        return report;
    }

    @Override
    public MultipartFile generatePdfFromReport(Map<String, Object> report) {
        System.out.println("Starting to generate Pdf for Report: " + report.get("location"));
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);

            document.setMargins(20, 20, 20, 20);

            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            document.add(new Paragraph("Defect Report")
                    .setFont(titleFont)
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            LineSeparator separator = new LineSeparator(new SolidLine());
            document.add(separator);

            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            document.add(new Paragraph("Generated at: " + report.get("generated_at"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT)
                    .setMarginTop(10));

            document.add(new Paragraph("Property: " + report.get("location"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Total Defects: " + report.get("total_defects"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Status: " + report.get("status"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Start Datum: " + report.get("start_date"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("End Datum: " + report.get("end_date"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                    .useAllAvailableWidth()
                    .setMarginTop(20);
            table.addHeaderCell(new Cell().add(new Paragraph("Field").setFont(boldFont)));
            table.addHeaderCell(new Cell().add(new Paragraph("Value").setFont(boldFont)));

            for (Map.Entry<String, Object> entry : report.entrySet()) {
                table.addCell(new Cell().add(new Paragraph(entry.getKey())));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(entry.getValue()))));
            }
            document.add(table);

            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }

        try {
            return new MockMultipartFile(
                    "report",
                    "defect-report.pdf",
                    "application/pdf",
                    outputStream.toByteArray()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error creating MultipartFile: " + e.getMessage(), e);
        }
    }

    @Override
    public MultipartFile generatePdfFromFinanceReport(Map<String, Object> report) {
        System.out.println("Starting to generate Pdf for Report: " + report.get("location"));
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);

            document.setMargins(20, 20, 20, 20);

            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            document.add(new Paragraph("Finance Report")
                    .setFont(titleFont)
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            LineSeparator separator = new LineSeparator(new SolidLine());
            document.add(separator);

            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            document.add(new Paragraph("Generated at: " + report.get("generated_at"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT)
                    .setMarginTop(10));

            document.add(new Paragraph("Property: " + report.get("location"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Property ID: " + report.get("property_id"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Total Tickets: " + report.get("total_tickets"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Total Price: " + report.get("total_price"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("Start Date: " + report.get("start_date"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            document.add(new Paragraph("End Date: " + report.get("end_date"))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.LEFT));

            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                    .useAllAvailableWidth()
                    .setMarginTop(20);
            table.addHeaderCell(new Cell().add(new Paragraph("Field").setFont(boldFont)));
            table.addHeaderCell(new Cell().add(new Paragraph("Value").setFont(boldFont)));

            // Include additional fields from the report map
            for (Map.Entry<String, Object> entry : report.entrySet()) {
                table.addCell(new Cell().add(new Paragraph(entry.getKey())));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(entry.getValue()))));
            }
            document.add(table);

            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }

        try {
            return new MockMultipartFile(
                    "report",
                    "finance-report.pdf",
                    "application/pdf",
                    outputStream.toByteArray()
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
