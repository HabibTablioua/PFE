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
import org.example.responseisoservice.Entity.PinTryCounter;
import org.example.responseisoservice.repository.PinTryCounterRepository;
import org.example.responseisoservice.Entity.Account;
import org.example.responseisoservice.repository.AccountRepository;
import org.example.responseisoservice.Entity.Card;
import org.example.responseisoservice.repository.CardRepository;
import org.example.responseisoservice.Entity.AccountTransactionHistory;
import org.example.responseisoservice.repository.AccountTransactionHistoryRepository;

import java.io.InputStream;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;


@Service
public class ResponseISOService {
    private static final Logger log = LoggerFactory.getLogger(ResponseISOService.class);

    private final RestTemplate restTemplate;
    @Autowired
    private ResponseISOHistoryRepository historyRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private PinTryCounterRepository pinTryCounterRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private CardRepository cardRepository;
    @Autowired
    private AccountTransactionHistoryRepository accountTransactionHistoryRepository;
    private static final int MAX_PIN_TRIES = 3;
    private static final java.util.Set<String> SUPPORTED_CURRENCIES = java.util.Set.of("MAD", "USD", "EUR");

    public ResponseISOService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // --- Mapping ISO processing codes to actions ---
    // SUPPRESSION de la classe interne ResponseAction et de la map RESPONSE_MAP

    private String hexToAscii(String hexStr) {
        StringBuilder output = new StringBuilder();
        for (int i = 0; i < hexStr.length(); i += 2) {
            String str = hexStr.substring(i, i + 2);
            output.append((char) Integer.parseInt(str, 16));
        }
        return output.toString();
    }

    private boolean isHex(String s) {
        return s != null && s.matches("[0-9A-Fa-f]+") && s.length() % 2 == 0;
    }

