package com.example.auth_service2.repository;

import com.example.auth_service2.model.User;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    long count();
    long countByStatus(String status);
}
