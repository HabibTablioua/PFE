package com.example.auth_service2.controller;

import com.example.auth_service2.model.User;
import com.example.auth_service2.repository.UserRepository;
import com.example.auth_service2.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Initialise l'utilisateur admin par défaut au démarrage
     */
    @PostConstruct
    public void initializeAdmin() {
        // Vérifier si l'admin existe déjà
        Optional<User> adminOpt = userRepository.findByEmail("admin@gmail.com");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setFirstname("Administrateur");
            admin.setLastname("Principal");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRoles(Collections.singletonList("ADMIN"));
            admin.setStatus("offline");
            
            userRepository.save(admin);
            System.out.println("✅ Utilisateur admin créé avec succès: admin@gmail.com / 123456");
        } else {
            System.out.println("ℹ️ L'utilisateur admin existe déjà");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request){
        String firstname = request.get("firstname");
        String lastname = request.get("lastname");
        String email = request.get("email");
        if (email != null) email = email.trim();
        String password = request.get("password");

        if (firstname == null || lastname == null || email == null || password == null) {
            return ResponseEntity.status(422).body("All fields are required.");
        }

        // Vérifie si l'email existe déjà
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body("Email already exists.");
        }

        User newUser = new User();
        newUser.setFirstname(firstname);
        newUser.setLastname(lastname);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRoles(Collections.singletonList("USER")); // Par défaut, rôle USER

        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        User user = userOpt.get();

        // ✅ Mettre le status à online
        user.setStatus("online");
        userRepository.save(user);

        // Créer la réponse avec plus d'informations
        Map<String, Object> response = Map.of(
            "token", jwtUtil.generateToken(user.getEmail(), user.getRoles()),
            "user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstname", user.getFirstname(),
                "lastname", user.getLastname(),
                "roles", user.getRoles(),
                "status", user.getStatus()
            )
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // ✅ Mettre le status à offline
            user.setStatus("offline");
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User logged out successfully"));
        }

        return ResponseEntity.status(404).body("User not found");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        String token = authorizationHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(null); // Ne retourne pas le mot de passe
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    /**
     * Endpoint pour vérifier si l'utilisateur est admin
     */
    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdmin(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        
        String token = authorizationHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean isAdmin = user.isAdmin();
            return ResponseEntity.ok(Map.of("isAdmin", isAdmin, "roles", user.getRoles()));
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}