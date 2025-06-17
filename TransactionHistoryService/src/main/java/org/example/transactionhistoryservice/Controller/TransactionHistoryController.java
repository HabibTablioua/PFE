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
    public List<TransactionHistory> getAll(
            @RequestParam(required = false) String mti,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return historyService.getFilteredTransactions(mti, format, source, startDate, endDate);
    }

    @GetMapping("/search")
    public List<TransactionHistory> search(
            @RequestParam(required = false) String mti,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return historyService.getFilteredTransactions(mti, format, source, start, end);
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


