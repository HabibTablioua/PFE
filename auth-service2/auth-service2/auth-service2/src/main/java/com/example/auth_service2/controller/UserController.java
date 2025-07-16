package com.example.auth_service2.controller;

import com.example.auth_service2.model.User;
import com.example.auth_service2.repository.UserRepository;
import com.example.auth_service2.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        log.info("[UserController] GET /users appelé");
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        log.info("[UserController] GET /users/{} appelé", id);
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        log.info("[UserController] GET /users/email/{} appelé", email);
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportUsersPdf() throws Exception {
        byte[] pdf = userService.exportUsersPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "users_report.pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        log.info("[UserController] POST /users appelé avec user: {}", user.getEmail());
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        log.info("[UserController] PUT /users/{} appelé", id);
        return userService.updateUser(id, updatedUser)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        log.info("[UserController] DELETE /users/{} appelé", id);
        return userService.deleteUser(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}

