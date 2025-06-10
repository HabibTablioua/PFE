package org.example.depackingisoservice.Service;

import org.example.depackingisoservice.DTO.FieldData;
import org.jpos.iso.ISOException;
import org.jpos.iso.ISOMsg;
import org.jpos.iso.packager.GenericPackager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;


@Service
public class DepackingISOService {

    private static final Logger log = LoggerFactory.getLogger(DepackingISOService.class);

    public String depackIsoMessage(String isoMessage) {
        try (InputStream is = getClass().getResourceAsStream("/iso87ascii-packager.xml")) {
            GenericPackager packager = new GenericPackager(is);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(isoMessage.getBytes(StandardCharsets.US_ASCII));

            StringBuilder output = new StringBuilder("✅ ISO8583 Message Décomposé :\n");
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    String value = isoMsg.getString(i);

                    // Masquer PAN (champ 2)
                    if (i == 2 && value.length() > 6) {
                        value = value.substring(0, 6) + "******" + value.substring(value.length() - 4);
                    }

                    // Masquer Track 2 Data (champ 35)
                    if (i == 35 && value.contains("=")) {
                        String[] parts = value.split("=");
                        if (parts[0].length() > 6) {
                            value = parts[0].substring(0, 6) + "******" + parts[0].substring(parts[0].length() - 4) + "=" + parts[1];
                        }
                    }

                    // Masquer Track 3 Data (champ 36)
                    if (i == 36) {
                        value = "[MASKED TRACK 3 DATA]";
                    }

                    output.append(String.format("Champ (%d): %s%n", i, value));
                }
            }
            log.info(output.toString());
            return output.toString();

        } catch (ISOException | IOException e) {
            log.error("❌ Erreur lors du dépackaging du message ISO8583", e);
            return "Erreur lors du dépackaging : " + e.getMessage();
        }
    }


    public List<FieldData> getFields(String isoMessage) throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/iso87ascii-packager.xml")) {
            GenericPackager packager = new GenericPackager(is);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(isoMessage.getBytes(StandardCharsets.US_ASCII));

            List<FieldData> fields = new ArrayList<>();
            for (int i = 0; i <= isoMsg.getMaxField(); i++) {
                if (isoMsg.hasField(i)) {
                    String value = isoMsg.getString(i);

                    // Masquer PAN (champ 2)
                    if (i == 2 && value.length() > 6) {
                        value = value.substring(0, 6) + "******" + value.substring(value.length() - 4);
                    }

                    // Masquer Track 2 Data (champ 35)
                    if (i == 35 && value.contains("=")) {
                        String[] parts = value.split("=");
                        if (parts[0].length() > 6) {
                            value = parts[0].substring(0, 6) + "******" + parts[0].substring(parts[0].length() - 4) + "=" + parts[1];
                        }
                    }

                    // Masquer Track 3 Data (champ 36)
                    if (i == 36) {
                        value = "[MASKED TRACK 3 DATA]";
                    }

                    fields.add(new FieldData(i, value));
                }
            }
            return fields;
        }
    }



    public byte[] repackWithMaskedFields(String isoMessage) throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/iso87ascii-packager.xml")) {
            GenericPackager packager = new GenericPackager(is);
            ISOMsg isoMsg = new ISOMsg();
            isoMsg.setPackager(packager);
            isoMsg.unpack(isoMessage.getBytes(StandardCharsets.US_ASCII));

            // Exemple : Masquer PAN (champ 2)
            if (isoMsg.hasField(2)) {
                String pan = isoMsg.getString(2);
                if (pan.length() > 6) {
                    String maskedPan = pan.substring(0, 6) + "******" + pan.substring(pan.length() - 4);
                    isoMsg.set(2, maskedPan);
                }
            }

            // Autres champs sensibles ? Ajoute d'autres logiques ici.

            // Repack
            return isoMsg.pack();
        }
    }


}
