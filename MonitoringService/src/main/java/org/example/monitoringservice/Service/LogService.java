package org.example.monitoringservice.Service;


import org.example.monitoringservice.Entity.LogEntry;
import org.example.monitoringservice.Repository.LogEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;  // ✅ Ajoute ça

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor  // ✅ Ajoute ça ici
public class LogService {

    @Autowired
    private LogEntryRepository logEntryRepository;

    // Ici tu peux connecter ta base de données, ou lire depuis un fichier temporaire.
    public List<String> getFilteredLogs(String status, LocalDateTime start, LocalDateTime end, String keyword) {
        List<String> allLogs = fetchAllLogs();

        return allLogs.stream()
                .filter(log -> (status == null || log.contains(status)))
                .filter(log -> (keyword == null || log.contains(keyword)))
                .filter(log -> {
                    if (start != null && end != null) {
                        try {
                            String datePart = log.substring(0, 19);
                            LocalDateTime logDate = LocalDateTime.parse(datePart);
                            return !logDate.isBefore(start) && !logDate.isAfter(end);
                        } catch (Exception e) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    private List<String> fetchAllLogs() {
        return logEntryRepository.findAll()
                .stream()
                .map(entry -> String.format("%s %s - %s",
                        entry.getDateTime().toString(),
                        entry.getLevel(),
                        entry.getMessage()))
                .collect(Collectors.toList());
    }


    public void saveLog(String level, String message) {
        LogEntry entry = new LogEntry();
        entry.setDateTime(LocalDateTime.now());
        entry.setLevel(level);
        entry.setMessage(message);
        logEntryRepository.save(entry);

        // Optionnel : écrire dans le fichier log aussi
        try {
            Files.writeString(Path.of("D:/PFE/logs/iso-logs.log"),
                    String.format("%s %s - %s\n", LocalDateTime.now(), level, message),
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public List<LogEntry> getAllLogsFromDatabase() {
        return logEntryRepository.findAll();
    }



}
