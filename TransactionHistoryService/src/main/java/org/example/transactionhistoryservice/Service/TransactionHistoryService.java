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
            String source,
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
            if (source != null && !source.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("source"), source));
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
