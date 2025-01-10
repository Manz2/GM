package com.group.gm.owner_backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Configuration
public class FirestoreConfig {

    @Value("${google.cloud.projectId}")
    private String projectId;

    @Value("${firestore.use-emulator}")
    private boolean useEmulator;

    @Value("${firestore.emulator-host:localhost:8080}")
    private String emulatorHost;

    @Value("${firestore.db-id}")
    private String dbId;

    private static final Logger logger = LoggerFactory.getLogger(FirestoreConfig.class);

    @Bean
    public Firestore firestore() throws IOException {
        FirestoreOptions.Builder firestoreOptionsBuilder = FirestoreOptions.newBuilder()
                .setProjectId(projectId).setDatabaseId(dbId);

        if (useEmulator) {
            // Use emulator settings
            firestoreOptionsBuilder.setEmulatorHost(emulatorHost);
            logger.info("Using Firestore Emulator at {}", emulatorHost);
        } else {
            // Use actual Firestore credentials
            firestoreOptionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
        }

        return firestoreOptionsBuilder.build().getService();
    }
}