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
        newUser.setRoles(Collections.singletonList("USER"));

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

        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());
        return ResponseEntity.ok(Collections.singletonMap("token", token));
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
        String email = jwtUtil.extractUsername(token); // à adapter selon ta méthode
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(null); // Ne retourne pas le mot de passe
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

}
