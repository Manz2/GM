/*
package com.group.gm.gm_backend;

import com.group.gm.gm_backend.service.StorageService;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class GmStorageTest {

    @Test
    public void testStorage() throws IOException {

        StorageService.uploadObject("ca-test2-438111","gm-storage-ca","test/test.txt","./test.txt");
        StorageService.downloadObject("ca-test2-438111","gm-storage-ca","test/test.txt","./test2.txt");
        String content = "";
        try (BufferedReader reader = new BufferedReader(new FileReader("./test2.txt"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                content = line;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        assertEquals("test1234", content);

    }


}
*/
