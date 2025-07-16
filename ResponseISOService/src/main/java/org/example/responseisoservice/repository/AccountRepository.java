package org.example.responseisoservice.repository;

import org.example.responseisoservice.Entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByPan(String pan);
} 