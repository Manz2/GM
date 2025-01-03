package com.group.gm.finance_backend.service;

import com.group.gm.openapi.api.HealthApiDelegate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class HealthService implements HealthApiDelegate {

    @Override
    public ResponseEntity<Void> health() {
        return ResponseEntity.ok().build();
    }
}
