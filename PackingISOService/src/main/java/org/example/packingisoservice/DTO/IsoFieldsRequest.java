package org.example.packingisoservice.DTO;

import lombok.Data;

import java.util.Map;

@Data
public class IsoFieldsRequest {
    private String mti;
    private Map<String, String> fields;
}

