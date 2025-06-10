package com.example.iso_report_service.model;

import java.time.LocalDateTime;
import java.util.List;

public class TransactionReportData {
    private String transactionId;
    private String mti;
    private String status;
    private String validationStatus;
    private String username;
    private LocalDateTime timestamp;

    private List<FieldEntry> requestFields;
    private List<FieldEntry> responseFields;
    private List<LogEntry> logs;

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getMti() { return mti; }
    public void setMti(String mti) { this.mti = mti; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getValidationStatus() { return validationStatus; }
    public void setValidationStatus(String validationStatus) { this.validationStatus = validationStatus; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public List<FieldEntry> getRequestFields() { return requestFields; }
    public void setRequestFields(List<FieldEntry> requestFields) { this.requestFields = requestFields; }

    public List<FieldEntry> getResponseFields() { return responseFields; }
    public void setResponseFields(List<FieldEntry> responseFields) { this.responseFields = responseFields; }

    public List<LogEntry> getLogs() { return logs; }
    public void setLogs(List<LogEntry> logs) { this.logs = logs; }
}
