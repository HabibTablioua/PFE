package com.pfe.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Utiliser setAllowedOrigins au lieu de setAllowedOriginPatterns pour éviter les conflits
        corsConfig.setAllowedOrigins(java.util.Arrays.asList("http://localhost:4200"));
        
        // Autoriser toutes les méthodes HTTP
        corsConfig.addAllowedMethod("*");
        
        // Autoriser tous les en-têtes HTTP
        corsConfig.addAllowedHeader("*");
        
        // Autoriser l'envoi de cookies et d'informations d'authentification
        corsConfig.setAllowCredentials(true);
        
        // Autoriser les en-têtes d'exposition
        corsConfig.addExposedHeader("Authorization");
        corsConfig.addExposedHeader("Content-Type");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
} 