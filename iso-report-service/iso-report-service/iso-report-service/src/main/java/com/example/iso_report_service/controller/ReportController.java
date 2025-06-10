package com.example.iso_report_service.controller;

import com.example.iso_report_service.service.ReportService;
import net.sf.jasperreports.engine.JRException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/report")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/validation/pdf/{id}")
    public ResponseEntity<byte[]> getReportById(
            @PathVariable String id,
            @RequestHeader("Authorization") String token
    ) throws Exception {
        byte[] pdf = reportService.generateValidationReportById(id, token);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=validation-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/validation/pdf/all")
    public ResponseEntity<byte[]> getFullReport(
            @RequestHeader("Authorization") String token
    ) throws Exception {
        byte[] pdf = reportService.generateFullValidationReport(token);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=all-validations.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}



