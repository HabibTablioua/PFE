package org.example.responseisoservice.Controller;

import lombok.RequiredArgsConstructor;
import org.example.responseisoservice.DTO.CardResponseDto;
import org.example.responseisoservice.Entity.Card;
import org.example.responseisoservice.Service.CardService;
import org.example.responseisoservice.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/cards")
@RequiredArgsConstructor
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CardService cardService;

    // GET - Récupérer toutes les cartes
    @GetMapping
    public ResponseEntity<List<CardResponseDto>> getAllCards() {
        List<CardResponseDto> cards = cardService.getAllCards();
        return ResponseEntity.ok(cards);
    }

    // GET - Récupérer une carte par PAN
    @GetMapping("/{pan}")
    public ResponseEntity<CardResponseDto> getCardByPan(@PathVariable String pan) {
        CardResponseDto card = cardService.getCardByPan(pan);
        return card != null ? ResponseEntity.ok(card) : ResponseEntity.notFound().build();
    }

    // GET - Compter le nombre total de cartes
    @GetMapping("/count")
    public ResponseEntity<Long> countCards() {
        long count = cardService.countCards();
        return ResponseEntity.ok(count);
    }

    // GET - Compter les cartes actives
    @GetMapping("/count/active")
    public ResponseEntity<Long> countActiveCards() {
        long count = cardService.countCardsByStatus("ACTIVE");
        return ResponseEntity.ok(count);
    }

    // GET - Compter les cartes bloquées
    @GetMapping("/count/blocked")
    public ResponseEntity<Long> countBlockedCards() {
        long count = cardService.countCardsByStatus("BLOCKED");
        return ResponseEntity.ok(count);
    }

    // GET - Compter les cartes expirées
    @GetMapping("/count/expired")
    public ResponseEntity<Long> countExpiredCards() {
        long count = cardService.countExpiredCards();
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

    // DELETE - Supprimer plusieurs cartes
    @DeleteMapping("/bulk")
    public ResponseEntity<Map<String, Object>> deleteMultipleCards(@RequestBody List<String> pans) {
        if (pans == null || pans.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Liste des PANs vide"));
        }

        List<String> deletedPans = new ArrayList<>();
        List<String> notFoundPans = new ArrayList<>();

        for (String pan : pans) {
            Optional<Card> card = cardRepository.findByPan(pan);
            if (card.isPresent()) {
                cardRepository.deleteById(pan);
                deletedPans.add(pan);
            } else {
                notFoundPans.add(pan);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("deleted", deletedPans);
        response.put("notFound", notFoundPans);
        response.put("totalDeleted", deletedPans.size());
        response.put("totalNotFound", notFoundPans.size());

        return ResponseEntity.ok(response);
    }

    // GET - Récupérer les cartes par statut
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CardResponseDto>> getCardsByStatus(@PathVariable String status) {
        List<CardResponseDto> cards = cardService.getCardsByStatus(status);
        return ResponseEntity.ok(cards);
    }

    // GET - Récupérer les cartes par type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<CardResponseDto>> getCardsByType(@PathVariable String type) {
        List<CardResponseDto> cards = cardService.getCardsByType(type);
        return ResponseEntity.ok(cards);
    }

}