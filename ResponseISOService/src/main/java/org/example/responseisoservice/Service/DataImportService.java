package org.example.responseisoservice.Service;

import org.example.responseisoservice.Entity.ImportedData;
import org.example.responseisoservice.repository.ImportedDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DataImportService {

    @Autowired
    private ImportedDataRepository importedDataRepository;

    private final Path uploadDirectory = Paths.get("uploads");

    public DataImportService() {
        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire d'upload", e);
        }
    }

    public ImportedData processFile(MultipartFile file) throws IOException {
        // Créer l'entrée en base de données
        ImportedData importedData = new ImportedData();
        importedData.setFileName(file.getOriginalFilename());
        importedData.setStatus("PROCESSING");
        importedData.setFileSize(file.getSize());
        importedData.setContentType(file.getContentType());
        
        // Sauvegarder en base
        importedData = importedDataRepository.save(importedData);

        try {
            // Générer un nom de fichier unique
            String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadDirectory.resolve(uniqueFileName);
            
            // Sauvegarder le fichier
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Mettre à jour le chemin du fichier
            importedData.setFilePath(filePath.toString());
            
            // Traiter le fichier selon son type
            int recordsCount = processFileContent(file, filePath);
            
            // Mettre à jour le statut
            importedData.setStatus("SUCCESS");
            importedData.setRecordsCount(recordsCount);
            importedData.setMessage("Fichier importé avec succès. " + recordsCount + " enregistrements traités.");
            
        } catch (Exception e) {
            importedData.setStatus("ERROR");
            importedData.setMessage("Erreur lors du traitement: " + e.getMessage());
            importedData.setRecordsCount(0);
        }
        
        return importedDataRepository.save(importedData);
    }

    private int processFileContent(MultipartFile file, Path filePath) throws IOException {
        String fileName = file.getOriginalFilename();
        String contentType = file.getContentType();
        
        if (fileName == null) {
            throw new IOException("Nom de fichier invalide");
        }
        
        // Traitement selon le type de fichier
        if (fileName.toLowerCase().endsWith(".csv")) {
            return processCsvFile(filePath);
        } else if (fileName.toLowerCase().endsWith(".json")) {
            return processJsonFile(filePath);
        } else if (fileName.toLowerCase().endsWith(".xml")) {
            return processXmlFile(filePath);
        } else if (fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls")) {
            return processExcelFile(filePath);
        } else {
            // Pour les autres types, on compte juste les lignes
            return countLines(filePath);
        }
    }

    private int processCsvFile(Path filePath) throws IOException {
        // Lecture simple du CSV pour compter les lignes
        List<String> lines = Files.readAllLines(filePath);
        return Math.max(0, lines.size() - 1); // Exclure l'en-tête
    }

    private int processJsonFile(Path filePath) throws IOException {
        // Lecture simple du JSON
        String content = Files.readString(filePath);
        // Compter les objets JSON (approximation simple)
        return content.split("\\{").length - 1;
    }

    private int processXmlFile(Path filePath) throws IOException {
        // Lecture simple du XML
        String content = Files.readString(filePath);
        // Compter les éléments (approximation simple)
        return content.split("<").length / 2;
    }

    private int processExcelFile(Path filePath) throws IOException {
        // Pour Excel, on utilise une approximation basée sur la taille
        long fileSize = Files.size(filePath);
        return (int) (fileSize / 1000); // Approximation
    }

    private int countLines(Path filePath) throws IOException {
        List<String> lines = Files.readAllLines(filePath);
        return lines.size();
    }

    public List<ImportedData> getImportHistory() {
        return importedDataRepository.findAllByOrderByImportDateDesc();
    }

    public Resource getFileAsResource(String fileName) throws IOException {
        ImportedData importedData = importedDataRepository.findByFileName(fileName);
        if (importedData == null || importedData.getFilePath() == null) {
            throw new IOException("Fichier non trouvé");
        }
        
        Path filePath = Paths.get(importedData.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("Fichier non accessible");
        }
    }

    public void deleteImport(Long id) {
        ImportedData importedData = importedDataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Import non trouvé"));
        
        // Supprimer le fichier physique
        if (importedData.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(importedData.getFilePath()));
            } catch (IOException e) {
                // Log l'erreur mais continue la suppression en base
                System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
            }
        }
        
        // Supprimer l'entrée en base
        importedDataRepository.delete(importedData);
    }
} 