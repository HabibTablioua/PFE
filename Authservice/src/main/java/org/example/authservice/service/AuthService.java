package org.example.authservice.service;

import lombok.RequiredArgsConstructor;
import org.example.authservice.DTO.AuthResponse;
import org.example.authservice.DTO.LoginRequest;
import org.example.authservice.DTO.RegisterRequest;
import org.example.authservice.entity.Role;
import org.example.authservice.entity.User;
import org.example.authservice.repository.UserRepository;
import org.example.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Autowired
    private  UserRepository userRepository;

    @Autowired
    private  PasswordEncoder encoder;

    @Autowired
    private  AuthenticationManager authenticationManager;

    @Autowired
    private  JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé: " + request.getEmail());
        }

        User user = new User();
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setRole(user.getRole().name());

        return response;
    }

    public AuthResponse login(LoginRequest request) {
        // ✅ Authentifie avec email + mot de passe
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String accessToken = jwtUtil.generateToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        return new AuthResponse(accessToken, refreshToken, user.getRole().name());
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String newAccessToken = jwtUtil.generateToken(email);
        String newRefreshToken = jwtUtil.generateRefreshToken(email);

        return new AuthResponse(newAccessToken, newRefreshToken, user.getRole().name());
    }

    public void deleteById(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new UsernameNotFoundException("Utilisateur avec l'ID " + id + " non trouvé");
        }
        userRepository.deleteById(id);
    }
}
