
package com.group.gm.finance_backend.service;


import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.storage.*;
import com.group.gm.openapi.model.GmTenant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.AccessSecretVersionRequest;
import com.google.cloud.secretmanager.v1.SecretPayload;

import java.io.*;
import java.net.URL;
import java.nio.file.Path;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class GoogleCloudStorageServiceImpl implements GoogleCloudStorageService {


    private final Storage storage;

    private String bucket;

    @Autowired
    public GoogleCloudStorageServiceImpl(Storage storage)
    {
        this.storage = storage;
    }

    private void tenantSpecificConfig(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        GmTenant gmTenant = (GmTenant) authentication.getDetails();
        bucket = gmTenant.getServices().getStorage().getUrl();
    }

    @Override
    public void deleteObject(String projectId, String objectName) {
        tenantSpecificConfig();
        Storage storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
        Blob blob = storage.get(bucket, objectName);
        if (blob == null) {
            logger.info("The object {} wasn't found in {}", objectName, bucket);
            return;
        }
        BlobId idWithGeneration = blob.getBlobId();
        storage.delete(idWithGeneration);

        logger.info("Deleted object {} from {}", objectName, bucket);
    }

    @Override
    public String uploadObject(MultipartFile file) {
        tenantSpecificConfig();
        String extension = GoogleCloudStorageService.getExtension(file);
        String objectName = UUID.randomUUID() + extension;
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectName)
                .setContentType(file.getContentType())
                .build();

        Storage.BlobWriteOption precondition;
        if (storage.get(bucket, objectName) == null) {
            precondition = Storage.BlobWriteOption.doesNotExist();
        } else {
            precondition = Storage.BlobWriteOption.generationMatch(
                    storage.get(bucket, objectName).getGeneration());
        }

        try {
            storage.createFrom(blobInfo, file.getInputStream(), precondition);
        } catch (IOException e)
        {
            logger.error("File {} COULDNT be uploaded to bucket {} as {}", file, bucket, objectName);
            return null;
        }
        logger.info("File {} uploaded to bucket {} as {}", file, bucket, objectName);
        return objectName;
    }


    @Override
    public String uploadObject(MultipartFile file, String directoryPath) {
        tenantSpecificConfig();
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be null or empty");
        }

        try {
            String objectName = directoryPath + "/" + file.getOriginalFilename();
            Blob blob = storage.create(BlobInfo.newBuilder(bucket, objectName).build(), file.getBytes());

            return blob.getMediaLink();
        } catch (IOException e) {
            throw new RuntimeException("Error uploading file to bucket: " + e.getMessage(), e);
        }
    }

    @Override
    public void downloadObject(String objectName, Path destFilePath) throws IOException {
        tenantSpecificConfig();
        Blob blob = storage.get(BlobId.of(bucket, objectName));
        blob.downloadTo(destFilePath);

        logger.info("Downloaded object {} from bucket name {} to {}", objectName, bucket, destFilePath);
    }

}

