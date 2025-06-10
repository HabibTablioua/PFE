package org.example.authservice.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.example.authservice.entity.Role;
import org.example.authservice.entity.User;
import org.example.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer {

    @Autowired
    private  UserRepository userRepository;

    @Autowired
    private  PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        if (userRepository.findByEmail("admine@gmail.com").isEmpty()) {
            User admin = User.builder()
                    .firstname("admine")
                    .lastname("admine")
                    .email("admine@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        }
    }
} 