package org.example.transactionhistoryservice.Controller;


import org.example.transactionhistoryservice.DTO.TransactionHistoryRequest;
import org.example.transactionhistoryservice.Entite.TransactionHistory;
import org.example.transactionhistoryservice.Service.TransactionHistoryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/history")
public class TransactionHistoryController {

    private final TransactionHistoryService historyService;

    public TransactionHistoryController(TransactionHistoryService historyService) {
        this.historyService = historyService;
    }

    @PostMapping
    public void save(@RequestBody TransactionHistoryRequest request) {
        historyService.save(request);
    }

    @GetMapping
    public List<TransactionHistory> getAll() {
        return historyService.getAll();
    }

    @GetMapping("/search")
    public List<TransactionHistory> search(
            @RequestParam(required = false) String mti,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        if (mti != null) return historyService.searchByMti(mti);
        if (format != null) return historyService.searchByFormat(format);
        if (source != null) return historyService.searchBySource(source);
        if (start != null && end != null) return historyService.searchByDateRange(start, end);
        return historyService.getAll();
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



}


