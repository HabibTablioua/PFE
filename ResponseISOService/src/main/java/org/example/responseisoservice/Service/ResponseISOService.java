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
import org.example.responseisoservice.Entity.ResponseISOHistory;
import org.example.responseisoservice.repository.ResponseISOHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;


@Service
public class ResponseISOService {
    private static final Logger log = LoggerFactory.getLogger(ResponseISOService.class);

    private final RestTemplate restTemplate;
    @Autowired
    private ResponseISOHistoryRepository historyRepository;
    @Autowired
    private ObjectMapper objectMapper;

    public ResponseISOService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // --- Mapping ISO processing codes to actions ---
    private static class ResponseAction {
        String mti;
        String code39;
        Map<Integer, String> extraFields;
        ResponseAction(String mti, String code39) {
            this(mti, code39, new HashMap<>());
        }
        ResponseAction(String mti, String code39, int extraField, String extraValue) {
            this(mti, code39, Map.of(extraField, extraValue));
        }
        ResponseAction(String mti, String code39, Map<Integer, String> extraFields) {
            this.mti = mti;
            this.code39 = code39;
            this.extraFields = extraFields;
        }
    }
    private static final Map<String, ResponseAction> RESPONSE_MAP = Map.ofEntries(
        Map.entry("000000", new ResponseAction("0210", "00")),
        Map.entry("310000", new ResponseAction("0210", "00", 54, "BAL:0000000500 MAD")),
        Map.entry("200000", new ResponseAction("0210", "00")),
        Map.entry("200001", new ResponseAction("0210", "51")),
        Map.entry("200002", new ResponseAction("0210", "54")),
        Map.entry("200003", new ResponseAction("0210", "43")),
        Map.entry("500000", new ResponseAction("0210", "00")),
        Map.entry("500001", new ResponseAction("0210", "13")),
        Map.entry("900000", new ResponseAction("0210", "05")),
        Map.entry("900001", new ResponseAction("0210", "96")),
        Map.entry("200007", new ResponseAction("0210", "57")),
        Map.entry("200008", new ResponseAction("0210", "55")),
        Map.entry("200009", new ResponseAction("0210", "56")),
        Map.entry("200010", new ResponseAction("0210", "63")),
        Map.entry("300000", new ResponseAction("0210", "41")),
        Map.entry("300001", new ResponseAction("0210", "15")),
        Map.entry("300002", new ResponseAction("0210", "40")),
        Map.entry("300003", new ResponseAction("0210", "62")),
        Map.entry("300004", new ResponseAction("0210", "47")),
        Map.entry("600005", new ResponseAction("0210", "91")),
        Map.entry("600006", new ResponseAction("0210", "68")),
        Map.entry("600007", new ResponseAction("0210", "68")),
        Map.entry("600008", new ResponseAction("0210", "92")),
        Map.entry("700000", new ResponseAction("0210", "00")),
        Map.entry("700001", new ResponseAction("0210", "94")),
        Map.entry("700002", new ResponseAction("0210", "58")),
        Map.entry("700003", new ResponseAction("0210", "05")),
        Map.entry("700004", new ResponseAction("0210", "13")),
        Map.entry("999998", new ResponseAction("0210", "96")),
        Map.entry("999997", new ResponseAction("0210", "30")),
        Map.entry("999996", new ResponseAction("0210", "30")),
        Map.entry("999995", new ResponseAction("0210", "30")),
        Map.entry("999994", new ResponseAction("0210", "91")),
        Map.entry("600000", new ResponseAction("0210", "17")),
        Map.entry("600001", new ResponseAction("0210", "30")),
        Map.entry("600002", new ResponseAction("0210", "30")),
        Map.entry("800000", new ResponseAction("0210", "14")),
        Map.entry("800001", new ResponseAction("0210", "57")),
        Map.entry("800002", new ResponseAction("0210", "58"))
    );

    public ResponseISOResponse processISO(ResponseISORequest request) {
        ResponseISOResponse response = new ResponseISOResponse();
        try {
            if (request == null || request.getIsoMessage() == null || request.getIsoMessage().isEmpty()) {
                throw new IllegalArgumentException("Le message ISO ne doit pas être vide.");
            }
            log.info("📨 Traitement de la transaction ISO ID: {}", request.getTransactionId());
            InputStream packagerStream = getClass().getClassLoader().getResourceAsStream("iso87ascii-packager.xml");
            if (packagerStream == null) {
                throw new RuntimeException("❌ Fichier iso87ascii-packager.xml non trouvé dans le classpath !");
            }
            GenericPackager packager = new GenericPackager(packagerStream);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(request.getIsoMessage().getBytes());
            String processingCode = isoMsg.getString(3);
            log.info("🔍 Code de traitement (champ 3) : {}", processingCode);
            ResponseAction action = RESPONSE_MAP.get(processingCode);
            if (action != null) {
                isoMsg.setMTI(action.mti);
                isoMsg.set(39, action.code39);
                if (action.extraFields != null) {
                    action.extraFields.forEach(isoMsg::set);
                }
                log.info("Traitement code {} appliqué (MTI={}, 39={})", processingCode, action.mti, action.code39);
            } else {
                    log.warn("❌ Code traitement non reconnu : {}", processingCode);
                    isoMsg.setMTI("0210");
                isoMsg.set(39, "12");
            }
            log.info("✅ Message ISO reçu décomposé :");
            Map<String, String> fields = new HashMap<>();
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    fields.put(String.valueOf(i), isoMsg.getString(i));
                }
            }
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    log.info("Champ ({}) : {}", i, isoMsg.getString(i));
                }
            }

            byte[] packed = isoMsg.pack();
            String responseIsoMessage = new String(packed);

            log.info("📦 Message ISO réponse généré : {}", responseIsoMessage);

            saveToHistory("0210", fields, responseIsoMessage, "RAW", "SUCCESS");

            String responseCode = isoMsg.getString(39);
            String reason = getReasonByResponseCode(responseCode);

            response.setStatus(responseCode.equals("00") ? "SUCCESS" : "FAILED");
            response.setMessage(responseCode.equals("00")
                    ? "Transaction approuvée."
                    : "Transaction échouée : " + reason);


        } catch (ISOException e) {
            log.error("❌ Erreur de traitement ISO: {}", e.getMessage());
            response.setStatus("FAILED");
            response.setMessage("Erreur de traitement ISO : " + e.getMessage());

        } catch (Exception ex) {
            log.error("❌ Autre erreur : {}", ex.getMessage());
            response.setStatus("FAILED");
            response.setMessage("Erreur lors de l'envoi de la réponse ISO : " + ex.getMessage());
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
            ResponseISOHistory history = new ResponseISOHistory();
            history.setMti(mti);
            history.setFields(objectMapper.writeValueAsString(fields));
            history.setMessageIso(messageIso);
            history.setFormat(format);
            history.setStatus(status);
            history.setCreatedAt(java.time.LocalDateTime.now());
            historyRepository.save(history);
            log.info("🗃️ Réponse ISO enregistrée avec succès dans la base de données.");
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'enregistrement de la réponse ISO dans la base de données : {}", e.getMessage(), e);
        }
    }


}
