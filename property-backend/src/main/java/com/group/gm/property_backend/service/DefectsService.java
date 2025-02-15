package com.group.gm.property_backend.service;

import com.group.gm.property_backend.db.GMDBService;
import com.group.gm.openapi.api.DefectsApiDelegate;
import com.group.gm.openapi.model.Defect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class DefectsService implements DefectsApiDelegate {

    private final GMDBService<Defect> gmdbService;
    private final GoogleCloudStorageService storageService;
    private final String projectId;
    private final String bucket;

    Logger logger = LoggerFactory.getLogger(DefectsService.class);

    public DefectsService(GMDBService<Defect> gmdbService,
                          GoogleCloudStorageService storageService,
                          @Value("${google.cloud.projectId}") String projectId,
                          @Value("${google.cloud.bucket}") String bucket) {
        this.gmdbService = gmdbService;
        this.storageService = storageService;
        this.projectId = projectId;
        this.bucket = bucket;
    }

    @Override
    public ResponseEntity<Defect> getDefectById(String id) {
        Defect defect = gmdbService.getById(id);
        if (defect != null) {
            return ResponseEntity.ok(gmdbService.getById(id));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Resource> getDefectImageById(String id) {
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
    public ResponseEntity<Defect> addDefect(Defect defect, MultipartFile file) {
        if (defect == null || defect.getProperty() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (file != null) {
            String imagePath = storageService.uploadObject(file);
            defect.setImage(imagePath);
        } else {
            defect.setImage("");
        }
        gmdbService.add(defect);
        return ResponseEntity.status(HttpStatus.CREATED).body(defect); // 201 Created
    }

    @Override
    public ResponseEntity<List<Defect>> listDefects(String property, String status) {
        List<Defect> defects;
        defects = gmdbService.getAll();
        if (property != null && !property.isEmpty() && status != null && !status.isEmpty()) {
            defects = defects.stream()
                    .filter(defect -> property.equals(defect.getProperty()) &&
                            status.equals(defect.getStatus() != null ? defect.getStatus().getValue() : null))
                    .collect(Collectors.toList());
        } else if (property != null && !property.isEmpty()) {
            defects = defects.stream()
                    .filter(defect -> property.equals(defect.getProperty()))
                    .collect(Collectors.toList());
        } else if (status != null && !status.isEmpty()) {
            defects = defects.stream()
                    .filter(defect -> status.equals(defect.getStatus() != null ? defect.getStatus().getValue() : null))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(defects);
    }

    @Override
    public ResponseEntity<Void> deleteDefect(String id) {
        try {
            Defect defect = gmdbService.getById(id);
            String image = defect.getImage();
            if (!Objects.equals(image, "")) {
                storageService.deleteObject(projectId, defect.getImage());
            }
            boolean deleted = gmdbService.delete(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Defect> updateDefect(String id, Defect updatedDefect) {
        Defect existingDefect = gmdbService.getById(id);

        if (existingDefect == null) {
            return ResponseEntity.notFound().build();
        }

        existingDefect.setProperty(updatedDefect.getProperty());
        existingDefect.setLocation(updatedDefect.getLocation());
        existingDefect.setDescriptionShort(updatedDefect.getDescriptionShort());
        existingDefect.setDescriptionDetailed(updatedDefect.getDescriptionDetailed());
        existingDefect.setReportingDate(updatedDefect.getReportingDate());
        existingDefect.setStatus(updatedDefect.getStatus());

        gmdbService.update(existingDefect);

        return ResponseEntity.ok(existingDefect);
    }
}
