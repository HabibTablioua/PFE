package org.example.transactionhistoryservice.Controller;


import org.example.transactionhistoryservice.DTO.TransactionHistoryRequest;
import org.example.transactionhistoryservice.Entite.TransactionHistory;
import org.example.transactionhistoryservice.Service.TransactionHistoryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/history")
public class TransactionHistoryController {

    private final TransactionHistoryService historyService;
    private final TransactionHistoryService.PdfExportService pdfExportService;
    private final TransactionHistoryService.ExcelExportService excelExportService;
    private final TransactionHistoryService.CsvExportService csvExportService;

    public TransactionHistoryController(
            TransactionHistoryService historyService,
            TransactionHistoryService.PdfExportService pdfExportService,
            TransactionHistoryService.ExcelExportService excelExportService,
            TransactionHistoryService.CsvExportService csvExportService) {
        this.historyService = historyService;
        this.pdfExportService = pdfExportService;
        this.excelExportService = excelExportService;
        this.csvExportService = csvExportService;
    }

    @PostMapping
    public void save(@RequestBody TransactionHistoryRequest request) {
        historyService.save(request);
    }

    @GetMapping
    public List<TransactionHistoryDTO> getAll(
            @RequestParam(required = false) String mti,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String searchTerm
    ) {
        List<TransactionHistory> transactions = historyService.getFilteredTransactions(mti, format, source, startDate, endDate, searchTerm);
        return transactions.stream().map(TransactionHistoryDTO::new).collect(Collectors.toList());
    }

