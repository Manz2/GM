package com.group.gm.gm_backend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Pfad, für den CORS aktiviert werden soll
                .allowedOrigins("http://localhost:3000") // Erlaube Anfragen von diesem Ursprung
                .allowedMethods("GET", "POST", "PUT", "DELETE") // Erlaubte HTTP-Methoden
                .allowedHeaders("*"); // Erlaube alle Header
    }
}

