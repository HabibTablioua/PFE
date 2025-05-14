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
    import java.io.InputStream;
    import java.nio.charset.StandardCharsets;

    @RestController
    @RequestMapping("/response-iso")
    public class ResponseISOController {

        private final ResponseISOService responseISOService;



        public ResponseISOController(ResponseISOService responseISOService) {
            this.responseISOService = responseISOService;
        }

        @PostMapping(value = "/process", produces = MediaType.APPLICATION_JSON_VALUE)
        public ResponseISOResponse processISO(@RequestBody ResponseISORequest request) {
            return responseISOService.processISO(request);
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

    }
