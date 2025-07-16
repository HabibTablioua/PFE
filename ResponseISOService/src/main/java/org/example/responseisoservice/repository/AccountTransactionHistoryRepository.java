package org.example.responseisoservice.repository;

import org.example.responseisoservice.Entity.AccountTransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountTransactionHistoryRepository extends JpaRepository<AccountTransactionHistory, Long> {
} 