package org.example.transactionhistoryservice.Repository;


import org.example.transactionhistoryservice.Entite.OperationType;
import org.example.transactionhistoryservice.Entite.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    List<TransactionHistory> findByMti(String mti);
    List<TransactionHistory> findByFormat(String format);
    List<TransactionHistory> findBySource(String source);
    List<TransactionHistory> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}

