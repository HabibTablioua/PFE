package org.example.responseisoservice.DTO;

import java.time.LocalDate;

public class CardResponseDto {
    private String pan;
    private String cardNumber;
    private LocalDate expiryDate;
    private String status;
    private boolean stolen;
    private boolean lost;
    private boolean blacklisted;
    private boolean restricted;
    private String type;
    private String issuer;
    private String holderName;
    private String allowedOperations;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String accountPan; // Juste l'ID du compte, pas l'objet complet

    // Constructeur par défaut
    public CardResponseDto() {}

    // Constructeur avec tous les champs
    public CardResponseDto(String pan, String cardNumber, LocalDate expiryDate, String status,
                          boolean stolen, boolean lost, boolean blacklisted, boolean restricted,
                          String type, String issuer, String holderName, String allowedOperations,
                          LocalDate createdAt, LocalDate updatedAt, String accountPan) {
        this.pan = pan;
        this.cardNumber = cardNumber;
        this.expiryDate = expiryDate;
        this.status = status;
        this.stolen = stolen;
        this.lost = lost;
        this.blacklisted = blacklisted;
        this.restricted = restricted;
        this.type = type;
        this.issuer = issuer;
        this.holderName = holderName;
        this.allowedOperations = allowedOperations;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.accountPan = accountPan;
    }

    // Getters et Setters
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

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }

    public String getAccountPan() { return accountPan; }
    public void setAccountPan(String accountPan) { this.accountPan = accountPan; }
} 