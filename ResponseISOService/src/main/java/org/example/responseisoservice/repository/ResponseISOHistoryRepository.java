package org.example.responseisoservice.repository;

import org.example.responseisoservice.Entity.ResponseISOHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponseISOHistoryRepository extends JpaRepository<ResponseISOHistory, Long> {
    long countByStatus(String status);
    long countByStatusIs(String status);
} 