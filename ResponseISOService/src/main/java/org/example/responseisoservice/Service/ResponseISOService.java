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
    private static final java.util.Map<String, String> CURRENCY_CODES = java.util.Map.of(
        "788", "MAD", // Moroccan Dirham
        "840", "USD", // US Dollar
        "978", "EUR"  // Euro
    );

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
                response.setStatus("NON APPROUVÉE");
                response.setMessage("Numéro de carte invalide.");
                Map<String, Object> details = new HashMap<>();
                details.put("isoCode", "14");
                details.put("isoField", "2");
                details.put("reason", "Le PAN fourni ne passe pas la validation Luhn ou est absent.");
                details.put("pan", pan);
                details.put("action", "Vérifiez le numéro de carte saisi.");
                response.setDetails(details);
                // Remplir fields et messageIso même en cas d'échec
                extractFields(isoMsg, fields);
                try { messageIso = new String(isoMsg.pack()); } catch (Exception e) { messageIso = request.getIsoMessage(); }
                ThreadLocalDetailsHolder.details = details;
                saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
                ThreadLocalDetailsHolder.details = null;
                return response;
            }
            Optional<Card> cardOpt = cardRepository.findByPan(pan);
            if (cardOpt.isEmpty()) {
                isoMsg.set(39, "15"); // Carte inexistante
                response.setStatus("NON APPROUVÉE");
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
                response.setStatus("NON APPROUVÉE");
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
            response.setStatus(responseCode.equals("00") ? "APPROUVÉE" : "NON APPROUVÉE");
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
            // Validation du PIN supprimée - le PIN n'est plus requis
            log.info("🔒 Validation PIN désactivée pour PAN : {}", pan);
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
            
            // Convertir le code numérique en code alphabétique si nécessaire
            String currencyCode = currency;
            if (currency != null && CURRENCY_CODES.containsKey(currency)) {
                currencyCode = CURRENCY_CODES.get(currency);
                log.info("🔍 Devise convertie : {} -> {}", currency, currencyCode);
            }
            
            if (currency == null || !SUPPORTED_CURRENCIES.contains(currencyCode)) {
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
            response.setStatus("NON APPROUVÉE");
            response.setMessage("Erreur de traitement ISO : " + e.getMessage());
            cause = e.getMessage();
            saveToHistory("0210", new HashMap<>(), "", "RAW", "NON APPROUVÉE", cause);
        } catch (Exception ex) {
            log.error("❌ Autre erreur : {}", ex.getMessage());
            // Ajout : gestion acquéreur indisponible
            response.setStatus("NON APPROUVÉE");
            if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("acquéreur") || ex.getMessage().toLowerCase().contains("acquirer") || ex.getMessage().toLowerCase().contains("switch")) {
                response.setMessage("Acquéreur indisponible.");
                // Si possible, set le code ISO 91 dans le message ISO
                // (si isoMsg est accessible ici, sinon à adapter)
            } else {
                response.setMessage("Erreur lors de l'envoi de la réponse ISO : " + ex.getMessage());
            }
            cause = ex.getMessage();
            saveToHistory("0210", new HashMap<>(), "", "RAW", "NON APPROUVÉE", cause);
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
            // Ajouter le champ 52 même s'il n'est pas présent
            if (fields != null && !fields.containsKey("52")) {
                fields.put("52", "****");
            }
            
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

    // Logique de gestion des tentatives PIN améliorée
    private void handlePinTry(String pan, boolean pinCorrect, ISOMsg isoMsg) {
        if (pan == null) {
            log.warn("🔒 Gestion PIN : PAN manquant");
            return;
        }
        
        try {
            PinTryCounter counter = pinTryCounterRepository.findById(pan).orElse(new PinTryCounter());
            counter.setPan(pan);
            
            // Vérifier si la carte est déjà bloquée
            if (counter.isBlocked()) {
                log.warn("🔒 Carte bloquée pour PAN : {} (tentatives: {})", pan, counter.getTries());
                isoMsg.set(39, "75"); // Carte déjà bloquée
                return;
            }
            
            if (pinCorrect) {
                // PIN correct - reset du compteur
                if (counter.getTries() > 0) {
                    log.info("🔒 PIN correct pour PAN : {} - Reset du compteur de tentatives", pan);
                }
                counter.setTries(0);
                counter.setBlocked(false);
                isoMsg.set(39, "00"); // Succès
            } else {
                // PIN incorrect - incrémenter le compteur
                counter.setTries(counter.getTries() + 1);
                int remainingTries = MAX_PIN_TRIES - counter.getTries();
                
                log.warn("🔒 PIN incorrect pour PAN : {} - Tentative {}/{} (reste: {})", 
                        pan, counter.getTries(), MAX_PIN_TRIES, remainingTries);
                
                if (counter.getTries() >= MAX_PIN_TRIES) {
                    // Bloquer la carte
                    counter.setBlocked(true);
                    isoMsg.set(39, "75"); // Nombre de tentatives dépassé
                    log.error("🔒 Carte bloquée pour PAN : {} - Nombre de tentatives dépassé", pan);
                } else {
                    // PIN incorrect mais pas encore bloqué
                    isoMsg.set(39, "55"); // PIN incorrect
                }
            }
            
            // Sauvegarder l'état
            pinTryCounterRepository.save(counter);
            log.info("🔒 État PIN sauvegardé pour PAN : {} - Tentatives: {}, Bloqué: {}", 
                    pan, counter.getTries(), counter.isBlocked());
                    
        } catch (Exception e) {
            log.error("🔒 Erreur lors de la gestion des tentatives PIN pour PAN {} : {}", pan, e.getMessage());
            // En cas d'erreur, on refuse la transaction par sécurité
            isoMsg.set(39, "96"); // Erreur système
        }
    }

    // Validation complète du PIN
    private boolean isPinCorrect(String pan, String pin) {
        if (pan == null || pin == null) {
            log.warn("🔒 Validation PIN échouée : PAN ou PIN manquant");
            return false;
        }
        
        // Nettoyer le PIN en supprimant les zéros au début
        String cleanPin = pin.replaceAll("^0+", "");
        if (cleanPin.isEmpty()) {
            cleanPin = "0"; // Si tous les caractères étaient des zéros
        }
        
        // Validation du format du PIN
        if (!isValidPinFormat(pin)) {
            log.warn("🔒 Validation PIN échouée : Format PIN invalide pour PAN {}", pan);
            return false;
        }
        
        // Vérification du PIN dans la base de données
        try {
            Optional<Card> card = cardRepository.findByPan(pan);
            if (card.isPresent()) {
                String storedPin = card.get().getPin();
                boolean isValid = storedPin != null && storedPin.equals(cleanPin);
                log.info("🔒 Validation PIN pour PAN {} : {} (PIN reçu: {}, PIN nettoyé: {}, PIN stocké: {})", 
                        pan, isValid ? "SUCCÈS" : "ÉCHEC", pin, cleanPin, storedPin);
                return isValid;
            } else {
                log.warn("🔒 Carte non trouvée pour PAN : {}", pan);
                return false;
            }
        } catch (Exception e) {
            log.error("🔒 Erreur lors de la validation du PIN pour PAN {} : {}", pan, e.getMessage());
            return false;
        }
    }
    
    // Validation du format du PIN
    private boolean isValidPinFormat(String pin) {
        if (pin == null || pin.isEmpty()) {
            return false;
        }
        
        // Nettoyer le PIN en supprimant les zéros au début
        String cleanPin = pin.replaceAll("^0+", "");
        if (cleanPin.isEmpty()) {
            cleanPin = "0"; // Si tous les caractères étaient des zéros
        }
        
        // Le PIN doit être numérique et avoir une longueur entre 4 et 12 caractères
        if (!cleanPin.matches("\\d{4,12}")) {
            log.warn("🔒 PIN nettoyé invalide : {} (original: {})", cleanPin, pin);
            return false;
        }
        
        // Vérifications de sécurité supplémentaires
        // 1. Pas de séquences répétitives (ex: 1111, 1234, 0000)
        if (cleanPin.matches("(\\d)\\1{3,}") || // Répétition du même chiffre
            cleanPin.matches("(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)") || // Séquences
            cleanPin.equals("0000") || cleanPin.equals("1111") || cleanPin.equals("9999")) {
            return false;
        }
        
        log.info("🔒 PIN nettoyé valide : {} (original: {})", cleanPin, pin);
        return true;
    }

    public long countSuccessResponses() {
        return historyRepository.countByStatus("APPROUVÉE");
    }

    public long countFailedResponses() {
        return historyRepository.countByStatus("NON APPROUVÉE");
    }
    
    // Méthode isPinRequired supprimée
    
    // Méthode utilitaire pour extraire les champs
    private void extractFields(ISOMsg isoMsg, Map<String, String> fields) {
        fields.clear();
        if (isoMsg != null) {
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    fields.put(String.valueOf(i), isoMsg.getString(i));
                }
            }
        }
    }

    // Méthode utilitaire pour sauvegarder l'historique des transactions
    private void saveTransactionHistory(ISOMsg isoMsg, Map<String, String> fields, ResponseISOResponse response) {
        try {
            extractFields(isoMsg, fields);
            log.info("[DEBUG] Champs extraits pour historique : {}", fields);
            String messageIso = "";
            try { 
                if (isoMsg != null) messageIso = new String(isoMsg.pack()); 
            } catch (Exception e) { 
                messageIso = ""; 
            }
            log.info("[DEBUG] Message ISO généré pour historique : {}", messageIso);
            ThreadLocalDetailsHolder.details = response.getDetails();
            saveToHistory("0210", fields, messageIso, "RAW", response.getStatus(), response.getMessage());
            ThreadLocalDetailsHolder.details = null;
        } catch (Exception e) {
            log.error("❌ Erreur lors de la sauvegarde de l'historique : {}", e.getMessage());
        }
    }

    // --- Gestion des cartes ---
    private boolean isCardValid(String pan) {
        Optional<Card> cardOpt = cardRepository.findByPan(pan);
        if (cardOpt.isEmpty()) return false;
        Card card = cardOpt.get();
        // Statuts valides : ACTIVE, non bloquée, non volée, non perdue, non blacklistée, non restreinte, non expirée
        if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) return false;
        if (card.isBlacklisted() || card.isLost() || card.isStolen() || card.isRestricted()) return false;
        if (card.getExpiryDate() != null && card.getExpiryDate().isBefore(java.time.LocalDate.now())) return false;
        return true;
    }

    private String getCardStatusReason(String pan) {
        Optional<Card> cardOpt = cardRepository.findByPan(pan);
        if (cardOpt.isEmpty()) return "Carte inconnue";
        Card card = cardOpt.get();
        if (!"ACTIVE".equalsIgnoreCase(card.getStatus())) return "Carte inactive";
        if (card.isBlacklisted()) return "Carte blacklistée";
        if (card.isLost()) return "Carte déclarée perdue";
        if (card.isStolen()) return "Carte déclarée volée";
        if (card.isRestricted()) return "Carte restreinte";
        if (card.getExpiryDate() != null && card.getExpiryDate().isBefore(java.time.LocalDate.now())) return "Carte expirée";
        return "OK";
    }

    // --- Gestion des comptes ---
    private boolean isAccountValid(String pan) {
        Optional<Account> accOpt = accountRepository.findByPan(pan);
        if (accOpt.isEmpty()) return false;
        Account acc = accOpt.get();
        if (!"OPEN".equalsIgnoreCase(acc.getStatus())) return false;
        if (acc.isBlacklisted() || acc.isLost() || acc.isStolen() || acc.isRestricted()) return false;
        return true;
    }

    private String getAccountStatusReason(String pan) {
        Optional<Account> accOpt = accountRepository.findByPan(pan);
        if (accOpt.isEmpty()) return "Compte inconnu";
        Account acc = accOpt.get();
        if (!"OPEN".equalsIgnoreCase(acc.getStatus())) return "Compte fermé";
        if (acc.isBlacklisted()) return "Compte blacklisté";
        if (acc.isLost()) return "Compte déclaré perdu";
        if (acc.isStolen()) return "Compte déclaré volé";
        if (acc.isRestricted()) return "Compte restreint";
        return "OK";
    }

    private boolean hasSufficientBalance(String pan, java.math.BigDecimal amount) {
        Optional<Account> accOpt = accountRepository.findByPan(pan);
        if (accOpt.isEmpty()) return false;
        Account acc = accOpt.get();
        return acc.getBalance() != null && acc.getBalance().compareTo(amount) >= 0;
    }

    private void debitAccount(String pan, java.math.BigDecimal amount) {
        Optional<Account> accOpt = accountRepository.findByPan(pan);
        if (accOpt.isPresent()) {
            Account acc = accOpt.get();
            acc.setBalance(acc.getBalance().subtract(amount));
            accountRepository.save(acc);
        }
    }

    private void creditAccount(String pan, java.math.BigDecimal amount) {
        Optional<Account> accOpt = accountRepository.findByPan(pan);
        if (accOpt.isPresent()) {
            Account acc = accOpt.get();
            acc.setBalance(acc.getBalance().add(amount));
            accountRepository.save(acc);
        }
    }
    
    // Méthode utilitaire pour diagnostiquer les champs disponibles
    private String getAvailableFields(ISOMsg isoMsg) {
        if (isoMsg == null) return "ISO Message null";
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i <= isoMsg.getMaxField(); i++) {
            if (isoMsg.hasField(i)) {
                sb.append(i).append(":").append(isoMsg.getString(i).substring(0, Math.min(10, isoMsg.getString(i).length()))).append("... ");
            }
        }
        return sb.toString();
    }

    // --- Intégration dans le flux principal (exemple à placer dans processISO avant le traitement du PIN) ---
    // if (!isCardValid(pan)) { ... set code 54 ou 56 ... }
    // if (!isAccountValid(pan)) { ... set code 62 ... }
    // if (!hasSufficientBalance(pan, montant)) { ... set code 51 ... }
    // debitAccount(pan, montant); // après validation
}