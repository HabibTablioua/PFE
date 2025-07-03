package org.example.incidentreportservice.controller;

import org.example.incidentreportservice.entity.IncidentReport;
import org.example.incidentreportservice.service.IncidentReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.incidentreportservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.security.Principal;

@RestController
@RequestMapping("/incidents")
public class IncidentReportController {

    private final IncidentReportService incidentReportService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private HttpServletRequest request;

    public IncidentReportController(IncidentReportService incidentReportService) {
        this.incidentReportService = incidentReportService;
    }

    @PostMapping
    public ResponseEntity<IncidentReport> reportIncident(@RequestBody IncidentReport incident, Principal principal) {
        if (principal != null) {
            incident.setUsername(principal.getName());
            // Extraction de l'id utilisateur depuis le JWT
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String userId = jwtUtil.extractUserId(token);
                if (userId != null) {
                    try {
                        incident.setUserId(Long.valueOf(userId));
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return ResponseEntity.ok(incidentReportService.createIncident(incident));
    }

    @GetMapping
    public ResponseEntity<List<IncidentReport>> getAllIncidents() {
        return ResponseEntity.ok(incidentReportService.getAllIncidents());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateIncidentStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        incidentReportService.updateIncidentStatus(id, request.get("status"));
        return ResponseEntity.ok("Statut mis à jour avec succès.");
    }

    @PutMapping("/{id}/full")
    public ResponseEntity<IncidentReport> updateIncident(
            @PathVariable Long id,
            @RequestBody IncidentReport updatedIncident
    ) {
        IncidentReport updated = incidentReportService.updateIncident(id, updatedIncident);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentReportService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}

