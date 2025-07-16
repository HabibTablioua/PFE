package org.example.responseisoservice.repository;

import org.example.responseisoservice.Entity.PinTryCounter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PinTryCounterRepository extends JpaRepository<PinTryCounter, String> {} 