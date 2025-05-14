package org.example.transactionhistoryservice.Repository;


import org.example.transactionhistoryservice.Entite.OperationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OperationTypeRepository extends JpaRepository<OperationType, Long> {
    Optional<OperationType> findByCode(String code);
}