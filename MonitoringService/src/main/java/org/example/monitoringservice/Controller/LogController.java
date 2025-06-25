package org.example.monitoringservice.Controller;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.example.monitoringservice.Entity.LogEntry;
import org.example.monitoringservice.Service.LogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lowagie.text.Document;  // ✅ Correct !
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.example.monitoringservice.Repository.LogEntryRepository;
import java.util.Collections;
import java.time.format.DateTimeParseException;
import java.time.LocalDate;

@RestController
@RequestMapping("/logs")
@Slf4j
public class LogController {
    private final LogService logService;
    @Autowired
    private LogEntryRepository logEntryRepository;

    public LogController(LogService logService) {
        this.logService = logService;
    }


    private static final String LOG_FILE_PATH = "D:/logs/iso-logs.log"; // 📂 Ton chemin vers les logs
    private static final DateTimeFormatter LOG_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"); // Format que tu veux utiliser


    // DTO pour le log structuré
    class LogDto {
        private String id;
        private String date;
        private String level;
        private String message;
        private String details;
        // Getters & setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        // Génère un identifiant unique basé sur le contenu du log
        public void generateId() {
            this.id = Integer.toHexString(java.util.Objects.hash(date, level, message, details));
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String level
    ) throws IOException {
        List<String> allLines = Files.readAllLines(Path.of(LOG_FILE_PATH));
        Collections.reverse(allLines); // Inverse la liste pour avoir les plus récents en premier
        
        List<LogDto> filteredLogs = allLines.stream()
            .map(this::parseLogLine)
            .filter(Objects::nonNull)
            .filter(log -> {
                // Filtre par mot-clé
                if (keyword != null && !keyword.isEmpty()) {
                    boolean keywordMatch = (log.getMessage() != null && log.getMessage().toLowerCase().contains(keyword.toLowerCase())) ||
                                         (log.getDetails() != null && log.getDetails().toLowerCase().contains(keyword.toLowerCase()));
                    if (!keywordMatch) return false;
                }
                
                // Filtre par niveau
                if (level != null && !level.isEmpty()) {
                    if (!log.getLevel().equalsIgnoreCase(level)) return false;
                }

                // Filtre par date (corrigé)
                if (startDate != null || endDate != null) {
                    try {
                        // On ne prend que la partie date du log (AAAA-MM-JJ)
                        LocalDate logDate = LocalDate.parse(log.getDate().substring(0, 10));

                        if (startDate != null && !startDate.isEmpty()) {
                            LocalDate start = LocalDate.parse(startDate);
                            if (logDate.isBefore(start)) return false;
                        }
                        if (endDate != null && !endDate.isEmpty()) {
                            LocalDate end = LocalDate.parse(endDate);
                            if (logDate.isAfter(end)) return false;
                        }
                    } catch (DateTimeParseException e) {
                        return false; // Exclut les logs qui n'ont pas une date valide
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
    
        int total = filteredLogs.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);
        List<LogDto> pagedLogs = filteredLogs.subList(fromIndex, toIndex);

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("logs", pagedLogs);
        response.put("total", total);
        response.put("page", page);
        response.put("size", size);
        return ResponseEntity.ok(response);
    }

    // Méthode utilitaire pour parser une ligne brute
    private LogDto parseLogLine(String line) {
        try {
            if (line.length() < 23) return null; // Garde-fou pour les lignes vides ou trop courtes

            LogDto dto = new LogDto();
            // Extrait la date, gère les formats avec ou sans 'T'
            dto.setDate(line.substring(0, 19).replace("T", " "));

            String rest = line.substring(20).trim();

            // Différencie les logs système (avec nom de thread) des logs métiers
            int threadStart = rest.indexOf('[');
            int threadEnd = rest.indexOf(']');

            if (threadStart == 0 && threadEnd > threadStart) {
                // Log système : "[thread] NIVEAU classe - détails"
                dto.setMessage(rest.substring(1, threadEnd)); // Nom du thread comme message

                String afterThread = rest.substring(threadEnd + 1).trim();
                String[] parts = afterThread.split(" ", 2);
                
                dto.setLevel(parts.length > 0 ? parts[0] : "UNKNOWN");
                dto.setDetails(parts.length > 1 ? parts[1] : "");
            } else {
                // Log métier : "NIVEAU - message"
                String[] parts = rest.split(" - ", 2);
                dto.setLevel(parts.length > 0 ? parts[0] : "UNKNOWN");
                dto.setMessage(parts.length > 1 ? parts[1] : rest); // Affiche le reste si pas de " - "
                dto.setDetails(""); // Pas de détails séparés pour ce format
            }
            dto.generateId();
            return dto;
        } catch (Exception e) {
            // En cas d'erreur de parsing, on retourne un log "brut" pour ne pas perdre l'information
            LogDto rawDto = new LogDto();
            rawDto.setDate("N/A");
            rawDto.setLevel("RAW");
            rawDto.setMessage(line);
            rawDto.setDetails("");
            rawDto.generateId();
            return rawDto;
        }
    }

    @GetMapping("/errors")
    public ResponseEntity<List<String>> getErrorLogs() throws IOException {
        List<String> errorLines = Files.lines(Path.of(LOG_FILE_PATH))
                .filter(line -> line.contains("ERROR"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(errorLines);
    }

    @GetMapping("/success")
    public ResponseEntity<List<String>> getSuccessLogs() throws IOException {
        List<String> successLines = Files.lines(Path.of(LOG_FILE_PATH))
                .filter(line -> line.contains("SUCCESS") || line.contains("✅"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(successLines);
    }

    // 🔥 FILTRER PAR MOT-CLÉ
    @GetMapping("/search")
    public ResponseEntity<List<String>> searchLogs(@RequestParam String keyword) throws IOException {
        List<String> matchedLines = Files.lines(Path.of(LOG_FILE_PATH))
                .filter(line -> line.toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(matchedLines);
    }

    // 🎯 FILTRER PAR INTERVALLE DE DATES (attention au format des dates dans les logs)
    @GetMapping("/by-date")
    public ResponseEntity<List<String>> getLogsByDate(
            @RequestParam String start,
            @RequestParam String end
    ) throws IOException {
        LocalDateTime startDate = LocalDateTime.parse(start, LOG_TIME_FORMATTER);
        LocalDateTime endDate = LocalDateTime.parse(end, LOG_TIME_FORMATTER);

        List<String> filteredLines = Files.lines(Path.of(LOG_FILE_PATH))
                .filter(line -> {
                    try {
                        // 🕐 Extraire la date du début du log (il faut que tes logs commencent par une date : 2025-04-28 10:15:30)
                        String datePart = line.substring(0, 19);
                        LocalDateTime logDate = LocalDateTime.parse(datePart, LOG_TIME_FORMATTER);
                        return (logDate.isEqual(startDate) || logDate.isAfter(startDate)) &&
                                (logDate.isEqual(endDate) || logDate.isBefore(endDate));
                    } catch (Exception e) {
                        return false; // ligne qui n'a pas de date bien formée
                    }
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredLines);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportLogsAsCsv(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end
    ) throws IOException {
        List<String> logs = Files.lines(Path.of(LOG_FILE_PATH))
                .filter(line -> {
                    boolean matches = true;
                    if (keyword != null && !keyword.isEmpty()) {
                        matches = line.toLowerCase().contains(keyword.toLowerCase());
                    }
                    if (matches && start != null && end != null) {
                        try {
                            String datePart = line.substring(0, 19);
                            LocalDateTime logDate = LocalDateTime.parse(datePart, LOG_TIME_FORMATTER);
                            LocalDateTime startDate = LocalDateTime.parse(start, LOG_TIME_FORMATTER);
                            LocalDateTime endDate = LocalDateTime.parse(end, LOG_TIME_FORMATTER);
                            matches = (logDate.isEqual(startDate) || logDate.isAfter(startDate)) &&
                                    (logDate.isEqual(endDate) || logDate.isBefore(endDate));
                        } catch (Exception e) {
                            matches = false;
                        }
                    }
                    return matches;
                })
                .collect(Collectors.toList());

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Date,LogLevel,Message\n");

        for (String logLine : logs) {
            try {
                String date = logLine.substring(0, 19);
                String rest = logLine.substring(20).trim();
                String[] parts = rest.split(" ", 2);
                String level = parts.length > 0 ? parts[0] : "";
                String message = parts.length > 1 ? parts[1] : "";
                csvBuilder.append(String.format("%s,%s,\"%s\"\n", date, level, message.replace("\"", "\"\"")));
            } catch (Exception e) {
                // Ignorer les lignes mal formées
            }
        }

        byte[] csvBytes = csvBuilder.toString().getBytes();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=logs_export.csv")
                .header("Content-Type", "text/csv")
                .body(csvBytes);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportLogsAsExcel(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end
    ) throws IOException {
        List<String> logs = Files.lines(Path.of(LOG_FILE_PATH))
                .filter(line -> {
                    boolean matches = true;
                    if (keyword != null && !keyword.isEmpty()) {
                        matches = line.toLowerCase().contains(keyword.toLowerCase());
                    }
                    if (matches && start != null && end != null) {
                        try {
                            String datePart = line.substring(0, 19);
                            LocalDateTime logDate = LocalDateTime.parse(datePart, LOG_TIME_FORMATTER);
                            LocalDateTime startDate = LocalDateTime.parse(start, LOG_TIME_FORMATTER);
                            LocalDateTime endDate = LocalDateTime.parse(end, LOG_TIME_FORMATTER);
                            matches = (logDate.isEqual(startDate) || logDate.isAfter(startDate)) &&
                                    (logDate.isEqual(endDate) || logDate.isBefore(endDate));
                        } catch (Exception e) {
                            matches = false;
                        }
                    }
                    return matches;
                })
                .sorted((l1, l2) -> {
                    try {
                        String date1 = l1.substring(0, 19);
                        String date2 = l2.substring(0, 19);
                        return LocalDateTime.parse(date2, LOG_TIME_FORMATTER)
                                .compareTo(LocalDateTime.parse(date1, LOG_TIME_FORMATTER));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .toList();

        try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            org.apache.poi.xssf.usermodel.XSSFSheet sheet = workbook.createSheet("Logs");

            // Style d'en-tête
            var headerStyle = workbook.createCellStyle();
            var headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Créer l'en-tête
            var header = sheet.createRow(0);
            var cellDate = header.createCell(0);
            cellDate.setCellValue("Date");
            cellDate.setCellStyle(headerStyle);

            var cellLevel = header.createCell(1);
            cellLevel.setCellValue("LogLevel");
            cellLevel.setCellStyle(headerStyle);

            var cellMessage = header.createCell(2);
            cellMessage.setCellValue("Message");
            cellMessage.setCellStyle(headerStyle);

            // Ajouter les données
            int rowIdx = 1;
            int successCount = 0, errorCount = 0, failedCount = 0;

            for (String logLine : logs) {
                try {
                    String date = logLine.substring(0, 19);
                    String rest = logLine.substring(20).trim();
                    String[] parts = rest.split(" ", 2);
                    String level = parts.length > 0 ? parts[0] : "";
                    String message = parts.length > 1 ? parts[1] : "";

                    var row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(date);
                    row.createCell(1).setCellValue(level);
                    row.createCell(2).setCellValue(message);

                    if (level.contains("SUCCESS")) successCount++;
                    if (level.contains("ERROR")) errorCount++;
                    if (level.contains("FAILED")) failedCount++;
                } catch (Exception ignored) {}
            }

            // Statistiques
            int statsStartRow = rowIdx + 2;
            sheet.createRow(statsStartRow).createCell(0).setCellValue("Statistiques:");

            sheet.createRow(statsStartRow + 1).createCell(0).setCellValue("Total logs");
            sheet.getRow(statsStartRow + 1).createCell(1).setCellValue(logs.size());

            sheet.createRow(statsStartRow + 2).createCell(0).setCellValue("Total SUCCESS");
            sheet.getRow(statsStartRow + 2).createCell(1).setCellValue(successCount);

            sheet.createRow(statsStartRow + 3).createCell(0).setCellValue("Total ERROR");
            sheet.getRow(statsStartRow + 3).createCell(1).setCellValue(errorCount);

            sheet.createRow(statsStartRow + 4).createCell(0).setCellValue("Total FAILED");
            sheet.getRow(statsStartRow + 4).createCell(1).setCellValue(failedCount);

            sheet.createRow(statsStartRow + 5).createCell(0).setCellValue("Taux de réussite (%)");
            sheet.getRow(statsStartRow + 5).createCell(1).setCellValue(
                    logs.isEmpty() ? 0 : (successCount * 100.0 / logs.size())
            );

            // Ajuster la largeur des colonnes automatiquement
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);

            var out = new java.io.ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=logs_export.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(out.toByteArray());
        }
    }


    @GetMapping("/export/pdf")
    public void exportLogsToPDF(
            HttpServletResponse response,
            @RequestParam(required = false) String status, // "SUCCESS" ou "ERROR"
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String keyword
    ) throws Exception {

        // Récupérer les logs filtrés
        List<String> logs = logService.getFilteredLogs(status, start, end, keyword);

        // Préparer la réponse HTTP
        response.setContentType("application/pdf");
        String filename = "transaction-logs-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + ".pdf";
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        // Créer le PDF
        OutputStream outputStream = response.getOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);
        document.open();

        // Ajouter le titre
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("Historique des Transactions ISO", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph("\n"));

        // Ajouter la date de génération
        Font smallFont = new Font(Font.HELVETICA, 10, Font.ITALIC);
        String generatedAt = "Généré le : " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        document.add(new Paragraph(generatedAt, smallFont));
        document.add(new Paragraph("\n"));

        // Créer la table
        PdfPTable table = new PdfPTable(2); // 2 colonnes : Date et Log
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
        Font cellFont = new Font(Font.HELVETICA, 10);

        PdfPCell dateHeader = new PdfPCell(new Phrase("Date", headerFont));
        dateHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(dateHeader);

        PdfPCell logHeader = new PdfPCell(new Phrase("Log", headerFont));
        logHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(logHeader);


        logs = logs.stream()
                .sorted((l1, l2) -> {
                    try {
                        String date1 = l1.substring(0, 19);
                        String date2 = l2.substring(0, 19);
                        return LocalDateTime.parse(date2, LOG_TIME_FORMATTER)
                                .compareTo(LocalDateTime.parse(date1, LOG_TIME_FORMATTER));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .collect(Collectors.toList());


        for (String log : logs) {
            String date = log.length() >= 19 ? log.substring(0, 19) : "";
            String content = log.length() >= 20 ? log.substring(20) : log;

            table.addCell(new Phrase(date, cellFont));
            table.addCell(new Phrase(content, cellFont));
        }
        document.add(table);
        document.close();
    }


    @PostMapping("/save")
    public ResponseEntity<String> saveLog(@RequestBody Map<String, String> body) {
        String level = body.get("level");
        String message = body.get("message");
        logService.saveLog(level, message);
        return ResponseEntity.ok("Log enregistré avec succès ✅");
    }


    @GetMapping("/db")
    public ResponseEntity<List<LogEntry>> getLogsFromDatabase() {
        return ResponseEntity.ok(logService.getAllLogsFromDatabase());
    }

    // Suppression simple
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        logEntryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Suppression multiple
    @PostMapping("/delete-batch")
    public ResponseEntity<?> deleteLogsBatch(@RequestBody java.util.List<String> ids) {
        try {
            java.util.List<String> allLines = java.nio.file.Files.readAllLines(java.nio.file.Path.of(LOG_FILE_PATH));
            java.util.List<LogDto> allLogs = allLines.stream()
                .map(this::parseLogLine)
                .filter(java.util.Objects::nonNull)
                .toList();

            java.util.List<String> filteredLines = new java.util.ArrayList<>();
            for (int i = 0; i < allLogs.size(); i++) {
                LogDto log = allLogs.get(i);
                if (log.getId() == null || !ids.contains(log.getId())) {
                    filteredLines.add(allLines.get(i));
                }
            }
            java.nio.file.Files.write(java.nio.file.Path.of(LOG_FILE_PATH), filteredLines);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la suppression : " + e.getMessage());
        }
    }








}
