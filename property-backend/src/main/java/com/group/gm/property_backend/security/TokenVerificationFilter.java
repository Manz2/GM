package com.group.gm.property_backend.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.group.gm.openapi.model.GmTenant;
import com.group.gm.openapi.model.User;
import com.group.gm.property_backend.db.GMDBService;
import com.group.gm.property_backend.service.TenantService;
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
    private final GMDBService<User> gmdbService;

    public TokenVerificationFilter(FirebaseAuth firebaseAuth,TenantService tenantService, GMDBService<User> gmdbService ) {
        this.firebaseAuth = firebaseAuth;
        this.tenantService = tenantService;
        this.gmdbService = gmdbService;
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
                User user = gmdbService.getById(uid);
                if(user == null){
                    //Temporary Fix because root admin is not in user db. Not security relevant because if the user would
                    // not exist then the error would occur earlier and the only user with no role is the root adim
                    user = new User();
                    user.setRole(User.RoleEnum.ADMIN);
                }
                if("/api/users".equals(request.getRequestURI())) {
                    if(!user.getRole().equals(User.RoleEnum.ADMIN)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }
                } else if("/api/properties".equals(request.getRequestURI())) {
                    if(!user.getRole().equals(User.RoleEnum.ADMIN) && !user.getRole().equals(User.RoleEnum.OPERATIONS)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }
                } else if("/api/defects".equals(request.getRequestURI())) {
                    if(!user.getRole().equals(User.RoleEnum.ADMIN) && !user.getRole().equals(User.RoleEnum.OPERATIONS) && !user.getRole().equals(User.RoleEnum.FACILITY)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }
                }

            } catch (FirebaseAuthException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
