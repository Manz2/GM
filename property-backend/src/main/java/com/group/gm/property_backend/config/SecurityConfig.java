package com.group.gm.property_backend.config;

import com.google.firebase.auth.FirebaseAuth;
import com.group.gm.openapi.model.User;
import com.group.gm.property_backend.db.GMDBService;
import com.group.gm.property_backend.security.TokenVerificationFilter;
import com.group.gm.property_backend.service.TenantService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class SecurityConfig {


    private final FirebaseAuth firebaseAuth;
    private final TenantService tenantService;
    private final GMDBService<User> gmdbService;

    public SecurityConfig(FirebaseAuth firebaseAuth, TenantService tenantService, GMDBService<User> gmdbService) {
        this.firebaseAuth = firebaseAuth;
        this.tenantService = tenantService;
        this.gmdbService = gmdbService;
    }

    @Bean
    public TokenVerificationFilter tokenVerificationFilter() {
        return new TokenVerificationFilter(firebaseAuth, tenantService,gmdbService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable(); // CORS und CSRF deaktivieren, wenn erforderlich

        http.addFilterBefore(tokenVerificationFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeRequests()
                .requestMatchers("/api").authenticated()
                .anyRequest().permitAll();

        return http.build();
    }


    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("*");
        corsConfiguration.addAllowedMethod("GET");
        corsConfiguration.addAllowedMethod("POST");
        corsConfiguration.addAllowedMethod("PUT");
        corsConfiguration.addAllowedMethod("DELETE");
        corsConfiguration.addAllowedHeader("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return new CorsFilter(source);
    }
}
