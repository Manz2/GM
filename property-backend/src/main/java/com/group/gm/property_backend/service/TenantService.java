package com.group.gm.property_backend.service;

import com.group.gm.openapi.model.GmTenant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class TenantService {

    private final String cloudFunctionUrl;

    // Konstruktor-basierte Injection
    public TenantService(@Value("${google.cloud.cloudFunctionUrl}") String cloudFunctionUrl) {
        this.cloudFunctionUrl = cloudFunctionUrl;
    }

    public GmTenant fetchTenantDetails(String tenantId, String authToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // HTTP Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + authToken);

            // Request Body
            String requestBody = String.format("{\"tenantId\": \"%s\"}", tenantId);

            // HTTP Entity
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            // Make POST Request
            ResponseEntity<GmTenant> responseEntity = restTemplate.exchange(
                    cloudFunctionUrl, // Verwenden der injizierten URL
                    HttpMethod.POST,
                    requestEntity,
                    GmTenant.class
            );

            if (responseEntity.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Failed to fetch tenant details: " + responseEntity.getStatusCode());
            }
            return responseEntity.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while fetching tenant details", e);
        }
    }
}
