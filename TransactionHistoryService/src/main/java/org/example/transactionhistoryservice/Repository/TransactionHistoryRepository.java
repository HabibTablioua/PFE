package org.example.transactionhistoryservice.Repository;


import org.example.transactionhistoryservice.Entite.OperationType;
import org.example.transactionhistoryservice.Entite.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long>, JpaSpecificationExecutor<TransactionHistory> {
    List<TransactionHistory> findByMti(String mti);
    List<TransactionHistory> findByFormat(String format);
    List<TransactionHistory> findBySource(String source);
    List<TransactionHistory> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query("SELECT DATE(th.createdAt) as date, COUNT(th) as count FROM TransactionHistory th GROUP BY DATE(th.createdAt) ORDER BY date")
    List<Object[]> countTransactionsGroupedByDay();

    @Query("SELECT th.status, COUNT(th) FROM TransactionHistory th GROUP BY th.status")
    List<Object[]> countByStatus();
}

