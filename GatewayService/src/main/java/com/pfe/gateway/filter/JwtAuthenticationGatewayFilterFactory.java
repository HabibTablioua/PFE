package com.pfe.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    @Value("${jwt.secret:super-ultra-mega-long-secret-key-123456}")
    private String secret;

    public JwtAuthenticationGatewayFilterFactory() {
        super(Config.class);
    }

    @PostConstruct
    public void init() {
        if (secret == null || secret.isEmpty()) {
            throw new IllegalStateException("JWT secret key is not configured");
        }
        log.info("JWT Filter initialized with secret key length: {}", secret.length());
        log.info("JWT secret key starts with: {}", secret.substring(0, Math.min(10, secret.length())));
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            log.info("Processing request: {} {}", request.getMethod(), request.getURI());

            // Vérifier si le header Authorization est présent
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("Authorization header missing or invalid format");
                return onError(exchange, "Authorization header missing or invalid format", HttpStatus.UNAUTHORIZED);
            }

            // Extraire le token
            String token = authHeader.substring(7);
            log.info("Token length: {}", token.length());
            log.debug("Extracted token: {}", token); // Log the token (use debug level for sensitivity)

            try {
                log.info("Starting token validation...");
                log.debug("Secret key bytes length for validation: {}", secret.getBytes(StandardCharsets.UTF_8).length); // Log secret key info

                // Valider le token avec Keys.hmacShaKeyFor
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                log.info("Token parsing successful.");
                log.debug("Extracted claims: {}", claims); // Log extracted claims

                // Vérifier l'expiration du token
                Date expiration = claims.getExpiration();
                log.debug("Token expiration date: {}", expiration); // Log expiration date

                if (expiration != null && expiration.before(new Date())) {
                    log.error("Token has expired");
                    return onError(exchange, "Token has expired", HttpStatus.UNAUTHORIZED);
                }

                // Extraire les informations utilisateur
                String userId = claims.getSubject();
                List<String> roles = claims.get("roles", List.class);

                // Validate extracted user information
                if (userId == null || userId.isEmpty() || roles == null || roles.isEmpty()) {
                    log.error("User ID or roles are missing or empty in JWT claims. User ID: {}, Roles: {}", userId, roles);
                    return onError(exchange, "Invalid user information in token", HttpStatus.UNAUTHORIZED);
                }

                log.info("Token validated successfully for user: {}", userId);
                log.info("User roles: {}", roles);

                // Ajouter les informations utilisateur aux headers
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Roles", String.join(",", roles))
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } catch (Exception e) {
                log.error("Error validating token: {}", e.getMessage());
                log.error("Stack trace:", e);
                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        log.error("Authentication error: {}", message);
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    public static class Config {
        // Configuration si nécessaire
    }
}