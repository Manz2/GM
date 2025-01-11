package com.group.gm.property_backend.service;


import com.group.gm.openapi.model.GmTenant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

public class TenantService {

    @Value("google.cloud.cloudFunctionUrl")
    private String CLOUD_FUNCTION_URL;

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
                    CLOUD_FUNCTION_URL,
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

