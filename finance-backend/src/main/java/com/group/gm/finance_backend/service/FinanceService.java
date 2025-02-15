package com.group.gm.finance_backend.service;

import com.group.gm.openapi.model.Defect;
import com.group.gm.finance_backend.db.GMDBService;
import com.group.gm.openapi.api.FinanceApiDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.Map;

@Service
public class FinanceService implements FinanceApiDelegate {

    //changeme123 ist passwort standard bei tenant1

    private final com.group.gm.finance_backend.db.GMDBService<Defect> gmdbService;
    private final com.group.gm.finance_backend.service.GoogleCloudStorageService storageService;
    private final String projectId;
    private final String bucket;

    Logger logger = LoggerFactory.getLogger(com.group.gm.finance_backend.service.FinanceService.class);

    public FinanceService(GMDBService<Defect> gmdbService,
                          GoogleCloudStorageService storageService,
                          @Value("${google.cloud.projectId}") String projectId,
                          @Value("${google.cloud.bucket}") String bucket) {
        this.gmdbService = gmdbService;
        this.storageService = storageService;
        this.projectId = projectId;
        this.bucket = bucket;
    }


    @Override
    public ResponseEntity<String> generateDefectReport(String location, String status, String startDatum, String endDatum) {
        if (location == null || location.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Property parameter is required.");
        }
        try {
            Map<String, Object> report = gmdbService.generateDefectReport(location, status, startDatum, endDatum);
            System.out.println("Report content: " + report);

            if (report.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            MultipartFile pdfFile = gmdbService.generatePdfFromReport(report);
            System.out.println("Pdf generated");
            String pdfUrl = storageService.uploadObject(pdfFile);
            System.out.println("Pdf uploaded to: " + pdfUrl);

            return ResponseEntity.ok(pdfUrl);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Error: Invalid date format. Use YYYY-MM-DD.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating defect report: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Resource> getReportFileById(String id) {
        try {
            String prefix = id.substring(0, id.lastIndexOf('.'));
            String suffix = id.substring(id.lastIndexOf('.'));

            Path path = Files.createTempFile(prefix, suffix);
            storageService.downloadObject(id, path);
            return ResponseEntity.ok(new UrlResource(path.toUri()));
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<String> generateFinanceReport(String location, String startDatum, String endDatum) {
        if (location == null || location.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Property parameter is required.");
        }
        try {
            Map<String, Object> report = gmdbService.generateFinanceReport(location, startDatum, endDatum);
            System.out.println("Report content: " + report);

            if (report.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            MultipartFile pdfFile = gmdbService.generatePdfFromFinanceReport(report);
            System.out.println("Pdf generated");
            String pdfUrl = storageService.uploadObject(pdfFile);
            System.out.println("Pdf uploaded to: " + pdfUrl);

            return ResponseEntity.ok(pdfUrl);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Error: Invalid date format. Use YYYY-MM-DD.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating defect report: " + e.getMessage());
        }
    }

}
