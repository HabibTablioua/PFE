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
                    output.append(String.format("Champ (%d): %s%n", i, isoMsg.getString(i)));
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
                    fields.add(new FieldData(i, isoMsg.getString(i)));
                }
            }
            return fields;
        }
    }

}
