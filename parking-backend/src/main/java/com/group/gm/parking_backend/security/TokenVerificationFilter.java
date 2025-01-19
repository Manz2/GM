package com.group.gm.parking_backend.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.group.gm.openapi.model.GmTenant;
import com.group.gm.parking_backend.service.TenantService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class TokenVerificationFilter extends OncePerRequestFilter {

    private final FirebaseAuth firebaseAuth;
    private final TenantService tenantService;

    public TokenVerificationFilter(FirebaseAuth firebaseAuth,TenantService tenantService) {
        this.firebaseAuth = firebaseAuth;
        this.tenantService = tenantService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();
                String tenantId = decodedToken.getTenantId();
                GmTenant tenantInfo = tenantService.fetchTenantDetails(tenantId,token);
                Authentication authentication = new FirebaseAuthenticationToken(uid,tenantInfo);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (FirebaseAuthException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}

