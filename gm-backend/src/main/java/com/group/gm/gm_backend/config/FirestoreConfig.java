package com.group.gm.gm_backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirestoreConfig {

    @Value("${google.cloud.projectId}")
    private String projectId;

    @Value("${firestore.use-emulator}")
    private boolean useEmulator;

    @Value("${firestore.emulator-host:localhost:8080}")
    private String emulatorHost;

    @Bean
    public Firestore firestore() throws IOException {
        FirestoreOptions.Builder firestoreOptionsBuilder = FirestoreOptions.newBuilder()
                .setProjectId(projectId).setDatabaseId("gm-db");

        if (useEmulator) {
            // Use emulator settings
            firestoreOptionsBuilder.setEmulatorHost(emulatorHost);
            System.out.println("Using Firestore Emulator at " + emulatorHost);
        }

        return firestoreOptionsBuilder.build().getService();
    }
}