
package com.group.gm.gm_backend.service;


import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.cloud.storage.Blob;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

import java.io.IOException;
import java.util.UUID;

@Service
public class GoogleCloudStorageService {


    private final Storage storage;

    @Value("${google.cloud.bucket}")
    private String bucket;

    @Autowired
    public GoogleCloudStorageService(Storage storage)
    {
        this.storage = storage;
    }

    public String uploadObject(MultipartFile file) {
        // The ID of your GCP project
        // String projectId = "your-project-id";

        // The ID of your GCS bucket
        // String bucketName = "your-unique-bucket-name";

        // The ID of your GCS object
        // String objectName = "your-object-name";

        // The path to your file to upload
        // String filePath = "path/to/your/file"
        String objectName = UUID.randomUUID() + "_" + "upload";
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectName)
                .setContentType(file.getContentType())
                .build();

        // Optional: set a generation-match precondition to avoid potential race
        // conditions and data corruptions. The request returns a 412 error if the
        // preconditions are not met.
        Storage.BlobWriteOption precondition;
        if (storage.get(bucket, objectName) == null) {
            // For a target object that does not yet exist, set the DoesNotExist precondition.
            // This will cause the request to fail if the object is created before the request runs.
            precondition = Storage.BlobWriteOption.doesNotExist();
        } else {
            // If the destination already exists in your bucket, instead set a generation-match
            // precondition. This will cause the request to fail if the existing object's generation
            // changes before the request runs.
            precondition =
                    Storage.BlobWriteOption.generationMatch(
                            storage.get(bucket, objectName).getGeneration());
        }
        try {
            storage.createFrom(blobInfo, file.getInputStream(), precondition);
        } catch (IOException e)
        {
            System.out.println(
                    "File " + file + " COULDNT be uploaded to bucket " + bucket + " as " + objectName);
            return null;
        }

        System.out.println(
                "File " + file + " uploaded to bucket " + bucket + " as " + objectName);
        return objectName;
    }

    public void downloadObject(String objectName, Path destFilePath) throws IOException {
        // The ID of your GCP project
        // String projectId = "your-project-id";

        // The ID of your GCS bucket
        // String bucketName = "your-unique-bucket-name";

        // The ID of your GCS object
        // String objectName = "your-object-name";

        // The path to which the file should be downloaded
        // String destFilePath = "/local/path/to/file.txt";

        Blob blob = storage.get(BlobId.of(bucket, objectName));
        blob.downloadTo(destFilePath);

        System.out.println(
                "Downloaded object "
                        + objectName
                        + " from bucket name "
                        + bucket
                        + " to "
                        + destFilePath);
    }
}