    // --- Vérification Luhn du PAN ---
    private boolean isValidLuhn(String pan) {
        int sum = 0;
        boolean alternate = false;
        for (int i = pan.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(pan.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }

    public ResponseISOResponse processISO(ResponseISORequest request) {
        ResponseISOResponse response = new ResponseISOResponse();
        String cause = "";
        Map<String, String> fields = new HashMap<>();
        String messageIso = "";
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
            // Ajout : décodage automatique du message ISO si hexadécimal
            String isoMessage = request.getIsoMessage();
            if (isHex(isoMessage)) {
                log.info("🔄 Message ISO reçu en HEX, décodage en ASCII...");
                isoMessage = hexToAscii(isoMessage);
            }
            isoMsg.unpack(isoMessage.getBytes());
            // --- Vérification statuts carte (volée, perdue, blacklistée, bloquée, expirée) ---
            String pan = isoMsg.hasField(2) ? isoMsg.getString(2) : null;
            if (pan == null || !isValidLuhn(pan)) {
                isoMsg.set(39, "14"); // PAN invalide
                response.setStatus("FAILED");
                response.setMessage("Numéro de carte invalide.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "14");
                details.put("isoField", "2");
                details.put("reason", "Le PAN fourni ne passe pas la validation Luhn ou est absent.");
                details.put("pan", pan);
                details.put("action", "Vérifiez le numéro de carte saisi.");
                response.setDetails(details);
                // Remplir fields et messageIso même en cas d'échec
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                    try { messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                } else {
                    messageIso = request.getIsoMessage();
                }
                ThreadLocalDetailsHolder.details = details;
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            Optional<Card> cardOpt = cardRepository.findByPan(pan);
            if (cardOpt.isEmpty()) {
                isoMsg.set(39, "15"); // Carte inexistante
                response.setStatus("FAILED");
                response.setMessage("Carte inexistante.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "15");
                details.put("isoField", "2");
                details.put("reason", "Aucune carte trouvée pour ce PAN dans la base de données.");
                details.put("pan", pan);
                details.put("action", "Vérifiez le numéro de carte ou contactez la banque.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            Card card = cardOpt.get();
            if (card.isStolen()) {
                isoMsg.set(39, "43");
                response.setStatus("FAILED");
                response.setMessage("Carte volée.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "43");
                details.put("isoField", "2");
                details.put("reason", "La carte est marquée comme volée dans la base de données.");
                details.put("pan", pan);
                details.put("action", "Retirer la carte et contacter l’émetteur.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            if (card.isLost()) {
                isoMsg.set(39, "41");
                response.setStatus("FAILED");
                response.setMessage("Carte perdue.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "41");
                details.put("isoField", "2");
                details.put("reason", "La carte est marquée comme perdue dans la base de données.");
                details.put("pan", pan);
                details.put("action", "Retirer la carte et contacter l’émetteur.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            if (card.isBlacklisted()) {
                isoMsg.set(39, "62");
                response.setStatus("FAILED");
                response.setMessage("Carte blacklistée.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "62");
                details.put("isoField", "2");
                details.put("reason", "La carte est blacklistée (usage interdit).");
                details.put("pan", pan);
                details.put("action", "Retirer la carte et contacter l’émetteur.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            if ("BLOCKED".equalsIgnoreCase(card.getStatus())) {
                isoMsg.set(39, "75");
                response.setStatus("FAILED");
                response.setMessage("Carte bloquée.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "75");
                details.put("isoField", "2");
                details.put("reason", "La carte a été bloquée suite à trop de tentatives PIN ou par la banque.");
                details.put("pan", pan);
                details.put("action", "Contacter la banque pour débloquer la carte.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            if (card.getExpiryDate() != null && card.getExpiryDate().isBefore(java.time.LocalDate.now())) {
                isoMsg.set(39, "54");
                response.setStatus("FAILED");
                response.setMessage("Carte expirée.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "54");
                details.put("isoField", "14");
                details.put("reason", "La date d’expiration de la carte est dépassée.");
                details.put("expiryDate", card.getExpiryDate());
                details.put("action", "Demander une nouvelle carte à la banque.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            // --- VALIDATION DU MONTANT (field 4) ---
            String processingCode = isoMsg.getString(3);
            // Ajout : décodage hex si non reconnu
            if (isHex(processingCode)) {
                String asciiCode = hexToAscii(processingCode);
                processingCode = asciiCode;
            }
            // --- AJOUT : Contrôle terminal autorisé (code 58) ---
            String terminalId = isoMsg.hasField(41) ? isoMsg.getString(41) : null;
            log.info("🔍 Code de traitement (champ 3) : {}", processingCode);
            // SUPPRESSION de la map RESPONSE_MAP et de la classe interne ResponseAction
            // À LA FIN DU TRAITEMENT, fallback si aucun code 39 n’a été fixé :
            if (!isoMsg.hasField(39)) {
                isoMsg.set(39, "12"); // Code traitement non reconnu
                response.setStatus("FAILED");
                response.setMessage("Code traitement non reconnu ou cas non géré.");
            }
            log.info("✅ Message ISO reçu décomposé :");
            fields.clear();
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
            messageIso = new String(packed);

            log.info("📦 Message ISO réponse généré : {}", messageIso);

            String responseCode = isoMsg.getString(39);
            String reason = getReasonByResponseCode(responseCode);
            response.setStatus(responseCode.equals("00") ? "SUCCESS" : "FAILED");
            response.setMessage(responseCode.equals("00")
                    ? "Transaction approuvée."
                    : "Transaction échouée : " + reason);
            cause = reason;
            fields.clear();
            if (isoMsg != null) {
                for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                    if (isoMsg.hasField(i)) {
                        fields.put(String.valueOf(i), isoMsg.getString(i));
                    }
                }
            }
            log.info("[DEBUG] Champs extraits pour historique : {}", fields);
            messageIso = "";
            try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
            log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
            saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), cause);

            Optional<Account> accountOpt = accountRepository.findByPan(pan);
            if (accountOpt.isEmpty()) {
                isoMsg.set(39, "15"); // Compte inexistant
                response.setStatus("FAILED");
                response.setMessage("Compte inexistant.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "15");
                details.put("isoField", "2");
                details.put("reason", "Aucun compte associé à ce PAN dans la base de données.");
                details.put("pan", pan);
                details.put("action", "Vérifiez le numéro de carte ou contactez la banque.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            if (accountOpt.isPresent() && accountOpt.get().isRestricted()) {
                isoMsg.set(39, "62"); // Compte restreint
                response.setStatus("FAILED");
                response.setMessage("Compte restreint.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "62");
                details.put("isoField", "2");
                details.put("reason", "Le compte est restreint (blacklisté ou usage limité).");
                details.put("pan", pan);
                details.put("action", "Contactez la banque pour plus d’informations.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            if (accountOpt.isPresent()) {
                Account acc = accountOpt.get();
                if (acc.isStolen()) {
                    isoMsg.set(39, "43"); // Carte volée
                    response.setStatus("FAILED");
                    response.setMessage("Carte volée.");
                    Map<String, Object> details = new HashMap<>();
                    details.put("isoCode", "43");
                    details.put("isoField", "2");
                    details.put("reason", "Le compte est marqué comme volé dans la base de données.");
                    details.put("pan", pan);
                    details.put("action", "Retirer la carte et contacter l’émetteur.");
                    response.setDetails(details);
                    fields.clear();
                    if (isoMsg != null) {
                        for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                            if (isoMsg.hasField(i)) {
                                fields.put(String.valueOf(i), isoMsg.getString(i));
                            }
                        }
                    }
                    log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                    messageIso = "";
                    try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                    log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                    ThreadLocalDetailsHolder.details = response.getDetails();
                    saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                    ThreadLocalDetailsHolder.details = null;
                    return response;
                }
                if (acc.isLost()) {
                    isoMsg.set(39, "41"); // Carte perdue
                    response.setStatus("FAILED");
                    response.setMessage("Carte perdue.");
                    Map<String, Object> details = new HashMap<>();
                    details.put("isoCode", "41");
                    details.put("isoField", "2");
                    details.put("reason", "Le compte est marqué comme perdu dans la base de données.");
                    details.put("pan", pan);
                    details.put("action", "Retirer la carte et contacter l’émetteur.");
                    response.setDetails(details);
                    fields.clear();
                    if (isoMsg != null) {
                        for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                            if (isoMsg.hasField(i)) {
                                fields.put(String.valueOf(i), isoMsg.getString(i));
                            }
                        }
                    }
                    log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                    messageIso = "";
                    try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                    log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                    ThreadLocalDetailsHolder.details = response.getDetails();
                    saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                    ThreadLocalDetailsHolder.details = null;
                    return response;
                }
                if (acc.isBlacklisted()) {
                    isoMsg.set(39, "62"); // Carte blacklistée (compte restreint)
                    response.setStatus("FAILED");
                    response.setMessage("Carte blacklistée.");
                    Map<String, Object> details = new HashMap<>();
                    details.put("isoCode", "62");
                    details.put("isoField", "2");
                    details.put("reason", "Le compte est blacklisté (usage interdit).");
                    details.put("pan", pan);
                    details.put("action", "Retirer la carte et contacter l’émetteur.");
                    response.setDetails(details);
                    fields.clear();
                    if (isoMsg != null) {
                        for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                            if (isoMsg.hasField(i)) {
                                fields.put(String.valueOf(i), isoMsg.getString(i));
                            }
                        }
                    }
                    log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                    messageIso = "";
                    try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                    log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                    ThreadLocalDetailsHolder.details = response.getDetails();
                    saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                    ThreadLocalDetailsHolder.details = null;
                    return response;
                }
                if (acc.getAllowedOperations() != null && processingCode != null) {
                    java.util.List<String> allowed = java.util.Arrays.asList(acc.getAllowedOperations().split(","));
                    // Suppression du contrôle sur le code de traitement pour autoriser toutes les transactions
                    // if (!allowed.contains(processingCode)) {
                    //     isoMsg.set(39, "57"); // Transaction non autorisée pour cette carte
                    //     response.setStatus("FAILED");
                    //     response.setMessage("Transaction non autorisée pour cette carte.");
                    //     Map<String, Object> details = new HashMap<>();
                    //     details.put("isoCode", "57");
                    //     details.put("isoField", "3");
                    //     details.put("reason", "Le code de traitement n’est pas autorisé pour ce compte/cette carte.");
                    //     details.put("processingCode", processingCode);
                    //     details.put("action", "Vérifiez les droits de la carte ou contactez la banque.");
                    //     response.setDetails(details);
                    //     fields.clear();
                    //     if (isoMsg != null) {
                    //         for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                    //             if (isoMsg.hasField(i)) {
                    //                 fields.put(String.valueOf(i), isoMsg.getString(i));
                    //             }
                    //         }
                    //     }
                    //     log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                    //     messageIso = "";
                    //     try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                    //     log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                    //     ThreadLocalDetailsHolder.details = response.getDetails();
                    //     saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                    //     ThreadLocalDetailsHolder.details = null;
                    //     return response;
                    // }
                }
            }
            Optional<Account> accountClosedOpt = accountRepository.findByPan(pan);
            if (accountClosedOpt.isPresent() && "CLOSED".equalsIgnoreCase(accountClosedOpt.get().getStatus())) {
                isoMsg.set(39, "57"); // Compte fermé
                response.setStatus("FAILED");
                response.setMessage("Compte fermé.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "57");
                details.put("isoField", "2");
                details.put("reason", "Le compte est fermé dans la base de données.");
                details.put("pan", pan);
                details.put("action", "Contactez la banque pour plus d’informations.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            Optional<Account> accountStolenOpt = accountRepository.findByPan(pan);
            if (accountStolenOpt.isPresent() && accountStolenOpt.get().isStolen()) {
                isoMsg.set(39, "43"); // Carte volée
                response.setStatus("FAILED");
                response.setMessage("Carte volée.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "43");
                details.put("isoField", "2");
                details.put("reason", "Le compte est marqué comme volé dans la base de données.");
                details.put("pan", pan);
                details.put("action", "Retirer la carte et contacter l’émetteur.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            Account account = card.getAccount();
            if (account == null) {
                isoMsg.set(39, "15"); // Compte inexistant
                response.setStatus("FAILED");
                response.setMessage("Compte inexistant.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "15");
                details.put("isoField", "2");
                details.put("reason", "Aucun compte associé à cette carte.");
                details.put("pan", pan);
                details.put("action", "Vérifiez le numéro de carte ou contactez la banque.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            String amount = isoMsg.hasField(4) ? isoMsg.getString(4) : null;
            validateAmount(amount);
            java.math.BigDecimal amountValue = amount != null ? new java.math.BigDecimal(amount) : null;
            if (amountValue != null && account.getBalance().compareTo(amountValue) < 0) {
                isoMsg.set(39, "51"); // Fonds insuffisants
                response.setStatus("FAILED");
                response.setMessage("Fonds insuffisants.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "51");
                details.put("isoField", "4");
                details.put("reason", "Le solde du compte (" + account.getBalance() + ") est inférieur au montant demandé (" + amountValue + ").");
                details.put("accountNumber", account.getAccountNumber());
                details.put("action", "Approvisionnez le compte ou essayez un montant inférieur.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            String expectedHolder = account.getHolderName(); // ou card.getHolderName() si besoin
            String providedHolder = isoMsg.hasField(43) ? isoMsg.getString(43) : null;
            if (providedHolder != null && !providedHolder.trim().equalsIgnoreCase(expectedHolder.trim())) {
                isoMsg.set(39, "14"); // Carte invalide ou titulaire incorrect
                response.setStatus("FAILED");
                response.setMessage("Nom du titulaire incorrect.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "14");
                details.put("isoField", "43");
                details.put("reason", "Le nom du titulaire fourni ne correspond pas à celui du compte.");
                details.put("expectedHolder", expectedHolder);
                details.put("providedHolder", providedHolder);
                details.put("action", "Vérifiez le nom du titulaire.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            String pin = isoMsg.hasField(52) ? isoMsg.getString(52) : null;
            boolean pinCorrect = isPinCorrect(pan, pin);
            handlePinTry(pan, pinCorrect, isoMsg);
            if (isoMsg.hasField(39) && "75".equals(isoMsg.getString(39))) {
                response.setStatus("FAILED");
                response.setMessage("Nombre de tentatives PIN dépassé, carte bloquée.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "75");
                details.put("isoField", "52");
                details.put("reason", "Le nombre de tentatives PIN a été dépassé, la carte est bloquée.");
                details.put("pan", pan);
                details.put("action", "Contactez la banque pour débloquer la carte.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            String cancellationIndicator = isoMsg.hasField(25) ? isoMsg.getString(25) : null;
            if ("06".equals(cancellationIndicator)) {
                isoMsg.set(39, "17"); // Annulation client
                response.setStatus("FAILED");
                response.setMessage("Annulation client.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "17");
                details.put("isoField", "25");
                details.put("reason", "La transaction a été annulée par le client.");
                details.put("action", "Aucune action requise.");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            String currency = isoMsg.hasField(49) ? isoMsg.getString(49) : null;
            if (currency == null || !SUPPORTED_CURRENCIES.contains(currency)) {
                isoMsg.set(39, "39"); // Devise non supportée
                response.setStatus("FAILED");
                response.setMessage("Devise non supportée.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "39");
                details.put("isoField", "49");
                details.put("reason", "La devise demandée n’est pas supportée par le système.");
                details.put("currency", currency);
                details.put("action", "Essayez avec une devise supportée (MAD, USD, EUR).");
                response.setDetails(details);
                fields.clear();
                if (isoMsg != null) {
                    for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                        if (isoMsg.hasField(i)) {
                            fields.put(String.valueOf(i), isoMsg.getString(i));
                        }
                    }
                }
                log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                messageIso = "";
                try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                ThreadLocalDetailsHolder.details = response.getDetails();
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            String expiry = isoMsg.hasField(14) ? isoMsg.getString(14) : null;
            if (expiry != null && expiry.matches("\\d{4}")) {
                int expMonth = Integer.parseInt(expiry.substring(0, 2));
                int expYear = 2000 + Integer.parseInt(expiry.substring(2, 4));
                java.time.YearMonth cardExpiry = java.time.YearMonth.of(expYear, expMonth);
                java.time.YearMonth now = java.time.YearMonth.now();
                if (cardExpiry.isBefore(now)) {
                    isoMsg.set(39, "54"); // Carte expirée
                    response.setStatus("FAILED");
                    response.setMessage("Carte expirée.");
                    Map<String, Object> details = new HashMap<>();
                    details.put("isoCode", "54");
                    details.put("isoField", "14");
                    details.put("reason", "La date d’expiration de la carte est dépassée.");
                    details.put("expiry", expiry);
                    details.put("action", "Demander une nouvelle carte à la banque.");
                    response.setDetails(details);
                    fields.clear();
                    if (isoMsg != null) {
                        for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                            if (isoMsg.hasField(i)) {
                                fields.put(String.valueOf(i), isoMsg.getString(i));
                            }
                        }
                    }
                    log.info("[DEBUG] Champs extraits pour historique : {}", fields);
                    messageIso = "";
                    try { if (isoMsg != null) messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                    log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
                    ThreadLocalDetailsHolder.details = response.getDetails();
                    saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                    ThreadLocalDetailsHolder.details = null;
                    return response;
                }
            }

        } catch (ISOException e) {
            log.error("❌ Erreur de traitement ISO: {}", e.getMessage());
            response.setStatus("FAILED");
            response.setMessage("Erreur de traitement ISO : " + e.getMessage());
            cause = e.getMessage();
            saveToHistory("0210", new HashMap<>(), "", "RAW", "FAILED", cause);
        } catch (Exception ex) {
            log.error("❌ Autre erreur : {}", ex.getMessage());
            // Ajout : gestion acquéreur indisponible
            response.setStatus("FAILED");
            if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("acquéreur") || ex.getMessage().toLowerCase().contains("acquirer") || ex.getMessage().toLowerCase().contains("switch")) {
                response.setMessage("Acquéreur indisponible.");
                // Si possible, set le code ISO 91 dans le message ISO
                // (si isoMsg est accessible ici, sinon à adapter)
            } else {
                response.setMessage("Erreur lors de l'envoi de la réponse ISO : " + ex.getMessage());
            }
            cause = ex.getMessage();
            saveToHistory("0210", new HashMap<>(), "", "RAW", "FAILED", cause);
        }

        return response;
    }

    private String getReasonByResponseCode(String code) {
        return switch (code) {
            case "00" -> "Transaction approuvée";
            case "01" -> "Référer à l’émetteur de carte";
            case "02" -> "Appel à autorisation requis";
            case "03" -> "Commerçant non valide";
            case "04" -> "Retenir la carte (carte volée suspectée)";
            case "05" -> "Transaction refusée";
            case "06" -> "Erreur de l’émetteur";
            case "12" -> "Code traitement non reconnu / Données invalides";
            case "13" -> "Montant invalide";
            case "14" -> "Carte invalide";
            case "15" -> "Compte inexistant";
            case "17" -> "Annulation client";
            case "19" -> "Réessayer la transaction";
            case "20" -> "Réponse erronée de l’émetteur";
            case "21" -> "Transaction déjà complétée";
            case "22" -> "Montant non disponible";
            case "30" -> "Erreur de format";
            case "39" -> "Devise non supportée";
            case "40" -> "Compte fermé";
            case "41" -> "Carte perdue ou bloquée";
            case "43" -> "Carte volée";
            case "47" -> "Devise non autorisée";
            case "51" -> "Fonds insuffisants";
            case "54" -> "Carte expirée";
            case "55" -> "PIN manquant ou incorrect";
            case "56" -> "Erreur de sécurité de la carte";
            case "57" -> "Transaction non autorisée pour cette carte";
            case "58" -> "Terminal non autorisé";
            case "62" -> "Compte restreint";
            case "63" -> "Mauvais cryptogramme ou validation échouée";
            case "68" -> "Timeout dépassé / réponse tardive";
            case "75" -> "Nombre de tentatives PIN dépassé";
            case "91" -> "Acquéreur indisponible";
            case "92" -> "Routage introuvable";
            case "94" -> "Transaction en double";
            case "96" -> "Erreur système (système indisponible)";
            default -> "Erreur inconnue";
        };
    }

    // --- Ajout : validation du champ montant (field 4) ---
    private void validateAmount(String amount) {
        if (amount == null || !amount.matches("\\d+")) {
            throw new IllegalArgumentException("Montant invalide : doit être numérique.");
        }
        if (amount.matches("1+")) {
            throw new IllegalArgumentException("Montant illogique : ne peut pas être tout à 1.");
        }
        if (new java.math.BigDecimal(amount).compareTo(new java.math.BigDecimal("1000000")) > 0) {
            throw new IllegalArgumentException("Montant trop élevé.");
        }
    }


    private void saveToHistory(String mti, Map<String, String> fields, String messageIso, String format, String status, String cause) {
        try {
            ResponseISOHistory history = new ResponseISOHistory();
            history.setMti(mti);
            // Toujours sérialiser les fields même si vide
            history.setFields(objectMapper.writeValueAsString(fields != null ? fields : new HashMap<>()));
            // Toujours stocker le messageIso reçu ou généré
            history.setMessageIso(messageIso != null ? messageIso : "");
            history.setFormat(format);
            history.setStatus(status);
            history.setCreatedAt(java.time.LocalDateTime.now());
            history.setCause(cause);
            // Ajout : stocker les détails enrichis si disponibles dans le thread courant
            if (ThreadLocalDetailsHolder.details != null) {
                history.setDetails(objectMapper.writeValueAsString(ThreadLocalDetailsHolder.details));
            }
            historyRepository.save(history);
            log.info("🗃️ Réponse ISO enregistrée avec succès dans la base de données.");
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'enregistrement de la réponse ISO dans la base de données : {}", e.getMessage(), e);
        }
    }

    // ThreadLocal pour transmettre les détails enrichis à saveToHistory
    private static class ThreadLocalDetailsHolder {
        static ThreadLocal<Map<String, Object>> detailsThreadLocal = new ThreadLocal<>();
        static Map<String, Object> get() { return detailsThreadLocal.get(); }
        static void set(Map<String, Object> details) { detailsThreadLocal.set(details); }
        static void clear() { detailsThreadLocal.remove(); }
        static Map<String, Object> details = null;
    }

    // Logique de gestion des tentatives PIN
    private void handlePinTry(String pan, boolean pinCorrect, ISOMsg isoMsg) {
        if (pan == null) return;
        PinTryCounter counter = pinTryCounterRepository.findById(pan).orElse(new PinTryCounter());
        counter.setPan(pan);
        if (counter.isBlocked()) {
            isoMsg.set(39, "75"); // Carte déjà bloquée
            return;
        }
        if (pinCorrect) {
            counter.setTries(0); // Reset en cas de succès
        } else {
            counter.setTries(counter.getTries() + 1);
            if (counter.getTries() >= MAX_PIN_TRIES) {
                counter.setBlocked(true);
                isoMsg.set(39, "75"); // Nombre de tentatives dépassé
            }
        }
        pinTryCounterRepository.save(counter);
    }

    // À adapter selon ta logique de vérification du PIN
    private boolean isPinCorrect(String pan, String pin) {
        // TODO: Ajoute ici ta logique de vérification du PIN réel
        return true; // ou false selon le test
    }
}