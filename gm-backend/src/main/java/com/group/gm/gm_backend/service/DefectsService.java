package com.group.gm.gm_backend.service;

import com.group.gm.gm_backend.db.GMDBService;
import com.group.gm.openapi.api.DefectsApiDelegate;
import com.group.gm.openapi.model.Defect;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.stream.Collectors;

@Service
public class DefectsService implements DefectsApiDelegate {

    @Autowired
    GMDBService gmdbService;

    @Autowired
    GoogleCloudStorageService storageService;

    @Override
    public ResponseEntity<Defect> getDefectById(String id) {
        Defect defect = gmdbService.getDefectById(id);
        if (defect != null) {
            return ResponseEntity.ok(gmdbService.getDefectById(id));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Resource> getDefectImageById(String id) {
        try {
            Path path = Files.createTempFile("downloadedImage", ".jpg");
            storageService.downloadObject(id, path);
            return ResponseEntity.ok(new UrlResource(path.toUri()));
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Defect> addDefect(Defect defect, MultipartFile file) {
        if (defect == null || defect.getProperty() == null) {
            return ResponseEntity.badRequest().build(); // 400 Bad Request
        }
        String imagePath = storageService.uploadObject(file);
        defect.setImage(imagePath);
        gmdbService.addDefect(defect);
        return ResponseEntity.status(HttpStatus.CREATED).body(defect); // 201 Created
    }

    @Override
    public ResponseEntity<List<Defect>> listDefects(String property, String status) {
        List<Defect> defects = gmdbService.getAllDefects(); // Alle Defects abrufen

        // Filtern der Defects basierend auf den übergebenen Parametern
        if (property != null && !property.isEmpty() && status != null && !status.isEmpty()) {
            // Beide Parameter sind gesetzt, also nach beiden filtern
            defects = defects.stream()
                    .filter(defect -> property.equals(defect.getProperty()) &&
                            status.equals(defect.getStatus() != null ? defect.getStatus().getValue() : null))
                    .collect(Collectors.toList());
        } else if (property != null && !property.isEmpty()) {
            // Nur property ist gesetzt
            defects = defects.stream()
                    .filter(defect -> property.equals(defect.getProperty()))
                    .collect(Collectors.toList());
        } else if (status != null && !status.isEmpty()) {
            // Nur status ist gesetzt
            defects = defects.stream()
                    .filter(defect -> status.equals(defect.getStatus() != null ? defect.getStatus().getValue() : null))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(defects); // Rückgabe der gefilterten Liste
    }

    @Override
    public ResponseEntity<Void> deleteDefect(String id) {
        boolean deleted = gmdbService.deleteDefect(id); // Löschen des Defects durch den GMDB-Service

        if (deleted) {
            return ResponseEntity.noContent().build(); // Erfolgreich gelöscht, Rückgabe 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // Defect nicht gefunden, Rückgabe 404 Not Found
        }
    }

    @Override
    public ResponseEntity<Defect> updateDefect(String id, Defect updatedDefect) {
        // Zuerst den vorhandenen Defect anhand der ID abrufen
        Defect existingDefect = gmdbService.getDefectById(id);

        if (existingDefect == null) {
            return ResponseEntity.notFound().build(); // Wenn der Defect nicht gefunden wird, Rückgabe 404 Not Found
        }

        // Aktualisiere die Felder des vorhandenen Defects mit den neuen Werten
        existingDefect.setProperty(updatedDefect.getProperty());
        existingDefect.setLocation(updatedDefect.getLocation());
        existingDefect.setDescriptionShort(updatedDefect.getDescriptionShort());
        existingDefect.setDescriptionDetailed(updatedDefect.getDescriptionDetailed());
        existingDefect.setReportingDate(updatedDefect.getReportingDate());
        existingDefect.setStatus(updatedDefect.getStatus());

        // Den aktualisierten Defect speichern
        gmdbService.updateDefect(existingDefect); // Diese Methode muss in deinem GMDBInterface implementiert sein

        return ResponseEntity.ok(existingDefect); // Rückgabe des aktualisierten Defects mit 200 OK
    }
}
