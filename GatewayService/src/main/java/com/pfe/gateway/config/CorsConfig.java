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
        // Définir une seule origine autorisée pour éviter les doublons d'en-têtes
        corsConfig.setAllowedOriginPatterns(java.util.Arrays.asList("http://localhost:4200/"));
        // Autoriser toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
        corsConfig.addAllowedMethod("*");
        // Autoriser tous les en-têtes HTTP
        corsConfig.addAllowedHeader("*");
        // Autoriser l'envoi de cookies et d'informations d'authentification
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Appliquer cette configuration CORS à tous les chemins d'URL
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
} 