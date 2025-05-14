package org.example.authservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api")
public class AuthController {

    @GetMapping("/public")
    public String publicAccess() {
        return "Public endpoint accessible sans authentification.";
    }

    @GetMapping("/private")
    public String privateAccess(Principal principal) {
        return "Bienvenue " + principal.getName() + ", vous êtes authentifié !";
    }
}

