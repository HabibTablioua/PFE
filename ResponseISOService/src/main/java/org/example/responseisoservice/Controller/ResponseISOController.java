package org.example.responseisoservice.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.example.responseisoservice.DTO.ResponseISORequest;
import org.example.responseisoservice.DTO.ResponseISOResponse;
import org.example.responseisoservice.Service.ResponseISOService;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.packager.GenericPackager;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.example.responseisoservice.Entity.ResponseISOHistory;
import org.example.responseisoservice.repository.ResponseISOHistoryRepository;
import java.util.List;
import org.example.responseisoservice.Service.ResponseISOReportService;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/response")
public class ResponseISOController {

    private final ResponseISOService responseISOService;
    private final ResponseISOHistoryRepository historyRepository;
    private final ResponseISOReportService reportService;

    public ResponseISOController(ResponseISOService responseISOService, ResponseISOHistoryRepository historyRepository, ResponseISOReportService reportService) {
        this.responseISOService = responseISOService;
        this.historyRepository = historyRepository;
        this.reportService = reportService;
    }

    @PostMapping(value = "/process", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseISOResponse processISO(@RequestBody ResponseISORequest request) {
        return responseISOService.processISO(request);
    }

    // Endpoint de test pour vérifier la connectivité
    @GetMapping("/health")
    public String health() {
        return "ResponseISOService is running!";
    }

    // Endpoint de test simple pour le processus
    @PostMapping("/test")
    public String testProcess(@RequestBody String request) {
        return "Test endpoint accessible - Request reçu: " + request;
    }

    @PostMapping(value = "/download/json", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadAsJson(@RequestBody ResponseISORequest request) {
        try {
            ResponseISOResponse response = responseISOService.processISO(request);
            String json = new ObjectMapper().writeValueAsString(response);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=response-iso.json")
                    .body(json.getBytes(StandardCharsets.UTF_8));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(("Erreur JSON : " + e.getMessage()).getBytes());
        }
    }

    @PostMapping(value = "/download/txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<byte[]> downloadAsTxt(@RequestBody ResponseISORequest request) {
        ResponseISOResponse response = responseISOService.processISO(request);
        String content = "Status: " + response.getStatus() + "\nMessage: " + response.getMessage();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=response-iso.txt")
                .body(content.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/xml", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadAsXml(@RequestBody ResponseISORequest request) throws Exception {
        ResponseISOResponse response = responseISOService.processISO(request);
        XmlMapper xmlMapper = new XmlMapper();
        String xml = xmlMapper.writeValueAsString(response);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=response-iso.xml")
                .body(xml.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/csv", produces = "text/csv")
    public ResponseEntity<byte[]> downloadAsCsv(@RequestBody ResponseISORequest request) {
        ResponseISOResponse response = responseISOService.processISO(request);
        String csv = "status,message\n" + response.getStatus() + "," + response.getMessage();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=response-iso.csv")
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/raw", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadRaw(@RequestBody ResponseISORequest request) throws Exception {
        ResponseISOResponse response = responseISOService.processISO(request);
        // Simuler ici un vrai message ISO8583 packé si besoin (isoMsg.pack())
        String messageIso = "0210000000..."; // ton message ISO réel
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=response-iso.raw")
                .body(messageIso.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/iso", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadPackedIso(@RequestBody ResponseISORequest request) {
        try {
            // Charger le fichier de configuration ISO8583
            InputStream packagerStream = getClass().getClassLoader().getResourceAsStream("iso87ascii-packager.xml");
            if (packagerStream == null) {
                throw new RuntimeException("❌ Fichier iso87ascii-packager.xml non trouvé !");
            }

            GenericPackager packager = new GenericPackager(packagerStream);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(request.getIsoMessage().getBytes());

            // Simuler une réponse
            isoMsg.setMTI("0210");
            isoMsg.set(39, "00"); // ou une autre valeur selon le test

            byte[] packed = isoMsg.pack(); // message ISO binaire

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=response.iso")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(packed);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(("Erreur lors du traitement ISO : " + e.getMessage()).getBytes());
        }
    }

    @GetMapping("/history")
    public List<org.example.responseisoservice.Service.ResponseISOReportService.ResponseISOHistoryReportDTO> getAllHistory() {
        return historyRepository.findAll().stream()
                .map(org.example.responseisoservice.Service.ResponseISOReportService.ResponseISOHistoryReportDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/history/last")
    public ResponseISOHistory getLastHistory() {
        List<ResponseISOHistory> all = historyRepository.findAll();
        if (all.isEmpty()) return null;
        return all.get(all.size() - 1);
    }

    @GetMapping("/history/count-success")
    public long countSuccessResponses() {
        return responseISOService.countSuccessResponses();
    }

    @GetMapping("/history/count-failed")
    public long countFailedResponses() {
        return responseISOService.countFailedResponses();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResponse(@PathVariable Long id) {
        historyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/report/pdf")
    public ResponseEntity<byte[]> downloadPdf() throws Exception {
        byte[] pdf = reportService.exportPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "iso_responses.pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping("/report/excel")
    public ResponseEntity<byte[]> downloadExcel() throws Exception {
        byte[] excel = reportService.exportExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "iso_responses.xlsx");
        return ResponseEntity.ok().headers(headers).body(excel);
    }

    @GetMapping("/report/csv")
    public ResponseEntity<byte[]> downloadCsv() throws Exception {
        byte[] csv = reportService.exportCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "iso_responses.csv");
        return ResponseEntity.ok().headers(headers).body(csv);
    }

}