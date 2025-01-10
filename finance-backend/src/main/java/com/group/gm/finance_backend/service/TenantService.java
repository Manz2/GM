package com.group.gm.finance_backend.service;


import com.group.gm.openapi.model.GmTenant;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

public class TenantService {


    private static final String CLOUD_FUNCTION_URL = "https://europe-west1-ca-test2-438111.cloudfunctions.net/getTenantDetails";

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

