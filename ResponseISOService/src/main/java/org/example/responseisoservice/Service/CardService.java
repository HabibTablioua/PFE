package org.example.responseisoservice.Service;

import org.example.responseisoservice.DTO.CardResponseDto;
import org.example.responseisoservice.Entity.Card;
import org.example.responseisoservice.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    public List<CardResponseDto> getAllCards() {
        List<Card> cards = cardRepository.findAll();
        return cards.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CardResponseDto getCardByPan(String pan) {
        return cardRepository.findByPan(pan)
                .map(this::convertToDto)
                .orElse(null);
    }

    public List<CardResponseDto> getCardsByStatus(String status) {
        List<Card> cards = cardRepository.findByStatus(status);
        return cards.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<CardResponseDto> getCardsByType(String type) {
        List<Card> cards = cardRepository.findByType(type);
        return cards.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public long countCards() {
        return cardRepository.count();
    }

    public long countCardsByStatus(String status) {
        return cardRepository.countByStatus(status);
    }

    public long countExpiredCards() {
        List<Card> allCards = cardRepository.findAll();
        LocalDate today = LocalDate.now();

        return allCards.stream()
                .filter(card -> card.getExpiryDate() != null && card.getExpiryDate().isBefore(today))
                .count();
    }

    private CardResponseDto convertToDto(Card card) {
        return new CardResponseDto(
                card.getPan(),
                card.getCardNumber(),
                card.getExpiryDate(),
                card.getStatus(),
                card.isStolen(),
                card.isLost(),
                card.isBlacklisted(),
                card.isRestricted(),
                card.getType(),
                card.getIssuer(),
                card.getHolderName(),
                card.getAllowedOperations(),
                card.getCreatedAt(),
                card.getUpdatedAt(),
                card.getAccount() != null ? card.getAccount().getPan() : null
        );
    }
}