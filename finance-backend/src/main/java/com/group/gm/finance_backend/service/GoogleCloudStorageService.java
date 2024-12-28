package com.group.gm.finance_backend.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Objects;

public interface GoogleCloudStorageService {

    static final Logger logger = LoggerFactory.getLogger(GoogleCloudStorageServiceImpl.class);

    static String getExtension(MultipartFile file) {
        String contentType = file.getContentType();
        return switch (Objects.requireNonNull(contentType)) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/gif" -> ".gif";
            case "image/bmp" -> ".bmp";
            case "image/heic" -> ".heic";
            case "image/heif" -> ".heif";
            case "application/pdf" -> ".pdf";
            default ->
                    throw new IllegalArgumentException("Unsupported file format. Only common image and video formats are allowed.");
        };
    }

    void deleteObject(String projectId, String bucketName, String objectName);

    String uploadObject(MultipartFile file);

    String uploadObject(MultipartFile file, String directoryPath, String bucketName);

    void downloadObject(String objectName, Path destFilePath) throws IOException;
}
