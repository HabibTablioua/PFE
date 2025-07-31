package org.example.responseisoservice.Controller;

import org.example.responseisoservice.Entity.ImportedData;
import org.example.responseisoservice.Service.DataImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "*")
public class DataImportController {

    @Autowired
    private DataImportService dataImportService;

    @PostMapping("/upload")
    public ResponseEntity<ImportedData> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            ImportedData result = dataImportService.processFile(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            ImportedData errorResult = new ImportedData();
            errorResult.setFileName(file.getOriginalFilename());
            errorResult.setStatus("ERROR");
            errorResult.setMessage(e.getMessage());
            errorResult.setRecordsCount(0);
            return ResponseEntity.badRequest().body(errorResult);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<ImportedData>> getImportHistory() {
        try {
            List<ImportedData> history = dataImportService.getImportHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Resource resource = dataImportService.getFileAsResource(fileName);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImport(@PathVariable Long id) {
        try {
            dataImportService.deleteImport(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
} 