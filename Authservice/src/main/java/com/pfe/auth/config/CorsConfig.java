package com.pfe.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Autoriser les requêtes depuis l'application Angular
        config.addAllowedOrigin("http://localhost:4200");
        
        // Autoriser les méthodes HTTP
        config.addAllowedMethod("*");
        
        // Autoriser tous les headers
        config.addAllowedHeader("*");
        
        // Autoriser les credentials
        config.setAllowCredentials(true);
        
        // Configurer le temps de mise en cache des pré-vérifications CORS
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 