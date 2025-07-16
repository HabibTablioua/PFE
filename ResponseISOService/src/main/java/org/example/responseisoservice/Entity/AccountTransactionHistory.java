package org.example.responseisoservice.Entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class AccountTransactionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String pan;
    private Long accountId;
    private BigDecimal amount;
    private String type; // DEBIT, CREDIT
    private String status; // SUCCESS, FAILED
    private String isoMessage;
    private LocalDateTime createdAt = LocalDateTime.now();
    private String message;

    // Getters et setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getIsoMessage() { return isoMessage; }
    public void setIsoMessage(String isoMessage) { this.isoMessage = isoMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
} 