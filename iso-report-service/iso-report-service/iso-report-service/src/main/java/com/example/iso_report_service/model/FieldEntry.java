package com.example.iso_report_service.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

@Builder
public class FieldEntry {
    private String fieldName;   // e.g. "Processing Code"
    private String fieldValue;

    public FieldEntry(String fieldName, String fieldValue) {
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }
    public FieldEntry() {};

}
