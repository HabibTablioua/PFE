package org.example.responseisoservice.DTO;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseISOResponse {


    private String status;
    private String message;
    private Map<String, Object> details;

    public void setStatus(String status) {
        this.status = status;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }

    public Map<String, Object> getDetails() {
        return details;
    }


    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
