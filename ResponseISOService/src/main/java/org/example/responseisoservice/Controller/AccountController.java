package org.example.responseisoservice.Controller;

import lombok.RequiredArgsConstructor;
import org.example.responseisoservice.Entity.Account;
import org.example.responseisoservice.repository.AccountRepository;
import org.example.responseisoservice.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CardRepository cardRepository;

    // GET - Récupérer tous les comptes
    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return ResponseEntity.ok(accounts);
    }

    // GET - Récupérer un compte par PAN
    @GetMapping("/{pan}")
    public ResponseEntity<Account> getAccountByPan(@PathVariable String pan) {
        Optional<Account> account = accountRepository.findByPan(pan);
        return account.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // GET - Compter le nombre total de comptes
    @GetMapping("/count")
    public ResponseEntity<Long> countAccounts() {
        long count = accountRepository.count();
        return ResponseEntity.ok(count);
    }

    // POST - Créer un nouveau compte
    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        // Validation du PAN
        if (account.getPan() == null || account.getPan().length() != 16) {
            return ResponseEntity.badRequest().build(); // PAN invalide
        }
        
        // Validation Luhn
        if (!isValidLuhn(account.getPan())) {
            return ResponseEntity.badRequest().build(); // PAN ne respecte pas Luhn
        }
        
        // Vérification si le PAN existe déjà
        if (accountRepository.findByPan(account.getPan()).isPresent()) {
            return ResponseEntity.badRequest().build(); // PAN déjà existant
        }
        
        // Validation des données obligatoires
        if (account.getHolderName() == null || account.getHolderName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build(); // Nom du titulaire requis
        }
        
        if (account.getEmail() == null || account.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().build(); // Email requis
        }
        
        // Validation du solde
        if (account.getBalance() == null || account.getBalance().compareTo(java.math.BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().build(); // Solde invalide
        }
        
        // Validation de la devise
        if (account.getCurrency() == null || account.getCurrency().trim().isEmpty()) {
            account.setCurrency("MAD"); // Devise par défaut
        }
        
        // Validation du statut
        if (account.getStatus() == null || account.getStatus().trim().isEmpty()) {
            account.setStatus("OPEN"); // Statut par défaut
        }
        
        // Validation du type
        if (account.getType() == null || account.getType().trim().isEmpty()) {
            account.setType("CURRENT"); // Type par défaut
        }
        
        account.setCreatedAt(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());
        
        Account savedAccount = accountRepository.save(account);
        return ResponseEntity.ok(savedAccount);
    }

    // PUT - Mettre à jour un compte
    @PutMapping("/{pan}")
    public ResponseEntity<Account> updateAccount(@PathVariable String pan, @RequestBody Account accountDetails) {
        Optional<Account> accountOpt = accountRepository.findByPan(pan);
        
        if (accountOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Account account = accountOpt.get();
        
        // Validation du nouveau PAN si différent
        if (accountDetails.getPan() != null && !accountDetails.getPan().equals(pan)) {
            // Vérifier si le nouveau PAN existe déjà
            if (accountRepository.findByPan(accountDetails.getPan()).isPresent()) {
                return ResponseEntity.badRequest().build(); // Nouveau PAN déjà existant
            }
            
            // Validation Luhn pour le nouveau PAN
            if (!isValidLuhn(accountDetails.getPan())) {
                return ResponseEntity.badRequest().build(); // PAN ne respecte pas Luhn
            }
            
            account.setPan(accountDetails.getPan());
        }
        
        // Mise à jour des champs avec validation
        if (accountDetails.getAccountNumber() != null) {
            account.setAccountNumber(accountDetails.getAccountNumber());
        }
        
        if (accountDetails.getHolderName() != null) {
            if (accountDetails.getHolderName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build(); // Nom du titulaire requis
            }
            account.setHolderName(accountDetails.getHolderName());
        }
        
        if (accountDetails.getBalance() != null) {
            if (accountDetails.getBalance().compareTo(java.math.BigDecimal.ZERO) < 0) {
                return ResponseEntity.badRequest().build(); // Solde invalide
            }
            account.setBalance(accountDetails.getBalance());
        }
        
        if (accountDetails.getCurrency() != null) {
            account.setCurrency(accountDetails.getCurrency());
        }
        
        if (accountDetails.getStatus() != null) {
            account.setStatus(accountDetails.getStatus());
        }
        
        if (accountDetails.getType() != null) {
            account.setType(accountDetails.getType());
        }
        
        if (accountDetails.getEmail() != null) {
            if (accountDetails.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().build(); // Email requis
            }
            account.setEmail(accountDetails.getEmail());
        }
        
        // Mise à jour des opérations autorisées
        if (accountDetails.getAllowedOperations() != null) {
            account.setAllowedOperations(accountDetails.getAllowedOperations());
        }
        
        account.setUpdatedAt(LocalDateTime.now());
        
        Account updatedAccount = accountRepository.save(account);
        return ResponseEntity.ok(updatedAccount);
    }

    // DELETE - Supprimer un compte
    @DeleteMapping("/{pan}")
    @Transactional
    public ResponseEntity<Void> deleteAccount(@PathVariable String pan) {
        Optional<Account> account = accountRepository.findByPan(pan);
        
        if (account.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Supprimer d'abord toutes les cartes associées
        cardRepository.deleteByAccount_Pan(pan);
        
        // Puis supprimer le compte
        accountRepository.deleteById(pan);
        return ResponseEntity.ok().build();
    }

    // DELETE - Supprimer plusieurs comptes avec suppression en cascade
    @DeleteMapping("/bulk")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteMultipleAccounts(@RequestBody List<String> pans) {
        if (pans == null || pans.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Liste des PANs vide"));
        }
        
        List<String> deletedAccounts = new ArrayList<>();
        List<String> notFoundAccounts = new ArrayList<>();
        int totalCardsDeleted = 0;
        
        for (String pan : pans) {
            Optional<Account> account = accountRepository.findByPan(pan);
            if (account.isPresent()) {
                // Compter les cartes associées avant suppression
                long cardsCount = cardRepository.countByAccount_Pan(pan);
                
                // Supprimer d'abord toutes les cartes associées
                cardRepository.deleteByAccount_Pan(pan);
                
                // Puis supprimer le compte
                accountRepository.deleteById(pan);
                
                deletedAccounts.add(pan);
                totalCardsDeleted += cardsCount;
            } else {
                notFoundAccounts.add(pan);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("deletedAccounts", deletedAccounts);
        response.put("notFoundAccounts", notFoundAccounts);
        response.put("totalAccountsDeleted", deletedAccounts.size());
        response.put("totalCardsDeleted", totalCardsDeleted);
        response.put("totalNotFound", notFoundAccounts.size());
        
        return ResponseEntity.ok(response);
    }

    // GET - Rechercher des comptes par statut
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Account>> getAccountsByStatus(@PathVariable String status) {
        List<Account> accounts = accountRepository.findAll().stream()
                .filter(account -> status.equalsIgnoreCase(account.getStatus()))
                .toList();
        return ResponseEntity.ok(accounts);
    }

    // GET - Comptes avec solde positif
    @GetMapping("/positive-balance")
    public ResponseEntity<List<Account>> getAccountsWithPositiveBalance() {
        List<Account> accounts = accountRepository.findAll().stream()
                .filter(account -> account.getBalance() != null && account.getBalance().compareTo(java.math.BigDecimal.ZERO) > 0)
                .toList();
        return ResponseEntity.ok(accounts);
    }

    // Validation de l'algorithme de Luhn
    private boolean isValidLuhn(String pan) {
        if (pan == null || pan.length() < 13) {
            return false;
        }
        
        int sum = 0;
        boolean alternate = false;
        
        // Parcourir le PAN de droite à gauche
        for (int i = pan.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(pan.charAt(i));
            
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit = (digit % 10) + 1;
                }
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        return (sum % 10) == 0;
    }
}