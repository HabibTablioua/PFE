package org.example.responseisoservice.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imported_data")
public class ImportedData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "import_date", nullable = false)
    private LocalDateTime importDate;
    
    @Column(name = "status", nullable = false)
    private String status; // SUCCESS, ERROR, PROCESSING
    
    @Column(name = "records_count")
    private Integer recordsCount;
    
    @Column(name = "message", length = 1000)
    private String message;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "content_type")
    private String contentType;

    // Constructeurs
    public ImportedData() {
        this.importDate = LocalDateTime.now();
    }

    public ImportedData(String fileName, String status, Integer recordsCount) {
        this();
        this.fileName = fileName;
        this.status = status;
        this.recordsCount = recordsCount;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public LocalDateTime getImportDate() {
        return importDate;
    }

    public void setImportDate(LocalDateTime importDate) {
        this.importDate = importDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRecordsCount() {
        return recordsCount;
    }

    public void setRecordsCount(Integer recordsCount) {
        this.recordsCount = recordsCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    @Override
    public String toString() {
        return "ImportedData{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                ", importDate=" + importDate +
                ", status='" + status + '\'' +
                ", recordsCount=" + recordsCount +
                ", message='" + message + '\'' +
                ", filePath='" + filePath + '\'' +
                ", fileSize=" + fileSize +
                ", contentType='" + contentType + '\'' +
                '}';
    }
} 