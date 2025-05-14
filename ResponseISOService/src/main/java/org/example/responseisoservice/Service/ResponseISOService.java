package org.example.responseisoservice.Service;

import org.example.responseisoservice.DTO.ResponseISORequest;
import org.example.responseisoservice.DTO.ResponseISOResponse;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.ISOException;
import org.jpos.iso.packager.GenericPackager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;


@Service
public class ResponseISOService {
    private static final Logger log = LoggerFactory.getLogger(ResponseISOService.class);

    @Autowired
    private RestTemplate restTemplate;

    public ResponseISOResponse processISO(ResponseISORequest request) {
        ResponseISOResponse response = new ResponseISOResponse();

        try {
            log.info("📨 Traitement de la transaction ISO ID: {}", request.getTransactionId());

            InputStream packagerStream = getClass().getClassLoader().getResourceAsStream("iso87ascii-packager.xml");

            if (packagerStream == null) {
                throw new RuntimeException("❌ Fichier iso87ascii-packager.xml non trouvé dans le classpath !");
            }

            GenericPackager packager = new GenericPackager(packagerStream);


            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(request.getIsoMessage().getBytes());

            String processingCode = isoMsg.getString(3); // Champ 3 : Processing Code
            log.info("🔍 Code de traitement (champ 3) : {}", processingCode);
            sendLogToMonitoring("INFO", "Code de traitement reçu : " + processingCode);

            switch (processingCode) {
                // 💳 Transactions classiques
                case "000000": log.info("💳 Achat"); isoMsg.setMTI("0210"); isoMsg.set(39, "00"); break;
                case "310000": log.info("💰 Solde"); isoMsg.setMTI("0210"); isoMsg.set(39, "00"); isoMsg.set(54, "BAL:0000000500 MAD"); break;
                case "200000": log.info("🏧 Retrait"); isoMsg.setMTI("0210"); isoMsg.set(39, "00"); break;
                case "500000": log.info("🔁 Recharge"); isoMsg.setMTI("0210"); isoMsg.set(39, "00"); break;

                // 💸 Erreurs de transaction
                case "200001": log.info("❌ Fonds insuffisants"); isoMsg.setMTI("0210"); isoMsg.set(39, "51"); break;
                case "200002": log.info("📅 Carte expirée"); isoMsg.setMTI("0210"); isoMsg.set(39, "54"); break;
                case "200003": log.info("🔒 Carte bloquée"); isoMsg.setMTI("0210"); isoMsg.set(39, "43"); break;
                case "500001": log.info("❌ Montant invalide"); isoMsg.setMTI("0210"); isoMsg.set(39, "13"); break;
                case "900000": log.info("🚫 Transaction refusée"); isoMsg.setMTI("0210"); isoMsg.set(39, "05"); break;
                case "900001": log.info("💥 Erreur système"); isoMsg.setMTI("0210"); isoMsg.set(39, "96"); break;

                // 🛑 Erreurs de sécurité
                case "200007": log.info("🔐 Interdite pour cette carte"); isoMsg.setMTI("0210"); isoMsg.set(39, "57"); break;
                case "200008": log.info("🔐 PIN manquant"); isoMsg.setMTI("0210"); isoMsg.set(39, "55"); break;
                case "200009": log.info("🔐 Erreur de sécurité carte"); isoMsg.setMTI("0210"); isoMsg.set(39, "56"); break;
                case "200010": log.info("🔐 Mauvais cryptogramme"); isoMsg.setMTI("0210"); isoMsg.set(39, "63"); break;

                // 🏦 Erreurs de compte
                case "300000": log.info("🚫 Compte bloqué"); isoMsg.setMTI("0210"); isoMsg.set(39, "41"); break;
                case "300001": log.info("❌ Compte inexistant"); isoMsg.setMTI("0210"); isoMsg.set(39, "15"); break;
                case "300002": log.info("🛑 Compte fermé"); isoMsg.setMTI("0210"); isoMsg.set(39, "40"); break;
                case "300003": log.info("🔐 Compte restreint"); isoMsg.setMTI("0210"); isoMsg.set(39, "62"); break;
                case "300004": log.info("💱 Devise non autorisée"); isoMsg.setMTI("0210"); isoMsg.set(39, "47"); break;

                // 🌐 Problèmes de réseau
                case "600005": log.info("📡 Acquéreur indisponible"); isoMsg.setMTI("0210"); isoMsg.set(39, "91"); break;
                case "600006": log.info("⌛ Pas de réponse système"); isoMsg.setMTI("0210"); isoMsg.set(39, "68"); break;
                case "600007": log.info("⏳ Timeout dépassé"); isoMsg.setMTI("0210"); isoMsg.set(39, "68"); break;
                case "600008": log.info("📍 Routage introuvable"); isoMsg.setMTI("0210"); isoMsg.set(39, "92"); break;

                // 📲 Opérations spéciales
                case "700000": log.info("🛍️ Cashback"); isoMsg.setMTI("0210"); isoMsg.set(39, "00"); break;
                case "700001": log.info("♻️ Double retrait détecté"); isoMsg.setMTI("0210"); isoMsg.set(39, "94"); break;
                case "700002": log.info("🚫 Terminal non autorisé"); isoMsg.setMTI("0210"); isoMsg.set(39, "58"); break;
                case "700003": log.info("🚫 Politique interne"); isoMsg.setMTI("0210"); isoMsg.set(39, "05"); break;
                case "700004": log.info("📅 Date invalide"); isoMsg.setMTI("0210"); isoMsg.set(39, "13"); break;

                // 🧪 Cas techniques et tests
                case "999998": log.info("🧪 Test erreur forcée"); isoMsg.setMTI("0210"); isoMsg.set(39, "96"); break;
                case "999997": log.info("📄 MTI invalide"); isoMsg.setMTI("0210"); isoMsg.set(39, "30"); break;
                case "999996": log.info("📄 Bitmap invalide"); isoMsg.setMTI("0210"); isoMsg.set(39, "30"); break;
                case "999995": log.info("📄 Mauvais champ formaté"); isoMsg.setMTI("0210"); isoMsg.set(39, "30"); break;
                case "999994": log.info("🧪 Test surcharge système"); isoMsg.setMTI("0210"); isoMsg.set(39, "91"); break;

                // ❌ Autres
                case "600000": log.info("❎ Annulation par client"); isoMsg.setMTI("0210"); isoMsg.set(39, "17"); break;
                case "600001": log.info("⚠️ Format incorrect"); isoMsg.setMTI("0210"); isoMsg.set(39, "30"); break;
                case "600002": log.info("📉 Champ manquant"); isoMsg.setMTI("0210"); isoMsg.set(39, "30"); break;
                case "800000": log.info("❌ Carte invalide"); isoMsg.setMTI("0210"); isoMsg.set(39, "14"); break;
                case "800001": log.info("🚨 Carte suspecte"); isoMsg.setMTI("0210"); isoMsg.set(39, "57"); break;
                case "800002": log.info("⛔ Terminal interdit"); isoMsg.setMTI("0210"); isoMsg.set(39, "58"); break;

                // 🎯 Défaut (fallback)
                default:
                    log.warn("❌ Code traitement non reconnu : {}", processingCode);
                    isoMsg.setMTI("0210");
                    isoMsg.set(39, "12"); // Transaction invalide
                    sendLogToMonitoring("WARN", "Code traitement inconnu : " + processingCode);
                    break;
            }
            log.info("✅ Message ISO reçu décomposé :");
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    log.info("Champ ({}) : {}", i, isoMsg.getString(i));
                }
            }

