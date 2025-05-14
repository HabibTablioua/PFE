package org.example.packingisoservice.DTO;

import lombok.Data;
import java.util.Map;

@Data
public class PackingISORequest {
    private String mti;
    private Map<Integer, String> fields;
}
