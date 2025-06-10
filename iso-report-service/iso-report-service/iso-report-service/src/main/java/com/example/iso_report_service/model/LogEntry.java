package com.example.iso_report_service.model;

public class LogEntry {
    private String logTimestamp;
    private String logType;
    private String logMessage;

    public LogEntry(String logTimestamp, String logType, String logMessage) {
        this.logTimestamp = logTimestamp;
        this.logType = logType;
        this.logMessage = logMessage;

    }

    public String getLogTimestamp() {
        return logTimestamp;
    }

    public void setLogTimestamp(String logTimestamp) {
        this.logTimestamp = logTimestamp;
    }

    public String getLogType() {
        return logType;
    }

    public void setLogType(String logType) {
        this.logType = logType;
    }

    public String getLogMessage() {
        return logMessage;
    }

    public void setLogMessage(String logMessage) {
        this.logMessage = logMessage;
    }
}