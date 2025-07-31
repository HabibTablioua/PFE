package org.example.responseisoservice.repository;

import org.example.responseisoservice.Entity.ImportedData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportedDataRepository extends JpaRepository<ImportedData, Long> {
    
    List<ImportedData> findAllByOrderByImportDateDesc();
    
    List<ImportedData> findByStatus(String status);
    
    ImportedData findByFileName(String fileName);
} 