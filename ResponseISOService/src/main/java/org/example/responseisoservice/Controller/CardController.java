package org.example.responseisoservice.Controller;

import lombok.RequiredArgsConstructor;
import org.example.responseisoservice.Entity.Card;
import org.example.responseisoservice.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/cards")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    // GET - Récupérer toutes les cartes
    @GetMapping
    public ResponseEntity<List<Card>> getAllCards() {
        List<Card> cards = cardRepository.findAll();
        return ResponseEntity.ok(cards);
    }

    // GET - Récupérer une carte par PAN
    @GetMapping("/{pan}")
    public ResponseEntity<Card> getCardByPan(@PathVariable String pan) {
        Optional<Card> card = cardRepository.findByPan(pan);
        return card.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // GET - Compter le nombre total de cartes
    @GetMapping("/count")
    public ResponseEntity<Long> countCards() {
        long count = cardRepository.count();
        return ResponseEntity.ok(count);
    }

    // GET - Compter les cartes actives
    @GetMapping("/count/active")
    public ResponseEntity<Long> countActiveCards() {
        long count = cardRepository.countByStatus("ACTIVE");
        return ResponseEntity.ok(count);
    }

    // GET - Compter les cartes bloquées
    @GetMapping("/count/blocked")
    public ResponseEntity<Long> countBlockedCards() {
        long count = cardRepository.countByStatus("BLOCKED");
        return ResponseEntity.ok(count);
    }

    // POST - Créer une nouvelle carte
    @PostMapping
    public ResponseEntity<Card> createCard(@RequestBody Card card) {
        // Validation du PAN
        if (card.getPan() == null || card.getPan().length() != 16) {
            return ResponseEntity.badRequest().build(); // PAN invalide
        }
        
        // Vérification si le PAN existe déjà
        if (cardRepository.findByPan(card.getPan()).isPresent()) {
            return ResponseEntity.badRequest().build(); // PAN déjà existant
        }
        
        // Validation des données obligatoires
        if (card.getHolderName() == null || card.getHolderName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build(); // Nom du titulaire requis
        }
        
        // Validation de la date d'expiration
        if (card.getExpiryDate() == null) {
            return ResponseEntity.badRequest().build(); // Date d'expiration requise
        }
        
        // Validation du statut
        if (card.getStatus() == null || card.getStatus().trim().isEmpty()) {
            card.setStatus("ACTIVE"); // Statut par défaut
        }
        
        // Validation du type
        if (card.getType() == null || card.getType().trim().isEmpty()) {
            card.setType("DEBIT"); // Type par défaut
        }
        
        card.setCreatedAt(LocalDate.now());
        card.setUpdatedAt(LocalDate.now());
        
        Card savedCard = cardRepository.save(card);
        return ResponseEntity.ok(savedCard);
    }

    // PUT - Mettre à jour une carte
    @PutMapping("/{pan}")
    public ResponseEntity<Card> updateCard(@PathVariable String pan, @RequestBody Card cardDetails) {
        Optional<Card> cardOpt = cardRepository.findByPan(pan);
        
        if (cardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Card card = cardOpt.get();
        
        // Mise à jour des champs
        if (cardDetails.getCardNumber() != null) {
            card.setCardNumber(cardDetails.getCardNumber());
        }
        if (cardDetails.getExpiryDate() != null) {
            card.setExpiryDate(cardDetails.getExpiryDate());
        }
        if (cardDetails.getStatus() != null) {
            card.setStatus(cardDetails.getStatus());
        }
        if (cardDetails.getType() != null) {
            card.setType(cardDetails.getType());
        }
        if (cardDetails.getIssuer() != null) {
            card.setIssuer(cardDetails.getIssuer());
        }
        if (cardDetails.getHolderName() != null) {
            card.setHolderName(cardDetails.getHolderName());
        }
        if (cardDetails.getAllowedOperations() != null) {
            card.setAllowedOperations(cardDetails.getAllowedOperations());
        }
        
        // Mise à jour des flags
        card.setStolen(cardDetails.isStolen());
        card.setLost(cardDetails.isLost());
        card.setBlacklisted(cardDetails.isBlacklisted());
        card.setRestricted(cardDetails.isRestricted());
        
        card.setUpdatedAt(LocalDate.now());
        
        Card updatedCard = cardRepository.save(card);
        return ResponseEntity.ok(updatedCard);
    }

    // DELETE - Supprimer une carte
    @DeleteMapping("/{pan}")
    public ResponseEntity<Void> deleteCard(@PathVariable String pan) {
        Optional<Card> card = cardRepository.findByPan(pan);
        
        if (card.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        cardRepository.deleteById(pan);
        return ResponseEntity.ok().build();
    }

    // GET - Récupérer les cartes par statut
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Card>> getCardsByStatus(@PathVariable String status) {
        List<Card> cards = cardRepository.findByStatus(status);
        return ResponseEntity.ok(cards);
    }

    // GET - Récupérer les cartes par type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Card>> getCardsByType(@PathVariable String type) {
        List<Card> cards = cardRepository.findByType(type);
        return ResponseEntity.ok(cards);
    }
} 