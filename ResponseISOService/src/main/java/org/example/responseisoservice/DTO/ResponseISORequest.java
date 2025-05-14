package org.example.responseisoservice.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseISORequest {


    private Long transactionId;
    private String isoMessage;
    private String format; // "ASCII" ou "HEX"

    public String getFormat() {
        return format;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public String getIsoMessage() {
        return isoMessage;
    }
}