    // DTO interne pour exposer le RRN
    public static class TransactionHistoryDTO {
        private Long id;
        private String mti;
        private String format;
        private String source;
        private String status;
        private String rrn;
        private String fieldsJson;
        private String message;
        private java.util.Date createdAt;
        // Ajout pour la devise
        private String currencyCode;
        private String currencyLabel;
        private String countryCode;
        private String countryLabel;
        private String terminalType;
        private String terminalLabel;
        private String processingCode;
        private String processingLabel;
        private List<FieldDetail> fields; // Liste dynamique de tous les champs ISO de la transaction
        public static class FieldDetail {
            private String fieldNumber;
            private String fieldName;
            private String value;
            private String label;
            private String explanation;
            public FieldDetail(String fieldNumber, String fieldName, String value, String label, String explanation) {
                this.fieldNumber = fieldNumber;
                this.fieldName = fieldName;
                this.value = value;
                this.label = label;
                this.explanation = explanation;
            }
            public String getFieldNumber() { return fieldNumber; }
            public String getFieldName() { return fieldName; }
            public String getValue() { return value; }
            public String getLabel() { return label; }
            public String getExplanation() { return explanation; }
        }
        public TransactionHistoryDTO(TransactionHistory entity) {
            this.id = entity.getId();
            this.mti = entity.getMti();
            this.format = entity.getFormat();
            this.source = entity.getSource();
            this.status = entity.getStatus();
            this.fieldsJson = entity.getFieldsJson();
            this.message = entity.getMessage();
            this.createdAt = entity.getCreatedAt();
            this.rrn = extractRRN(entity.getFieldsJson());
            try {
                ObjectMapper mapper = new ObjectMapper();
                java.util.Map<String, String> map = mapper.readValue(fieldsJson, java.util.Map.class);
                this.currencyCode = map.getOrDefault("49", "");
                this.currencyLabel = org.example.transactionhistoryservice.Service.TransactionHistoryService.CURRENCY_CODE_MAP.getOrDefault(this.currencyCode, "Inconnu");
                this.countryCode = map.getOrDefault("19", "");
                this.countryLabel = org.example.transactionhistoryservice.Service.TransactionHistoryService.COUNTRY_CODE_MAP.getOrDefault(this.countryCode, "Inconnu");
                this.terminalType = map.getOrDefault("41", "");
                this.terminalLabel = org.example.transactionhistoryservice.Service.TransactionHistoryService.TERMINAL_TYPE_MAP.getOrDefault(this.terminalType, "Inconnu");
                this.processingCode = map.getOrDefault("3", "");
                this.processingLabel = org.example.transactionhistoryservice.Service.TransactionHistoryService.PROCESSING_CODE_MAP.getOrDefault(this.processingCode, "Inconnu");
                // Générer la liste des champs dynamiquement
                this.fields = new java.util.ArrayList<>();
                for (Map.Entry<String, String> entry : map.entrySet()) {
                    String fieldNumber = entry.getKey();
                    String value = entry.getValue();
                    String fieldName = org.example.transactionhistoryservice.Service.TransactionHistoryService.FIELD_NAME_MAP.getOrDefault(fieldNumber, "Champ inconnu");
                    String label = "";
                    // Pour les montants, décoder la valeur humaine
                    if (fieldNumber.equals("4") || fieldNumber.equals("5") || fieldNumber.equals("6") || fieldNumber.equals("28") || fieldNumber.equals("29") || fieldNumber.equals("30") || fieldNumber.equals("31")) {
                        try {
                            long amount = Long.parseLong(value);
                            String currency = map.getOrDefault("49", "");
                            String currencyLabel = org.example.transactionhistoryservice.Service.TransactionHistoryService.CURRENCY_CODE_MAP.getOrDefault(currency, null);
                            if (currencyLabel != null) {
                                label = String.format("%.2f %s", amount / 100.0, currencyLabel);
                            } else if (currency != null && !currency.isEmpty()) {
                                label = String.format("%.2f (%s)", amount / 100.0, currency);
                            } else {
                                label = String.format("%.2f", amount / 100.0);
                            }
                        } catch (Exception ex) {
                            label = "";
                        }
                    } else if (fieldNumber.equals("7")) {
                        // Champ 7 : Transmission Date & Time (MMDDhhmmss)
                        if (value != null && value.length() == 10) {
                            try {
                                int month = Integer.parseInt(value.substring(0, 2));
                                int day = Integer.parseInt(value.substring(2, 4));
                                int hour = Integer.parseInt(value.substring(4, 6));
                                int minute = Integer.parseInt(value.substring(6, 8));
                                int second = Integer.parseInt(value.substring(8, 10));
                                String[] mois = {"", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."};
                                String moisStr = (month >= 1 && month <= 12) ? mois[month] : String.valueOf(month);
                                label = String.format("%02d %s, %02d:%02d:%02d", day, moisStr, hour, minute, second);
                            } catch (Exception ex) {
                                label = "";
                            }
                        }
                    } else if (fieldNumber.equals("12")) {
                        // Champ 12 : Time, Local Transaction (hhmmss)
                        if (value != null && value.length() == 6) {
                            try {
                                int hour = Integer.parseInt(value.substring(0, 2));
                                int minute = Integer.parseInt(value.substring(2, 4));
                                int second = Integer.parseInt(value.substring(4, 6));
                                label = String.format("%02d:%02d:%02d", hour, minute, second);
                            } catch (Exception ex) {
                                label = "";
                            }
                        }
                    } else if (fieldNumber.equals("13")) {
                        // Champ 13 : Date, Local Transaction (MMDD)
                        if (value != null && value.length() == 4) {
                            try {
                                int month = Integer.parseInt(value.substring(0, 2));
                                int day = Integer.parseInt(value.substring(2, 4));
                                String[] mois = {"", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."};
                                String moisStr = (month >= 1 && month <= 12) ? mois[month] : String.valueOf(month);
                                label = String.format("%02d %s", day, moisStr);
                            } catch (Exception ex) {
                                label = "";
                            }
                        }
                    } else if (fieldNumber.equals("49")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.CURRENCY_CODE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("19")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.COUNTRY_CODE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("20")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.COUNTRY_CODE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("21")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.COUNTRY_CODE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("41")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.TERMINAL_TYPE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("3")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.PROCESSING_CODE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("22")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.ENTRY_MODE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("39")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.RESPONSE_CODE_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("18")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.MCC_MAP.getOrDefault(value, "");
                    } else if (fieldNumber.equals("14")) {
                        // Champ 14 : Date, Expiration (YYMM)
                        if (value != null && value.length() == 4) {
                            try {
                                String yy = value.substring(0, 2);
                                String mm = value.substring(2, 4);
                                label = String.format("%s/%s", mm, yy);
                            } catch (Exception ex) {
                                label = "";
                            }
                        }
                    } else if (fieldNumber.equals("15") || fieldNumber.equals("16") || fieldNumber.equals("17")) {
                        // Champs 15, 16, 17 : MMDD
                        if (value != null && value.length() == 4) {
                            try {
                                int month = Integer.parseInt(value.substring(0, 2));
                                int day = Integer.parseInt(value.substring(2, 4));
                                String[] mois = {"", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."};
                                String moisStr = (month >= 1 && month <= 12) ? mois[month] : String.valueOf(month);
                                label = String.format("%02d %s", day, moisStr);
                            } catch (Exception ex) {
                                label = "";
                            }
                        }
                    } else if (fieldNumber.equals("24")) {
                        label = org.example.transactionhistoryservice.Service.TransactionHistoryService.FUNCTION_CODE_MAP.getOrDefault(value, "");
                    }
                    String explanation = org.example.transactionhistoryservice.Service.TransactionHistoryService.FIELD_EXPLANATION_MAP.getOrDefault(fieldNumber, "");
                    this.fields.add(new FieldDetail(fieldNumber, fieldName, value, label, explanation));
                }
            } catch (Exception e) {
                this.currencyCode = "";
                this.currencyLabel = "";
                this.countryCode = "";
                this.countryLabel = "";
                this.terminalType = "";
                this.terminalLabel = "";
                this.processingCode = "";
                this.processingLabel = "";
                this.fields = new java.util.ArrayList<>();
            }
        }
        private String extractRRN(String fieldsJson) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                java.util.Map<String, String> map = mapper.readValue(fieldsJson, java.util.Map.class);
                return map.getOrDefault("37", "");
            } catch (Exception e) {
                return "";
            }
        }
        public Long getId() { return id; }
        public String getMti() { return mti; }
        public String getFormat() { return format; }
        public String getSource() { return source; }
        public String getStatus() { return status; }
        public String getRrn() { return rrn; }
        public String getFieldsJson() { return fieldsJson; }
        public String getMessage() { return message; }
        public java.util.Date getCreatedAt() { return createdAt; }
        public String getCurrencyCode() { return currencyCode; }
        public String getCurrencyLabel() { return currencyLabel; }
        public String getCountryCode() { return countryCode; }
        public String getCountryLabel() { return countryLabel; }
        public String getTerminalType() { return terminalType; }
        public String getTerminalLabel() { return terminalLabel; }
        public String getProcessingCode() { return processingCode; }
        public String getProcessingLabel() { return processingLabel; }
        public List<FieldDetail> getFields() { return fields; }
    }

