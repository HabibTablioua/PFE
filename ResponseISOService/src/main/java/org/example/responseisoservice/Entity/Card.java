package org.example.responseisoservice.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Card {
    @Id
    private String pan; // Primary Account Number (numéro de carte)

    private String cardNumber; // Numéro de carte (optionnel si différent du PAN)
    private LocalDate expiryDate;
    private String status; // ACTIVE, BLOCKED, EXPIRED, etc.
    private boolean stolen;
    private boolean lost;
    private boolean blacklisted;
    private boolean restricted;
    private String type; // CREDIT, DEBIT, PREPAID, etc.
    private String issuer; // Banque émettrice
    private String holderName;
    private String allowedOperations; // Ex: "200000,310000"
    private String cvv; // À chiffrer en prod !
    private String pin; // À chiffrer en prod !
    private LocalDate createdAt;
    private LocalDate updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account; // FK vers Account (plusieurs cartes pour un compte)

    // Getters et setters
    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isStolen() { return stolen; }
    public void setStolen(boolean stolen) { this.stolen = stolen; }
    public boolean isLost() { return lost; }
    public void setLost(boolean lost) { this.lost = lost; }
    public boolean isBlacklisted() { return blacklisted; }
    public void setBlacklisted(boolean blacklisted) { this.blacklisted = blacklisted; }
    public boolean isRestricted() { return restricted; }
    public void setRestricted(boolean restricted) { this.restricted = restricted; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public String getHolderName() { return holderName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }
    public String getAllowedOperations() { return allowedOperations; }
    public void setAllowedOperations(String allowedOperations) { this.allowedOperations = allowedOperations; }
    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }
} 