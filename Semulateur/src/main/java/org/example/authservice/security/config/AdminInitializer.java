package org.example.authservice.security.config;


import org.example.authservice.security.Auth.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class AdminInitializer {

    private final AuthenticationService authenticationService;

    @Autowired
    public AdminInitializer(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostConstruct
    public void init() {
        authenticationService.registerAdmin();
    }
}