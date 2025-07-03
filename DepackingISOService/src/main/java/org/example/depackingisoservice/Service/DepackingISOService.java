package org.example.depackingisoservice.Service;

import jakarta.servlet.http.HttpServletRequest;
import org.example.depackingisoservice.DTO.FieldData;
import org.jpos.iso.ISOException;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.packager.GenericPackager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Service
public class DepackingISOService {

    private static final Logger log = LoggerFactory.getLogger(DepackingISOService.class);

    private final RestTemplate restTemplate;

    public DepackingISOService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String depackIsoMessage(String isoMessage) {
        try (InputStream is = getClass().getResourceAsStream("/iso87ascii-packager.xml")) {
            GenericPackager packager = new GenericPackager(is);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);

            // 🔍 Détection auto : si la string est HEX, on la convertit en ASCII
            byte[] bytes;
            if (isoMessage.matches("[0-9A-Fa-f]+") && isoMessage.length() % 2 == 0) {
                bytes = hexToBytes(isoMessage);
            } else {
                bytes = isoMessage.getBytes(StandardCharsets.US_ASCII);
            }

            isoMsg.unpack(bytes);

            StringBuilder output = new StringBuilder("✅ ISO8583 Message Décomposé :\n");
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    String value = isoMsg.getString(i);
                    if (i == 2 && value.length() > 6)
                        value = value.substring(0, 6) + "******" + value.substring(value.length() - 4);
                    if (i == 35 && value.contains("=")) {
                        String[] parts = value.split("=");
                        if (parts[0].length() > 6)
                            value = parts[0].substring(0, 6) + "******" + parts[0].substring(parts[0].length() - 4) + "=" + parts[1];
                    }
                    if (i == 36)
                        value = "[MASKED TRACK 3 DATA]";
                    output.append(String.format("Champ (%d): %s%n", i, value));
                }
            }
            log.info(output.toString());
            // Appel notification via RestTemplate
            sendNotificationToNotificationService("L'utilisateur a dépacké un message avec succès.");
            return output.toString();

        } catch (ISOException | IOException e) {
            log.error("❌ Erreur lors du dépackaging du message ISO8583", e);
            return "Erreur lors du dépackaging : " + e.getMessage();
        }
    }

    // 🔄 Fonction pour convertir HEX vers ASCII bytes
    private byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i+1), 16));
        }
        return data;
    }



    public List<FieldData> getFields(String isoMessage) throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/iso87ascii-packager.xml")) {
            GenericPackager packager = new GenericPackager(is);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(isoMessage.getBytes(StandardCharsets.US_ASCII));

            List<FieldData> fields = new ArrayList<>();
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    String value = isoMsg.getString(i);

                    // Masquer PAN (champ 2)
                    if (i == 2 && value.length() > 6) {
                        value = value.substring(0, 6) + "******" + value.substring(value.length() - 4);
                    }

                    // Masquer Track 2 Data (champ 35)
                    if (i == 35 && value.contains("=")) {
                        String[] parts = value.split("=");
                        if (parts[0].length() > 6) {
                            value = parts[0].substring(0, 6) + "******" + parts[0].substring(parts[0].length() - 4) + "=" + parts[1];
                        }
                    }

                    // Masquer Track 3 Data (champ 36)
                    if (i == 36) {
                        value = "[MASKED TRACK 3 DATA]";
                    }

                    fields.add(new FieldData(i, value));
                }
            }
            return fields;
        }
    }



    public byte[] repackWithMaskedFields(String isoMessage) throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/iso87ascii-packager.xml")) {
            GenericPackager packager = new GenericPackager(is);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(isoMessage.getBytes(StandardCharsets.US_ASCII));

            // Exemple : Masquer PAN (champ 2)
            if (isoMsg.hasField(2)) {
                String pan = isoMsg.getString(2);
                if (pan.length() > 6) {
                    String maskedPan = pan.substring(0, 6) + "******" + pan.substring(pan.length() - 4);
                    isoMsg.set(2, maskedPan);
                }
            }

            // Autres champs sensibles ? Ajoute d'autres logiques ici.

            // Repack
            return isoMsg.pack();
        }
    }

    // Envoi notification avec RestTemplate et token JWT
    private void sendNotificationToNotificationService(String message) {
        try {
            String url = "http://localhost:8088/api/notifications"; // Vérifie bien le port du Gateway
            Map<String, String> payload = Map.of("message", message);
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

    // Méthode à implémenter pour récupérer le token JWT depuis la requête
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

}

