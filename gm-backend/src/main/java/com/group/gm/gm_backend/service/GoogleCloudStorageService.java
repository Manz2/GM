
package com.group.gm.gm_backend.service;


import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
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


        // MIME-Type ermitteln
        String contentType = file.getContentType();
        String extension;

        // Dateiendung basierend auf dem MIME-Type bestimmen
        switch (contentType) {
            case "image/png":
                extension = ".png";
                break;
            case "image/jpeg":
                extension = ".jpg";
                break;
            case "image/gif":
                extension = ".gif";
                break;
            case "image/bmp":
                extension = ".bmp";
                break;
            case "image/heic":
                extension = ".heic";
                break;
            case "image/heif":
                extension = ".heif";
                break;
            default:
                throw new IllegalArgumentException("Unsupported file format. Only common image and video formats are allowed.");
        }


        String objectName = UUID.randomUUID() + extension;
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

    public static void deleteObject(String projectId, String bucketName, String objectName) {
        // The ID of your GCP project
        // String projectId = "your-project-id";

        // The ID of your GCS bucket
        // String bucketName = "your-unique-bucket-name";

        // The ID of your GCS object
        // String objectName = "your-object-name";

        Storage storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
        Blob blob = storage.get(bucketName, objectName);
        if (blob == null) {
            System.out.println("The object " + objectName + " wasn't found in " + bucketName);
            return;
        }
        BlobId idWithGeneration = blob.getBlobId();
        // Deletes the blob specified by its id. When the generation is present and non-null it will be
        // specified in the request.
        // If versioning is enabled on the bucket and the generation is present in the delete request,
        // only the version of the object with the matching generation will be deleted.
        // If instead you want to delete the current version, the generation should be dropped by
        // performing the following.
        // BlobId idWithoutGeneration =
        //    BlobId.of(idWithGeneration.getBucket(), idWithGeneration.getName());
        // storage.delete(idWithoutGeneration);
        storage.delete(idWithGeneration);

        System.out.println("Object " + objectName + " was permanently deleted from " + bucketName);
    }
}

