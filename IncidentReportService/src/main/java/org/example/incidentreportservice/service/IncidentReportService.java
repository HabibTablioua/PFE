package org.example.incidentreportservice.service;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.incidentreportservice.entity.IncidentReport;
import org.example.incidentreportservice.repository.IncidentReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.example.incidentreportservice.service.EmailService;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IncidentReportService {

    @Autowired
    private  IncidentReportRepository incidentReportRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private EmailService emailService;

    private static final Logger log = LoggerFactory.getLogger(IncidentReportService.class);

    public IncidentReport createIncident(IncidentReport incident) {
        IncidentReport savedIncident = incidentReportRepository.save(incident);
        // Envoi de l'email d'alerte à l'admin
        emailService.sendIncidentAlert(savedIncident.getTitle(), savedIncident.getDescription());
        sendNotificationToNotificationService("Le message pour l'incident ID " + savedIncident.getId() + " a été généré avec succès.");
        return savedIncident;
    }

    public List<IncidentReport> getAllIncidents() {
        return incidentReportRepository.findAll();
    }

    public void updateIncidentStatus(Long id, String status) {
        IncidentReport incident = incidentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident non trouvé"));
        incident.setStatus(status);
        incidentReportRepository.save(incident);
    }

    public IncidentReport updateIncident(Long id, IncidentReport updatedIncident) {
        IncidentReport incident = incidentReportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Incident non trouvé"));
        incident.setTitle(updatedIncident.getTitle());
        incident.setDescription(updatedIncident.getDescription());
        incident.setStatus(updatedIncident.getStatus());
        // Ajoute d'autres champs si besoin
        return incidentReportRepository.save(incident);
    }

    private String getAuthTokenFromRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return authHeader;
            }
        }
        return null;
    }
    private void sendNotificationToNotificationService(String message) {
        try {
            String url = "http://localhost:8088/api/notifications"; // Vérifie bien le port du Gateway

            Map<String, String> payload = Map.of(
                    "message", message
            );

            // 🔐 Récupérer le token JWT depuis la requête
            String token = getAuthTokenFromRequest();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (token != null && !token.isEmpty()) {
                headers.set("Authorization", token);
            }

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);

            log.info("✅ Notification envoyée au NotificationService : {}", message);
        } catch (Exception e) {
            log.warn("⚠️ Impossible d'envoyer la notification : {}", e.getMessage());
        }
    }

    public void deleteIncident(Long id) {
        incidentReportRepository.deleteById(id);
    }

    public void deleteAllIncidents() {
        incidentReportRepository.deleteAll();
    }
}

