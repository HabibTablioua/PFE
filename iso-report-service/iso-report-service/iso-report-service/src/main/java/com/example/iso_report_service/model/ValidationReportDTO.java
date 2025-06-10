package com.example.iso_report_service.model;

import com.example.iso_report_service.model.ValidationRecord;

public class ValidationReportDTO {

    private String transactionId;
    private String timestamp;
    private String status;
    private String mti;
    private String responseCode;
    private String username;
    private String validationStatus;
    public ValidationReportDTO(ValidationRecord record) {
        if (record.getFields() != null) {
            this.transactionId = record.getFields().get("Retrieval Reference Number (RRN)");
        }
        this.timestamp = record.getTimestamp() != null ? record.getTimestamp().toString() : null;
        this.status = record.getStatus();
        this.mti = record.getMti();
        this.responseCode = record.getResponseCode();
        this.username = record.getUsername();
        this.validationStatus = record.getValidationStatus();

    }


    // Getters (required for JasperReports)

    public String getTransactionId() {
        return transactionId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getStatus() {
        return status;
    }

    public String getMti() {
        return mti;
    }

    public String getResponseCode() {
        return responseCode;
    }

    public String getUsername() {
        return username;
    }

    public String getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(String validationStatus) {
        this.validationStatus = validationStatus;
    }
}