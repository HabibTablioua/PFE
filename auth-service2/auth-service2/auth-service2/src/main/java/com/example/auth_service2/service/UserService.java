package com.example.auth_service2.service;

import com.example.auth_service2.model.User;
import com.example.auth_service2.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        log.info("[UserService] Récupération de tous les utilisateurs");
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        log.info("[UserService] Recherche utilisateur par id: {}", id);
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        log.info("[UserService] Recherche utilisateur par email: {}", email);
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        log.info("[UserService] Création utilisateur: {}", user.getEmail());
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            log.warn("[UserService] Email déjà existant: {}", user.getEmail());
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> updateUser(Long id, User updatedUser) {
        log.info("[UserService] Mise à jour utilisateur id: {}", id);
        return userRepository.findById(id).map(existing -> {
            existing.setFirstname(updatedUser.getFirstname());
            existing.setLastname(updatedUser.getLastname());
            existing.setEmail(updatedUser.getEmail());
            existing.setRoles(updatedUser.getRoles());
            
            // Encoder le mot de passe seulement s'il est fourni et non vide
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
                existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            
            return userRepository.save(existing);
        });
    }

    public boolean deleteUser(Long id) {
        log.info("[UserService] Suppression utilisateur id: {}", id);
        if (!userRepository.existsById(id)) return false;
        userRepository.deleteById(id);
        return true;
    }

    public byte[] exportUsersPdf() throws Exception {
        List<User> users = userRepository.findAll();
        InputStream reportStream = new ClassPathResource("templates/users_report.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(users);
        Map<String, Object> params = new HashMap<>();
        params.put("createdBy", "UserService");
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

    public long countUsers() {
        return userRepository.count();
    }
}
