package com.example.iso_report_service.service;

import com.example.iso_report_service.client.ValidationClient;
import com.example.iso_report_service.model.ValidationRecord;
import com.example.iso_report_service.model.ValidationReportDTO;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReportService {

    private final ValidationClient validationClient;

    public ReportService(ValidationClient validationClient) {
        this.validationClient = validationClient;
    }

    public byte[] generateValidationReportById(String id, String token) throws Exception {
        ValidationRecord record = validationClient.fetchById(id, token);
        ValidationReportDTO dto = new ValidationReportDTO(record);

        InputStream reportStream = getClass().getClassLoader().getResourceAsStream("ValidationHistoryReport.jrxml");
        if (reportStream == null) throw new FileNotFoundException("JRXML file not found");

        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(Collections.singletonList(dto));

        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, null, dataSource);
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

    public byte[] generateFullValidationReport(String token) throws Exception {
        ValidationRecord[] records = validationClient.fetchAll(token).toArray(new ValidationRecord[0]); // assuming it's an array

        List<ValidationReportDTO> reportData = Arrays.stream(records)
                .map(ValidationReportDTO::new)
                .toList();

        InputStream reportStream = getClass().getClassLoader().getResourceAsStream("ValidationHistoryReport.jrxml");
        if (reportStream == null) throw new FileNotFoundException("JRXML file not found");

        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(reportData);

        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, null, dataSource);
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }

}
