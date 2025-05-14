package org.example.monitoringservice.Service;


import org.example.monitoringservice.Entity.LogEntry;
import org.example.monitoringservice.Repository.LogEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;  // ✅ Ajoute ça
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
        // Simule : ici tu peux faire un select dans ta table historique.
        List<String> fakeLogs = new ArrayList<>();
        fakeLogs.add("2025-04-28T17:30:00 SUCCESS - Transaction MTI 0200 validée");
        fakeLogs.add("2025-04-28T17:35:00 ERROR - Transaction MTI 0200 refusée (fonds insuffisants)");
        return fakeLogs;
    }

    public void saveLog(String level, String message) {
        LogEntry entry = new LogEntry();
        entry.setDateTime(LocalDateTime.now());
        entry.setLevel(level);
        entry.setMessage(message);

        logEntryRepository.save(entry);
    }

}
