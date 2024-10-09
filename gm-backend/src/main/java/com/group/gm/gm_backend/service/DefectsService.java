package com.group.gm.gm_backend.service;

import com.group.gm.openapi.api.ApiApiDelegate;
import com.group.gm.openapi.model.Defect;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class DefectsService implements ApiApiDelegate {

    @Override
    public ResponseEntity<Defect> callList(String id) {
        Defect defect = new Defect();
        defect.setProperty("Test Object mit id: " + id);
        return ResponseEntity.ok(defect);
    }
}
