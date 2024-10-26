
package com.group.gm.gm_backend;

import com.group.gm.gm_backend.service.GoogleCloudStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
public class GmStorageTest {

    @Autowired
    GoogleCloudStorageService storageService;

    @Test
    public void testStorage() throws IOException {

        MultipartFile file = new MockMultipartFile("testName", new byte[]{10, 10, 10});
        String objectID = storageService.uploadObject(file);
        Path path = Files.createTempFile("downloadedImage", ".jpg");
        storageService.downloadObject(objectID, path);

        assertFalse(objectID.isEmpty());

    }


}

