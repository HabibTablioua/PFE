package com.example.iso_report_service.client;
import com.example.iso_report_service.model.ValidationRecord;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import java.util.Arrays;
import java.util.List;

@Service
public class ValidationClient {

    private final RestTemplate restTemplate;

    public ValidationClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ValidationRecord fetchById(String id,String token) {
        String url = "http://localhost:8082/validate/" + id;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<ValidationRecord> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                ValidationRecord.class
        );

        return response.getBody();
    }

    public List<ValidationRecord> fetchAll(String token) {
        String url = "http://localhost:8082/validate";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<ValidationRecord[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                ValidationRecord[].class
        );

        return Arrays.asList(response.getBody());
    }
}
