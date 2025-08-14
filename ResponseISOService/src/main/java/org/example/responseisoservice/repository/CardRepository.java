package org.example.responseisoservice.repository;

import org.example.responseisoservice.Entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, String> {
    Optional<Card> findByPan(String pan);

    List<Card> findByStatus(String status);

    List<Card> findByType(String type);

    long countByStatus(String status);

    // Méthodes pour la suppression en cascade
    List<Card> findByAccount_Pan(String accountPan);

    long countByAccount_Pan(String accountPan);

    void deleteByAccount_Pan(String accountPan);
}