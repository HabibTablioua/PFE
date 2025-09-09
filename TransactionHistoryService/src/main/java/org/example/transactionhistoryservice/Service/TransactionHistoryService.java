package org.example.transactionhistoryservice.Service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.example.transactionhistoryservice.DTO.TransactionHistoryRequest;
import org.example.transactionhistoryservice.Entite.TransactionHistory;
import org.example.transactionhistoryservice.Repository.OperationTypeRepository;
import org.example.transactionhistoryservice.Repository.TransactionHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionHistoryService {

    public static final Map<String, String> CURRENCY_CODE_MAP = new HashMap<>();
    static {
        CURRENCY_CODE_MAP.put("504", "MAD");
        CURRENCY_CODE_MAP.put("788", "TND"); // Dinar tunisien
        CURRENCY_CODE_MAP.put("978", "EUR"); // Euro
        CURRENCY_CODE_MAP.put("840", "USD"); // Dollar américain
        CURRENCY_CODE_MAP.put("826", "GBP"); // Livre sterling
        CURRENCY_CODE_MAP.put("124", "CAD"); // Dollar canadien
        CURRENCY_CODE_MAP.put("392", "JPY"); // Yen japonais
        CURRENCY_CODE_MAP.put("156", "CNY"); // Yuan chinois
        // Ajoutez d'autres codes si besoin
    }

    public static final Map<String, String> COUNTRY_CODE_MAP = new HashMap<>();
    static {
        COUNTRY_CODE_MAP.put("504", "Maroc");
        COUNTRY_CODE_MAP.put("250", "France");
        // Ajoutez d'autres codes pays si besoin
    }

    public static final Map<String, String> TERMINAL_TYPE_MAP = new HashMap<>();
    static {
        TERMINAL_TYPE_MAP.put("01", "ATM");
        TERMINAL_TYPE_MAP.put("02", "POS");
        // Ajoutez d'autres types de terminaux si besoin
    }

    public static final Map<String, String> PROCESSING_CODE_MAP = new HashMap<>();
    static {
        PROCESSING_CODE_MAP.put("000000", "Achat");
        PROCESSING_CODE_MAP.put("200000", "Retrait");
        PROCESSING_CODE_MAP.put("310000", "Solde");
        PROCESSING_CODE_MAP.put("380000", "Paiement facture");
        PROCESSING_CODE_MAP.put("400000", "Virement");
        // Ajoutez d'autres codes de traitement si besoin
    }
    // Ajoutez ici d'autres mappings pour d'autres champs ISO8583 si besoin

    public static final Map<String, String> ENTRY_MODE_MAP = new HashMap<>();
    static {
        ENTRY_MODE_MAP.put("010", "ATM");
        ENTRY_MODE_MAP.put("021", "Mobile");
        ENTRY_MODE_MAP.put("022", "Mobile");
        ENTRY_MODE_MAP.put("051", "POS");
        ENTRY_MODE_MAP.put("052", "POS");
        ENTRY_MODE_MAP.put("071", "E-commerce");
        ENTRY_MODE_MAP.put("081", "Web");
        ENTRY_MODE_MAP.put("091", "Call Center");
        ENTRY_MODE_MAP.put("111", "Kiosk");
        // ... autres modes d'entrée
    }

    public static final Map<String, String> RESPONSE_CODE_MAP = new HashMap<>();
    static {
        RESPONSE_CODE_MAP.put("00", "Succès");
        RESPONSE_CODE_MAP.put("05", "Refusé");
        RESPONSE_CODE_MAP.put("12", "Transaction invalide");
        RESPONSE_CODE_MAP.put("14", "Numéro de carte invalide");
        RESPONSE_CODE_MAP.put("51", "Fonds insuffisants");
        RESPONSE_CODE_MAP.put("54", "Carte expirée");
        RESPONSE_CODE_MAP.put("91", "Émetteur injoignable");
        // ... autres codes réponse
    }

    public static final Map<String, String> MCC_MAP = new HashMap<>();
    static {
        MCC_MAP.put("5411", "Épiceries/Supermarchés");
        MCC_MAP.put("5812", "Restaurants");
        MCC_MAP.put("4111", "Transport");
        MCC_MAP.put("6011", "Distributeurs automatiques de billets");
        // ... autres MCC
    }

    public static final Map<String, String> FIELD_NAME_MAP = new HashMap<>();
    static {
        FIELD_NAME_MAP.put("0", "Message Type Indicator");
        FIELD_NAME_MAP.put("1", "Bitmap");
        FIELD_NAME_MAP.put("2", "Primary Account Number");
        FIELD_NAME_MAP.put("3", "Processing Code");
        FIELD_NAME_MAP.put("4", "Amount, Transaction");
        FIELD_NAME_MAP.put("5", "Amount, Settlement");
        FIELD_NAME_MAP.put("6", "Amount, Cardholder Billing");
        FIELD_NAME_MAP.put("7", "Transmission Date & Time");
        FIELD_NAME_MAP.put("8", "Amount, Cardholder Billing Fee");
        FIELD_NAME_MAP.put("9", "Conversion Rate, Settlement");
        FIELD_NAME_MAP.put("10", "Conversion Rate, Cardholder Billing");
        FIELD_NAME_MAP.put("11", "System Trace Audit Number");
        FIELD_NAME_MAP.put("12", "Time, Local Transaction");
        FIELD_NAME_MAP.put("13", "Date, Local Transaction");
        FIELD_NAME_MAP.put("14", "Date, Expiration");
        FIELD_NAME_MAP.put("15", "Date, Settlement");
        FIELD_NAME_MAP.put("16", "Date, Conversion");
        FIELD_NAME_MAP.put("17", "Date, Capture");
        FIELD_NAME_MAP.put("18", "Merchant Category Code");
        FIELD_NAME_MAP.put("19", "Acquiring Institution Country Code");
        FIELD_NAME_MAP.put("20", "PAN Extended Country Code");
        FIELD_NAME_MAP.put("21", "Forwarding Institution Country Code");
        FIELD_NAME_MAP.put("22", "Point of Service Entry Mode");
        FIELD_NAME_MAP.put("23", "Card Sequence Number");
        FIELD_NAME_MAP.put("24", "Function Code");
        FIELD_NAME_MAP.put("25", "Point of Service Condition Code");
        FIELD_NAME_MAP.put("26", "POS Capture Code");
        FIELD_NAME_MAP.put("27", "Authorizing Identification Response Length");
        FIELD_NAME_MAP.put("28", "Amount, Transaction Fee");
        FIELD_NAME_MAP.put("29", "Amount, Settlement Fee");
        FIELD_NAME_MAP.put("30", "Amount, Transaction Processing Fee");
        FIELD_NAME_MAP.put("31", "Amount, Settlement Processing Fee");
        FIELD_NAME_MAP.put("32", "Acquiring Institution ID Code");
        FIELD_NAME_MAP.put("33", "Forwarding Institution ID Code");
        FIELD_NAME_MAP.put("34", "Primary Account Number, Extended");
        FIELD_NAME_MAP.put("35", "Track 2 Data");
        FIELD_NAME_MAP.put("36", "Track 3 Data");
        FIELD_NAME_MAP.put("37", "Retrieval Reference Number");
        FIELD_NAME_MAP.put("38", "Authorization Identification Response");
        FIELD_NAME_MAP.put("39", "Response Code");
        FIELD_NAME_MAP.put("40", "Service Restriction Code");
        FIELD_NAME_MAP.put("41", "Card Acceptor Terminal Identification");
        FIELD_NAME_MAP.put("42", "Card Acceptor Identification Code");
        FIELD_NAME_MAP.put("43", "Card Acceptor Name/Location");
        FIELD_NAME_MAP.put("44", "Additional Response Data");
        FIELD_NAME_MAP.put("45", "Track 1 Data");
        FIELD_NAME_MAP.put("46", "Additional Data - ISO");
        FIELD_NAME_MAP.put("47", "Additional Data - National");
        FIELD_NAME_MAP.put("48", "Additional Data - Private");
        FIELD_NAME_MAP.put("49", "Currency Code, Transaction");
    }

    public static final Map<String, String> FIELD_EXPLANATION_MAP = new HashMap<>();
    static {
        FIELD_EXPLANATION_MAP.put("0", "Type de message ISO (ex : 0200 = demande financière, 0210 = réponse)");
        FIELD_EXPLANATION_MAP.put("1", "Bitmap : indique quels champs sont présents dans le message");
        FIELD_EXPLANATION_MAP.put("2", "Numéro de carte (PAN) du porteur");
        FIELD_EXPLANATION_MAP.put("3", "Code de traitement (ex : 000000 = achat, 310000 = solde)");
        FIELD_EXPLANATION_MAP.put("4", "Montant de la transaction (en centimes)");
        FIELD_EXPLANATION_MAP.put("5", "Montant du règlement");
        FIELD_EXPLANATION_MAP.put("6", "Montant facturé au porteur");
        FIELD_EXPLANATION_MAP.put("7", "Date et heure de transmission (MMDDhhmmss)");
        FIELD_EXPLANATION_MAP.put("8", "Frais facturés au porteur");
        FIELD_EXPLANATION_MAP.put("9", "Taux de conversion pour le règlement");
        FIELD_EXPLANATION_MAP.put("10", "Taux de conversion pour la facturation au porteur");
        FIELD_EXPLANATION_MAP.put("11", "Numéro d'audit de la transaction (STAN)");
        FIELD_EXPLANATION_MAP.put("12", "Heure locale de la transaction (hhmmss)");
        FIELD_EXPLANATION_MAP.put("13", "Date locale de la transaction (MMDD)");
        FIELD_EXPLANATION_MAP.put("14", "Date d'expiration de la carte (YYMM)");
        FIELD_EXPLANATION_MAP.put("15", "Date de règlement");
        FIELD_EXPLANATION_MAP.put("16", "Date de conversion");
        FIELD_EXPLANATION_MAP.put("17", "Date de capture");
        FIELD_EXPLANATION_MAP.put("18", "Code catégorie commerçant (MCC)");
        FIELD_EXPLANATION_MAP.put("19", "Code pays de l’institution acquéreuse (ex : 504 = Maroc)");
        FIELD_EXPLANATION_MAP.put("20", "Code pays PAN étendu");
        FIELD_EXPLANATION_MAP.put("21", "Code pays de l’institution de routage");
        FIELD_EXPLANATION_MAP.put("22", "Mode de saisie au point de service (ex : 010 = ATM, 021 = Mobile)");
        FIELD_EXPLANATION_MAP.put("23", "Numéro de séquence de la carte");
        FIELD_EXPLANATION_MAP.put("24", "Code fonction");
        FIELD_EXPLANATION_MAP.put("25", "Code condition au point de service");
        FIELD_EXPLANATION_MAP.put("26", "Code de capture POS");
        FIELD_EXPLANATION_MAP.put("27", "Longueur de la réponse d'autorisation");
        FIELD_EXPLANATION_MAP.put("28", "Frais de transaction");
        FIELD_EXPLANATION_MAP.put("29", "Frais de règlement");
        FIELD_EXPLANATION_MAP.put("30", "Frais de traitement de la transaction");
        FIELD_EXPLANATION_MAP.put("31", "Frais de traitement du règlement");
        FIELD_EXPLANATION_MAP.put("32", "Code d'identification de l’institution acquéreuse");
        FIELD_EXPLANATION_MAP.put("33", "Code d'identification de l’institution de routage");
        FIELD_EXPLANATION_MAP.put("34", "Numéro de carte étendu");
        FIELD_EXPLANATION_MAP.put("35", "Données piste 2");
        FIELD_EXPLANATION_MAP.put("36", "Données piste 3");
        FIELD_EXPLANATION_MAP.put("37", "Numéro de référence de récupération (RRN)");
        FIELD_EXPLANATION_MAP.put("38", "Code d'autorisation");
        FIELD_EXPLANATION_MAP.put("39", "Code de réponse (ex : 00 = succès, 05 = refus)");
        FIELD_EXPLANATION_MAP.put("40", "Code de restriction de service");
        FIELD_EXPLANATION_MAP.put("41", "Identifiant du terminal commerçant");
        FIELD_EXPLANATION_MAP.put("42", "Code d'identification du commerçant");
        FIELD_EXPLANATION_MAP.put("43", "Nom et localisation du commerçant");
        FIELD_EXPLANATION_MAP.put("44", "Données de réponse additionnelles");
        FIELD_EXPLANATION_MAP.put("45", "Données piste 1");
        FIELD_EXPLANATION_MAP.put("46", "Données additionnelles ISO");
        FIELD_EXPLANATION_MAP.put("47", "Données additionnelles nationales");
        FIELD_EXPLANATION_MAP.put("48", "Données additionnelles privées");
        FIELD_EXPLANATION_MAP.put("49", "Code de la devise de la transaction (ex : 504 = MAD, 840 = USD)");
    }

    public static final Map<String, String> FUNCTION_CODE_MAP = new HashMap<>();
    static {
        FUNCTION_CODE_MAP.put("200", "Demande d'autorisation");
        FUNCTION_CODE_MAP.put("220", "Demande de solde");
        FUNCTION_CODE_MAP.put("400", "Annulation");
        FUNCTION_CODE_MAP.put("420", "Remboursement");
        // ... autres codes fonction
    }

    public static final Map<String, String> POS_CONDITION_CODE_MAP = new HashMap<>();
    static {
        POS_CONDITION_CODE_MAP.put("00", "Transaction normale");
        POS_CONDITION_CODE_MAP.put("01", "Carte absente");
        POS_CONDITION_CODE_MAP.put("02", "Transaction manuelle");
        POS_CONDITION_CODE_MAP.put("03", "Transaction par téléphone");
        POS_CONDITION_CODE_MAP.put("08", "Transaction par distributeur (ATM)");
        POS_CONDITION_CODE_MAP.put("51", "Transaction par internet");
        // ... autres codes si besoin
    }

    @Autowired
    private TransactionHistoryRepository repository;

    @Autowired
    private OperationTypeRepository operationTypeRepository; // Ajout du repository OperationType

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void save(TransactionHistoryRequest request) {
        try {
            String fieldsJson = objectMapper.writeValueAsString(request.getFields());

            TransactionHistory  history = new TransactionHistory();
            history.setMti(request.getMti());
            history.setFieldsJson(fieldsJson);
            history.setMessage(request.getMessage());
            history.setFormat(request.getFormat());
            // Mapping élargi de la source à partir du champ 22
            String entryMode = request.getFields().get("22");
            String source = "Autre";
            if (entryMode != null) {
                switch (entryMode) {
                    case "010": source = "ATM"; break;
                    case "021":
                    case "022": source = "Mobile"; break;
                    case "051":
                    case "052": source = "POS"; break;
                    case "071": source = "E-commerce"; break;
                    case "081": source = "Web"; break;
                    case "091": source = "Call Center"; break;
                    case "111": source = "Kiosk"; break;
                    default: source = "Autre";
                }
            }
            history.setSource(source);
            history.setStatus(request.getStatus());

            // Extraire le processing code depuis les champs (champ 3)
            String processingCode = request.getFields().get("3");
            if (processingCode != null) {
                operationTypeRepository.findByCode(processingCode)
                        .ifPresent(history::setOperationType);
            }

            repository.save(history);
        } catch (Exception e) {
            throw new RuntimeException("❌ Error saving transaction history", e);
        }
    }
    public List<TransactionHistory> getAll() {
        return repository.findAll();
    }

    public List<TransactionHistory> searchByMti(String mti) {
        return repository.findByMti(mti);
    }

    public List<TransactionHistory> searchByFormat(String format) {
        return repository.findByFormat(format);
    }

    public List<TransactionHistory> searchBySource(String source) {
        return repository.findBySource(source);
    }

    public List<TransactionHistory> searchByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByCreatedAtBetween(start, end);
    }

    public Optional<TransactionHistory> getById(Long id) {
        return repository.findById(id);
    }

    public TransactionHistory update(Long id, TransactionHistory updated) {
        TransactionHistory existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        existing.setMti(updated.getMti());
        existing.setFieldsJson(updated.getFieldsJson());
        existing.setMessage(updated.getMessage());
        existing.setFormat(updated.getFormat());
        existing.setSource(updated.getSource());
        existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    public void deleteByIds(List<Long> ids) {
        repository.deleteAllById(ids);
    }

    public List<TransactionHistory> getFilteredTransactions(
            String mti,
            String format,
            String rrn,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String searchTerm) {

        Specification<TransactionHistory> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (mti != null && !mti.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("mti"), mti));
            }
            if (format != null && !format.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("format"), format));
            }
            if (rrn != null && !rrn.isEmpty()) {
                // Filtrage par RRN dans le champ fieldsJson
                predicates.add(criteriaBuilder.like(root.get("fieldsJson"), "%\"37\":\"" + rrn + "\"%"));
            }
            if (startDate != null && endDate != null) {
                predicates.add(criteriaBuilder.between(root.get("createdAt"), startDate, endDate));
            } else if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            } else if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            if (searchTerm != null && !searchTerm.isEmpty()) {
                String trimmedSearchTerm = searchTerm.trim(); // Trim leading/trailing spaces
                
                // Try to parse searchTerm as a Long for ID search
                try {
                    Long id = Long.parseLong(trimmedSearchTerm);
                    predicates.add(criteriaBuilder.equal(root.get("id"), id));
                    // If it's a valid ID, only search by ID and return early
                    return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
                } catch (NumberFormatException e) {
                    // Not a valid number, proceed with text-based search
                    String lowerCaseSearchTerm = "%" + trimmedSearchTerm.toLowerCase() + "%";
                    List<Predicate> textSearchPredicates = new ArrayList<>();

                    textSearchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("mti")), lowerCaseSearchTerm));
                    textSearchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("format")), lowerCaseSearchTerm));
                    textSearchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("source")), lowerCaseSearchTerm));
                    // No lower() for CLOB fields like 'message' and 'fieldsJson'
                    textSearchPredicates.add(criteriaBuilder.like(root.get("message"), lowerCaseSearchTerm));
                    textSearchPredicates.add(criteriaBuilder.like(root.get("fieldsJson"), lowerCaseSearchTerm));
                    textSearchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("status")), lowerCaseSearchTerm));

                    if (!textSearchPredicates.isEmpty()) {
                        predicates.add(criteriaBuilder.or(textSearchPredicates.toArray(new Predicate[0])));
                    }
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Map<String, Object>> countTransactionsPerDay() {
        List<Object[]> results = repository.countTransactionsGroupedByDay();
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0].toString());
            map.put("count", ((Number) row[1]).intValue());
            stats.add(map);
        }
        return stats;
    }

    public List<Map<String, Object>> countTransactionsByStatus() {
        List<Object[]> results = repository.countByStatus();
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("status", row[0]);
            map.put("count", ((Number) row[1]).intValue());
            stats.add(map);
        }
        return stats;
    }

    public List<Map<String, Object>> countTransactionsBySource() {
        List<Object[]> results = repository.countBySource();
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("source", row[0]);
            map.put("count", ((Number) row[1]).intValue());
            stats.add(map);
        }
        return stats;
    }

    public long countAllTransactions() {
        return repository.count();
    }

    public void updateSourcesFromFieldsJson() {
        List<TransactionHistory> all = repository.findAll();
        for (TransactionHistory tx : all) {
            try {
                Map<String, String> fields = objectMapper.readValue(
                    tx.getFieldsJson(), new TypeReference<Map<String, String>>() {});
                String entryMode = fields.get("22");
                String source = "Autre";
                if (entryMode != null) {
                    switch (entryMode) {
                        case "010": source = "ATM"; break;
                        case "021":
                        case "022": source = "Mobile Banking"; break;
                        case "051":
                        case "052": source = "POS"; break;
                        case "071": source = "E-commerce"; break;
                        case "081": source = "Web Banking"; break;
                        case "091": source = "Call Center"; break;
                        case "111": source = "Kiosk"; break;
                        case "121": source = "Virement"; break;
                        case "131": source = "Prélèvement"; break;
                        default: source = "Autre";
                    }
                }
                tx.setSource(source);
                repository.save(tx);
            } catch (Exception e) {
                // Log ou ignorer
            }
        }
    }

    @Service
    public static class PdfExportService {

        public byte[] generatePdf(List<TransactionHistory> transactions) throws Exception {
            // Convert transactions to a format suitable for the report
            List<Map<String, Object>> reportData = transactions.stream()
                .map(tx -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("mti", tx.getMti());
                    data.put("validationStatus", tx.getStatus());
                    data.put("responseCode", tx.getOperationType() != null ? tx.getOperationType().getCode() : "N/A");
                    data.put("timestamp", tx.getCreatedAt());
                    data.put("status", tx.getStatus());
                    data.put("transactionId", tx.getId().toString());
                    return data;
                })
                .collect(Collectors.toList());

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(reportData);

            // Load and compile the report
            JasperReport jasperReport = JasperCompileManager
                    .compileReport(getClass().getResourceAsStream("/reports/transaction_report.jrxml"));

            // Set up parameters
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("createdBy", "TransactionHistoryService");
            parameters.put("TransactionDataset", dataSource);

            // Fill and export the report
            JasperPrint print = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
            return JasperExportManager.exportReportToPdf(print);
        }
    }

    @Service
    public static class ExcelExportService {

        public byte[] generateExcel(List<TransactionHistory> transactions) throws IOException {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Transaction History");

            // Create header row
            String[] headers = {"ID", "MTI", "Format", "Source", "Status", "Date", "Message Content"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Populate data rows
            int rowNum = 1;
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            for (TransactionHistory tx : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(tx.getId() != null ? tx.getId().toString() : "");
                row.createCell(1).setCellValue(tx.getMti() != null ? tx.getMti() : "");
                row.createCell(2).setCellValue(tx.getFormat() != null ? tx.getFormat() : "");
                row.createCell(3).setCellValue(tx.getSource() != null ? tx.getSource() : "");
                row.createCell(4).setCellValue(tx.getStatus() != null ? tx.getStatus() : "");
                row.createCell(5).setCellValue(tx.getCreatedAt() != null ? formatter.format(tx.getCreatedAt()) : "");
                row.createCell(6).setCellValue(tx.getMessage() != null ? tx.getMessage() : "");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            return outputStream.toByteArray();
        }
    }

    @Service
    public static class CsvExportService {

        public byte[] generateCsv(List<TransactionHistory> transactions) throws IOException {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(outputStream);

            // Write CSV header
            writer.println("ID,MTI,Format,Source,Status,Date,Message Content");

            // Write data rows
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            for (TransactionHistory tx : transactions) {
                writer.printf("%s,%s,%s,%s,%s,%s,%s\n",
                        tx.getId() != null ? tx.getId().toString() : "",
                        tx.getMti() != null ? escapeCsv(tx.getMti()) : "",
                        tx.getFormat() != null ? escapeCsv(tx.getFormat()) : "",
                        tx.getSource() != null ? escapeCsv(tx.getSource()) : "",
                        tx.getStatus() != null ? escapeCsv(tx.getStatus()) : "",
                        tx.getCreatedAt() != null ? formatter.format(tx.getCreatedAt()) : "",
                        tx.getMessage() != null ? escapeCsv(tx.getMessage()) : ""
                );
            }

            writer.flush();
            return outputStream.toByteArray();
        }

        private String escapeCsv(String value) {
            if (value == null) {
                return "";
            }
            // Enclose in double quotes if it contains comma, double quote or newline
            if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
                return "\"" + value.replace("\"", "\"\"") + "\"";
            }
            return value;
        }
    }

}
