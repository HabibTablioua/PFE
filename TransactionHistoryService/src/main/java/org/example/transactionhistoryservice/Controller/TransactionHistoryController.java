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