            byte[] packed = isoMsg.pack();
            String responseIsoMessage = new String(packed);

            log.info("📦 Message ISO réponse généré : {}", responseIsoMessage);
            sendLogToMonitoring("SUCCESS", "Message ISO réponse généré pour MTI : " + isoMsg.getMTI());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> fields = new HashMap<>();
            isoMsg.setPackager(new GenericPackager(getClass().getClassLoader().getResourceAsStream("iso87ascii-packager.xml")));
            isoMsg.unpack(request.getIsoMessage().getBytes());

            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    fields.put(String.valueOf(i), isoMsg.getString(i));
                }
            }

            Map<String, Object> payload = Map.of(
                    "mti", isoMsg.getMTI(),
                    "fields", fields
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<String> packingResponse = restTemplate.postForEntity(
                    "http://localhost:8082/packing-iso/pack-ascii", entity, String.class
            );

            if (packingResponse.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Réponse bien reçue par PackingISOService");
            } else {
                log.warn("❌ Réponse NON reçue (status: {})", packingResponse.getStatusCode());
            }

            log.info("📬 Réponse du PackingISOService : {}", packingResponse.getBody());
            sendLogToMonitoring("INFO", "Réponse envoyée à PackingISOService");

            saveToHistory("0210", fields, responseIsoMessage, "RAW", "SUCCESS");

            String responseCode = isoMsg.getString(39);
            String reason = getReasonByResponseCode(responseCode);

            response.setStatus(responseCode.equals("00") ? "SUCCESS" : "FAILED");
            response.setMessage(responseCode.equals("00")
                    ? "Transaction approuvée."
                    : "Transaction échouée : " + reason);

            sendLogToMonitoring("SUCCESS", "Réponse ISO traitée avec succès pour ID: " + request.getTransactionId());

        } catch (ISOException e) {
            log.error("❌ Erreur de traitement ISO: {}", e.getMessage());
            response.setStatus("FAILED");
            response.setMessage("Erreur de traitement ISO : " + e.getMessage());
            sendLogToMonitoring("ERROR", "Erreur de traitement ISO : " + e.getMessage());

        } catch (Exception ex) {
            log.error("❌ Autre erreur : {}", ex.getMessage());
            response.setStatus("FAILED");
            response.setMessage("Erreur lors de l’envoi de la réponse ISO : " + ex.getMessage());
            sendLogToMonitoring("ERROR", "Erreur envoi vers PackingISOService : " + ex.getMessage());
        }

        return response;
    }

    private String getReasonByResponseCode(String code) {
        return switch (code) {
            case "00" -> "Transaction approuvée";
            case "13" -> "Montant invalide";
            case "14" -> "Carte invalide";
            case "15" -> "Compte inexistant";
            case "17" -> "Annulation client";
            case "30" -> "Erreur de format";
            case "39" -> "Devise non supportée";
            case "40" -> "Compte fermé";
            case "41" -> "Carte perdue ou bloquée";
            case "43" -> "Carte volée";
            case "47" -> "Devise non autorisée";
            case "51" -> "Fonds insuffisants";
            case "54" -> "Carte expirée";
            case "55" -> "PIN manquant";
            case "56" -> "Erreur de sécurité carte";
            case "57" -> "Transaction non autorisée pour cette carte";
            case "58" -> "Terminal non autorisé";
            case "62" -> "Compte restreint";
            case "63" -> "Mauvais cryptogramme";
            case "68" -> "Timeout dépassé";
            case "91" -> "Acquéreur indisponible";
            case "92" -> "Routage introuvable";
            case "94" -> "Transaction en double";
            case "96" -> "Erreur système";
            case "05" -> "Transaction refusée";
            case "12" -> "Code traitement non reconnu"; // ➕ AJOUT ICI
            default -> "Erreur inconnue";
        };
    }



    private void saveToHistory(String mti, Map<String, String> fields, String messageIso, String format, String status) {
        try {
            String url = "http://localhost:8085/history";

            Map<String, Object> payload = Map.of(
                    "mti", mti,
                    "fields", fields,
                    "message", messageIso,
                    "format", format,
                    "source", "ResponseISOService",
                    "status", status
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Void> response = restTemplate.postForEntity(url, entity, Void.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("🗃️ Réponse ISO enregistrée avec succès dans TransactionHistoryService.");
            } else {
                log.warn("⚠️ Échec de l'enregistrement de la réponse ISO. Statut : {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'enregistrement de la réponse ISO dans TransactionHistoryService : {}", e.getMessage(), e);
        }
    }

    private void sendLogToMonitoring(String level, String message) {
        try {
            String safeMessage = message.length() > 1000 ? message.substring(0, 1000) : message;
            String url = "http://localhost:8085/logs/save?level=" + level + "&message=" + URLEncoder.encode(safeMessage, "UTF-8");

            restTemplate.postForEntity(url, null, String.class);
            log.info("📤 Log envoyé au MonitoringService : {}", message);
        } catch (Exception e) {
            log.warn("⚠️ Échec de l'envoi du log : {}", e.getMessage());
        }
    }
}