    @GetMapping("/search")
    public List<TransactionHistory> search(
            @RequestParam(required = false) String mti,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String searchTerm
    ) {
        return historyService.getFilteredTransactions(mti, format, source, start, end, searchTerm);
    }

    @GetMapping("/per-day")
    public List<Map<String, Object>> getTransactionsPerDay() {
        return historyService.countTransactionsPerDay();
    }

    @GetMapping("/per-status")
    public List<Map<String, Object>> getTransactionsByStatus() {
        return historyService.countTransactionsByStatus();
    }

    @GetMapping("/per-source")
    public List<Map<String, Object>> getTransactionsBySource() {
        return historyService.countTransactionsBySource();
    }

    @GetMapping("/count")
    public long countTransactions() {
        return historyService.countAllTransactions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionHistory> getById(@PathVariable Long id) {
        return historyService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionHistory> update(
            @PathVariable Long id,
            @RequestBody TransactionHistory request) {
        return ResponseEntity.ok(historyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        historyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll() {
        historyService.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete-batch")
    public ResponseEntity<Void> deleteTransactionsByIds(@RequestBody List<Long> ids) {
        historyService.deleteByIds(ids);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> downloadPdfReport(
            @RequestBody List<TransactionHistory> transactions
    ) {
        try {
            byte[] pdfBytes = pdfExportService.generatePdf(transactions);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "transaction_report.pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/export/excel")
    public ResponseEntity<byte[]> downloadExcelReport(
            @RequestBody List<TransactionHistory> transactions
    ) {
        try {
            byte[] excelBytes = excelExportService.generateExcel(transactions);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("filename", "transaction_report.xlsx");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/export/csv")
    public ResponseEntity<byte[]> downloadCsvReport(
            @RequestBody List<TransactionHistory> transactions
    ) {
        try {
            byte[] csvBytes = csvExportService.generateCsv(transactions);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("filename", "transaction_report.csv");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


