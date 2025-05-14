
package org.example.authservice.security.Auth;



import lombok.RequiredArgsConstructor;
import org.example.authservice.security.config.JwtService;
import org.example.authservice.security.entity.Role;
import org.example.authservice.security.entity.User;
import org.example.authservice.security.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Méthode pour récupérer tous les utilisateurs
    public List<User> findAll() {
        return repository.findAll();
    }

    // Méthode pour supprimer un utilisateur par ID
    public void deleteById(Integer id) {
        if (!repository.existsById(id)) {
            throw new UsernameNotFoundException("Utilisateur avec l'ID " + id + " non trouvé");
        }
        repository.deleteById(id);
    }

    // Autres méthodes existantes
    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("L'email est déjà utilisé, Veuillez choisir une autre adresse mail!");
        }
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    public void registerAdmin() {
        if (repository.findByEmail("admine@gmail.com").isEmpty()) {
            var admin = User.builder()
                    .firstname("admine")
                    .lastname("admine")
                    .email("admine@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.ADMIN)
                    .build();
            repository.save(admin);
        }
    }

    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
    }
}
