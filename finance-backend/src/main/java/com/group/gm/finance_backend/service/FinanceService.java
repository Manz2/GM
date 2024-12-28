package com.group.gm.finance_backend.service;

import com.group.gm.openapi.model.Defect;
import com.group.gm.finance_backend.db.GMDBService;
import com.group.gm.openapi.api.FinanceApiDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Date;
import java.util.Map;

@Service
public class FinanceService implements FinanceApiDelegate {

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
    public ResponseEntity<String> generateDefectReport(String property, String status, String startDatum, String endDatum) {
        if (property == null || property.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Property parameter is required.");
        }
        try {
            Map<String, Object> report = gmdbService.generateDefectReport(property);
            System.out.println("Report content: " + report);
            if (report.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            MultipartFile pdfFile = gmdbService.generatePdfFromReport(report);
            System.out.println("Pdf generated");
            String pdfPath = storageService.uploadObject(pdfFile);
            System.out.println("Pdf uploaded to: " + pdfPath);
            return ResponseEntity.ok(pdfPath);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating defect report: " + e.getMessage());
        }
    }
}
