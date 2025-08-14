package org.example.incidentreportservice.repository;


import org.example.incidentreportservice.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    long count();
    long countByStatus(String status);
    List<IncidentReport> findByUserId(Long userId);
}
