package com.group.gm.property_backend.security;

import com.group.gm.openapi.model.GmTenant;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;

public class FirebaseAuthenticationToken implements Authentication {
    private final String uid;
    private final String tenantId;
    private final String dbId;

    public FirebaseAuthenticationToken(String uid, String tenantId, String dbId) {
        this.uid = uid;
        this.tenantId = tenantId;
        this.dbId = dbId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Implementiere Berechtigungen, falls erforderlich
        return Collections.emptyList();
    }

    @Override
    public Object getCredentials() {
        return tenantId;
    }

    @Override
    public Object getDetails() {
        return dbId;
    }

    @Override
    public Object getPrincipal() {
        return uid; // UID aus dem Firebase-Token
    }

    @Override
    public boolean isAuthenticated() {
        return true; // Als authentifiziert markiert, wenn das Token validiert wurde
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        // Implementiere, falls benötigt
    }

    @Override
    public String getName() {
        return uid;
    }

    public String getTenantId() {
        return tenantId;
    }
}

