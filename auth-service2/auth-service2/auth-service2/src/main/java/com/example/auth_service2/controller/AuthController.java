package com.example.auth_service2.controller;

import com.example.auth_service2.model.User;
import com.example.auth_service2.repository.UserRepository;
import com.example.auth_service2.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String firstname = request.get("firstname");
        String lastname = request.get("lastname");
        String email = request.get("email");
        String password = request.get("password");

        if (firstname == null || lastname == null || email == null || password == null) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        // Vérifie si l'email existe déjà
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }

        User newUser = new User();
        newUser.setFirstname(firstname);
        newUser.setLastname(lastname);
        newUser.setEmail(email);
        newUser.setPassword(password); // 🔐 À chiffrer en prod
        newUser.setRoles(Collections.singletonList("USER"));

        userRepository.save(newUser);

        return ResponseEntity.ok("User registered successfully.");
    }



    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }

}
