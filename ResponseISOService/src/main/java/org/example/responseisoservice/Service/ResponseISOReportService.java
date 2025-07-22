package org.example.responseisoservice.Service;


import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.example.responseisoservice.Entity.ResponseISOHistory;
import org.example.responseisoservice.repository.ResponseISOHistoryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResponseISOReportService {
    private final ResponseISOHistoryRepository repository;

    public ResponseISOReportService(ResponseISOHistoryRepository repository) {
        this.repository = repository;
    }

    public static class ResponseISOHistoryReportDTO {
        private Long id;
        private String mti;
        private String status;
        private java.time.LocalDateTime createdAt;
        private String cause;
        private String rrn;
        private String fields;
        private String details;

        public ResponseISOHistoryReportDTO(org.example.responseisoservice.Entity.ResponseISOHistory entity) {
            this.id = entity.getId();
            this.mti = entity.getMti();
            this.status = entity.getStatus();
            this.createdAt = entity.getCreatedAt();
            this.cause = entity.getCause();
            this.rrn = extractRRN(entity.getFields());
            this.fields = entity.getFields();
            this.details = entity.getDetails(); // Ajout du champ details
        }
        private String extractRRN(String fieldsJson) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<String, String> map = mapper.readValue(fieldsJson, java.util.Map.class);
                return map.getOrDefault("37", "");
            } catch (Exception e) {
                return "";
            }
        }
        public Long getId() { return id; }
        public String getMti() { return mti; }
        public String getStatus() { return status; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public String getCause() { return cause; }
        public String getRrn() { return rrn; }
        public String getFields() { return fields; }
        public String getDetails() { return details; }
    }

    public byte[] exportPdf() throws Exception {
        java.util.List<org.example.responseisoservice.Entity.ResponseISOHistory> responses = repository.findAll();
        java.util.List<ResponseISOHistoryReportDTO> dtos = responses.stream()
                .map(ResponseISOHistoryReportDTO::new)
                .toList();
        java.io.InputStream reportStream = new org.springframework.core.io.ClassPathResource("reports/iso_responses_report.jrxml").getInputStream();
        net.sf.jasperreports.engine.JasperReport jasperReport = net.sf.jasperreports.engine.JasperCompileManager.compileReport(reportStream);
        net.sf.jasperreports.engine.data.JRBeanCollectionDataSource dataSource = new net.sf.jasperreports.engine.data.JRBeanCollectionDataSource(dtos);
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("createdBy", "ResponseISOService");
        net.sf.jasperreports.engine.JasperPrint jasperPrint = net.sf.jasperreports.engine.JasperFillManager.fillReport(jasperReport, params, dataSource);
        return net.sf.jasperreports.engine.JasperExportManager.exportReportToPdf(jasperPrint);
    }

    public byte[] exportExcel() throws Exception {
        List<ResponseISOHistory> responses = repository.findAll();
        List<ResponseISOHistoryReportDTO> dtos = responses.stream().map(ResponseISOHistoryReportDTO::new).toList();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Réponses ISO");
            // Header
            Row header = sheet.createRow(0);
            String[] columns = {"ID", "MTI", "Statut", "Date", "Cause", "RRN"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }
            // Data
            int rowIdx = 1;
            for (ResponseISOHistoryReportDTO dto : dtos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getId() != null ? dto.getId() : 0);
                row.createCell(1).setCellValue(dto.getMti() != null ? dto.getMti() : "");
                row.createCell(2).setCellValue(dto.getStatus() != null ? dto.getStatus() : "");
                row.createCell(3).setCellValue(dto.getCreatedAt() != null ? dto.getCreatedAt().toString() : "");
                row.createCell(4).setCellValue(dto.getCause() != null ? dto.getCause() : "");
                row.createCell(5).setCellValue(dto.getRrn() != null ? dto.getRrn() : "");
            }
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportCsv() {
        List<ResponseISOHistory> responses = repository.findAll();
        List<ResponseISOHistoryReportDTO> dtos = responses.stream().map(ResponseISOHistoryReportDTO::new).toList();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,MTI,Statut,Date,Cause,RRN\n");
        for (ResponseISOHistoryReportDTO dto : dtos) {
            sb.append(dto.getId() != null ? dto.getId() : "").append(",");
            sb.append(dto.getMti() != null ? dto.getMti() : "").append(",");
            sb.append(dto.getStatus() != null ? dto.getStatus() : "").append(",");
            sb.append(dto.getCreatedAt() != null ? dto.getCreatedAt() : "").append(",");
            sb.append(dto.getCause() != null ? dto.getCause().replace(",", " ") : "").append(",");
            sb.append(dto.getRrn() != null ? dto.getRrn() : "").append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
} 