package com.group.gm.parking_backend.security;

import com.group.gm.openapi.model.GmTenant;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;

public class FirebaseAuthenticationToken implements Authentication {
    private final String uid;
    private final GmTenant gmTenant;

    public FirebaseAuthenticationToken(String uid, GmTenant gmTenant) {
        this.uid = uid;
        this.gmTenant = gmTenant;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Implementiere Berechtigungen, falls erforderlich
        return Collections.emptyList();
    }

    @Override
    public Object getCredentials() {
        return gmTenant.getId();
    }

    @Override
    public Object getDetails() {
        return gmTenant;
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
}

