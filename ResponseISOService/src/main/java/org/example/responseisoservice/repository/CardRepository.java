package org.example.responseisoservice.repository;

import org.example.responseisoservice.Entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, String> {
    Optional<Card> findByPan(String pan);
} 