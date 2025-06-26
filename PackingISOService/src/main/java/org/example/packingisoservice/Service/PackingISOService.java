package org.example.packingisoservice.Service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.example.packingisoservice.DTO.IsoFieldsRequest;
import org.example.packingisoservice.DTO.PackingISOResponse;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.packager.GenericPackager;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.util.Map;


@Service
@Slf4j
@RequiredArgsConstructor
public class PackingISOService {

    private final RestTemplate restTemplate;


    public PackingISOResponse packAscii(IsoFieldsRequest request) {
        String packed = pack(request, false);
        saveToHistory(request.getMti(), request.getFields(), packed, "ASCII");
        log.info("Packing ISO Response: " + packed);
        sendLogToMonitoring("SUCCESS", "Packing ASCII réussi pour MTI : " + request.getMti());
        sendNotificationToNotificationService("Le message pour MTI " + request.getMti() + " a été généré avec succès.");
        // Envoi automatique via Gateway
        sendToResponseISOService(packed, request.getMti(), "ASCII", Map.of());
        return new PackingISOResponse(packed);
    }

    public PackingISOResponse packHex(IsoFieldsRequest request) {
        String packed = pack(request, true);
        saveToHistory(request.getMti(), request.getFields(), packed, "HEX");
        sendLogToMonitoring("SUCCESS", "Packing HEX réussi pour MTI : " + request.getMti());
        sendNotificationToNotificationService("Le message pour MTI " + request.getMti() + " a été généré avec succès.");
        // Envoi automatique via Gateway
        sendToResponseISOService(packed, request.getMti(), "HEX", Map.of());
        return new PackingISOResponse(packed);
    }


    private String pack(IsoFieldsRequest request, boolean hex) {
        try {
            GenericPackager packager = new GenericPackager(getClass().getClassLoader().getResourceAsStream("iso87ascii.xml"));
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.setMTI(request.getMti());

            for (Map.Entry<String, String> entry : request.getFields().entrySet()) {
                isoMsg.set(Integer.parseInt(entry.getKey()), entry.getValue());
            }

            byte[] packed = isoMsg.pack();
            return hex ? bytesToHex(packed) : new String(packed, StandardCharsets.US_ASCII);

        } catch (Exception e) {
            log.error("Packing error", e);
            sendLogToMonitoring("ERROR", "Erreur de packing pour MTI : " + request.getMti() + " - " + e.getMessage());
            throw new RuntimeException("Packing failed", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
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


    private void saveToHistory(String mti, Map<String, String> fields, String message, String format) {
        // ici on appelle le microservice d'historique
        String url = "http://localhost:8088/api/history"; // adapte le nom du service et chemin

        Map<String, Object> payload = Map.of(
                "mti", mti,
                "fields", fields,
                "message", message,
                "format", format,
                "source", "PackingISOService",
                "status", "SUCCESS"
        );

        try {
            // 🔐 Récupérer le token JWT depuis la requête
            String token = getAuthTokenFromRequest();

            // 🧾 Préparer les headers avec le token + content-type
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (token != null && !token.isEmpty()) {
                headers.set("Authorization", token);
            }

            // 📤 Envoyer la requête POST avec le body JSON et les headers
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);

            log.info("payload :" + payload.toString());
            log.info("✅ Message enregistré dans l'historique.");
            sendLogToMonitoring("SUCCESS", "Message enregistré dans historique pour MTI : " + mti);
        } catch (Exception e) {
            log.warn("⚠️ Échec d'enregistrement dans l'historique : {}", e.getMessage());
            sendLogToMonitoring("ERROR", "Erreur d'enregistrement historique pour MTI : " + mti + " - " + e.getMessage());
        }
    }


    private void sendLogToMonitoring(String level, String message) {
        try {
            String url = "http://localhost:8088/api/logs/save"; // ⚠️ Pas 8088 ! Vérifie que ton MonitoringService tourne bien sur 8085

            // 📦 Payload à envoyer dans le body
            Map<String, Object> payload = Map.of(
                    "level", level,
                    "message", message
            );

            // 🔐 Récupérer le token JWT depuis la requête
            String token = getAuthTokenFromRequest();

            // 🧾 Préparer les headers avec le token + content-type
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (token != null && !token.isEmpty()) {
                headers.set("Authorization", token);
            }

            // 📤 Envoyer la requête POST avec le body JSON et les headers
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);

            log.info("✅ Log envoyé au MonitoringService : {} - {}", level, message);
        } catch (Exception e) {
            log.warn("⚠️ Impossible d'envoyer le log au MonitoringService : {}", e.getMessage());
        }
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

    private void sendToResponseISOService(String isoMessage, String transactionId, String format, Map<String, Object> meta) {
        try {
            String url = "http://localhost:8080/response-iso/process"; // Passe par le Gateway

            Map<String, Object> payload = Map.of(
                "isoMessage", isoMessage,
                "transactionId", transactionId,
                "format", format,
                "meta", meta
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String token = getAuthTokenFromRequest();
            if (token != null && !token.isEmpty()) {
                headers.set("Authorization", token);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Réponse reçue de ResponseISOService : {}", response.getBody());
            } else {
                log.warn("❌ Erreur lors de l'appel à ResponseISOService : {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.warn("⚠️ Impossible d'envoyer le message à ResponseISOService : {}", e.getMessage());
        }
    }



}


