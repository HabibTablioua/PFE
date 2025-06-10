package com.example.iso_report_service.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
@JsonInclude(JsonInclude.Include.NON_NULL)

@Data
public class ValidationRecord {
    private String id;
    private String mti;
    private String validationStatus;
    private String responseCode;
    private LocalDateTime timestamp;
    private String status;
    private String username;
    private Map<String, String> fields;

    public ValidationRecord() {

    }

    public ValidationRecord(String id, String mti, String validationStatus, String responseCode, LocalDateTime timestamp, String status, String username, Map<String, String> fields) {
        this.id = id;
        this.mti = mti;
        this.validationStatus = validationStatus;
        this.responseCode = responseCode;
        this.timestamp = timestamp;
        this.status = status;
        this.username = username;
        this.fields = fields;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMti() {
        return mti;
    }

    public void setMti(String mti) {
        this.mti = mti;
    }

    public String getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(String validationStatus) {
        this.validationStatus = validationStatus;
    }

    public String getResponseCode() {
        return responseCode;
    }

    public void setResponseCode(String responseCode) {
        this.responseCode = responseCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Map<String, String> getFields() {
        return fields;
    }

    public void setFields(Map<String, String> fields) {
        this.fields = fields;
    }
}