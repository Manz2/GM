package com.group.gm.property_backend.service;


import org.springframework.web.client.RestTemplate;import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;


public class TenantService {


    private static final String CLOUD_FUNCTION_URL = "https://europe-west1-ca-test2-438111.cloudfunctions.net/getTenantDetails";

    public String fetchTenantDetails(String tenantId, String authToken) {
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
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    CLOUD_FUNCTION_URL,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (responseEntity.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Failed to fetch tenant details: " + responseEntity.getStatusCode());
            }

            // Parse Response JSON into GmTenant object
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(responseEntity.getBody());
            JsonNode propertyDb = rootNode.path("services").path("propertyDb").path("url");

            return propertyDb.asText();

        } catch (Exception e) {
            throw new RuntimeException("Error occurred while fetching tenant details", e);
        }
    }
}

