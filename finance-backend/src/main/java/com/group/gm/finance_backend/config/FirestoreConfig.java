package com.group.gm.finance_backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;


public class FirestoreConfig {
    @Value("${firestore.db-id}")
    private final String dbId;

    public FirestoreConfig(String dbId){
        this.dbId = dbId;
    }

    @Value("google.cloud.projectId")
    private String projectId;

    private static final Logger logger = LoggerFactory.getLogger(com.group.gm.finance_backend.config.FirestoreConfig.class);

    public Firestore firestore() throws IOException {
        FirestoreOptions.Builder firestoreOptionsBuilder = FirestoreOptions.newBuilder()
                .setProjectId(projectId).setDatabaseId(dbId);

        firestoreOptionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());

        return firestoreOptionsBuilder.build().getService();
    }
}