package org.example.responseisoservice.Entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class ResponseISOHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mti;
    @Lob
    private String fields; // JSON ou String
    @Lob
    private String messageIso;
    private String format;
    private String status;
    private LocalDateTime createdAt = LocalDateTime.now();
    private String cause;

    // Getters et setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMti() { return mti; }
    public void setMti(String mti) { this.mti = mti; }
    public String getFields() { return fields; }
    public void setFields(String fields) { this.fields = fields; }
    public String getMessageIso() { return messageIso; }
    public void setMessageIso(String messageIso) { this.messageIso = messageIso; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getCause() { return cause; }
    public void setCause(String cause) { this.cause = cause; }
} 