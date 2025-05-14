package org.example.depackingisoservice.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.example.depackingisoservice.DTO.FieldData;
import org.example.depackingisoservice.Service.DepackingISOService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/depack")
public class DepackingISOController {

    private final DepackingISOService depackingISOService;

    public DepackingISOController(DepackingISOService depackingISOService) {
        this.depackingISOService = depackingISOService;
    }

    @PostMapping
    public String depackIsoMessage(@RequestBody String isoMessage) {
        return depackingISOService.depackIsoMessage(isoMessage);
    }


    @PostMapping(value = "/download/json", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadJson(@RequestBody String isoMessage) throws Exception {
        List<FieldData> fields = depackingISOService.getFields(isoMessage);
        String json = new ObjectMapper().writeValueAsString(fields);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=depacked.json")
                .body(json.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/xml", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadXml(@RequestBody String isoMessage) throws Exception {
        List<FieldData> fields = depackingISOService.getFields(isoMessage);
        String xml = new XmlMapper().writeValueAsString(fields);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=depacked.xml")
                .body(xml.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/csv", produces = "text/csv")
    public ResponseEntity<byte[]> downloadCsv(@RequestBody String isoMessage) throws Exception {
        List<FieldData> fields = depackingISOService.getFields(isoMessage);
        StringBuilder csv = new StringBuilder("Field,Value\n");
        for (FieldData field : fields) {
            csv.append(field.getId()).append(",").append(field.getValue()).append("\n");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=depacked.csv")
                .body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<byte[]> downloadTxt(@RequestBody String isoMessage) throws Exception {
        List<FieldData> fields = depackingISOService.getFields(isoMessage);
        StringBuilder txt = new StringBuilder();
        for (FieldData field : fields) {
            txt.append("Champ (").append(field.getId()).append("): ").append(field.getValue()).append("\n");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=depacked.txt")
                .body(txt.toString().getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping(value = "/download/all", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> downloadAll(@RequestBody String isoMessage) throws Exception {
        List<FieldData> fields = depackingISOService.getFields(isoMessage);

        // Génération des contenus
        ObjectMapper jsonMapper = new ObjectMapper();
        String json = jsonMapper.writeValueAsString(fields);

        XmlMapper xmlMapper = new XmlMapper();
        String xml = xmlMapper.writeValueAsString(fields);

        StringBuilder csv = new StringBuilder("Field,Value\n");
        StringBuilder txt = new StringBuilder();
        for (FieldData field : fields) {
            csv.append(field.getId()).append(",").append(field.getValue()).append("\n");
            txt.append("Champ (").append(field.getId()).append("): ").append(field.getValue()).append("\n");
        }

        // Création de l'archive ZIP
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry("depacked.json"));
            zos.write(json.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            zos.putNextEntry(new ZipEntry("depacked.xml"));
            zos.write(xml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            zos.putNextEntry(new ZipEntry("depacked.csv"));
            zos.write(csv.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            zos.putNextEntry(new ZipEntry("depacked.txt"));
            zos.write(txt.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }

        byte[] zipBytes = baos.toByteArray();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=depacked_all.zip")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zipBytes);
    }


}

