
package com.group.gm.finance_backend.service;


import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GoogleCloudStorageServiceImpl implements GoogleCloudStorageService {


    private final Storage storage;

    @Value("${google.cloud.bucket}")
    private String bucket;

    @Autowired
    public GoogleCloudStorageServiceImpl(Storage storage)
    {
        this.storage = storage;
    }

    @Override
    public void deleteObject(String projectId, String bucketName, String objectName) {
        Storage storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
        Blob blob = storage.get(bucketName, objectName);
        if (blob == null) {
            logger.info("The object {} wasn't found in {}", objectName, bucketName);
            return;
        }
        BlobId idWithGeneration = blob.getBlobId();
        storage.delete(idWithGeneration);

        logger.info("Deleted object {} from {}", objectName, bucketName);
    }
    @Override
    public String uploadObject(MultipartFile file) {

        String extension = GoogleCloudStorageService.getExtension(file);


        String objectName = UUID.randomUUID() + extension;
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectName)
                .setContentType(file.getContentType())
                .build();

        Storage.BlobWriteOption precondition;
        if (storage.get(bucket, objectName) == null) {
            precondition = Storage.BlobWriteOption.doesNotExist();
        } else {
            precondition =
                    Storage.BlobWriteOption.generationMatch(
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
    public void downloadObject(String objectName, Path destFilePath) throws IOException {
        Blob blob = storage.get(BlobId.of(bucket, objectName));
        blob.downloadTo(destFilePath);

        logger.info("Downloaded object {} from bucket name {} to {}", objectName, bucket, destFilePath);
    }

}

