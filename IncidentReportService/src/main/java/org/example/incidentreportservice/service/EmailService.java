package org.example.incidentreportservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendIncidentAlert(String titre, String description) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo("habibtablioua1971@gmail.com");
            helper.setSubject("Nouvel incident signalé : " + titre);

            String htmlContent = "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset='UTF-8'>\n" +
                "  <title>Nouvel Incident Signalé</title>\n" +
                "</head>\n" +
                "<body style='margin:0; padding:0; font-family: Segoe UI, Arial, sans-serif; background: #f6f6f6;'>\n" +
                "  <table width='100%' bgcolor='#f6f6f6' cellpadding='0' cellspacing='0'>\n" +
                "    <tr>\n" +
                "      <td align='center'>\n" +
                "        <table width='600' style='background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); margin: 40px 0;'>\n" +
                "          <tr>\n" +
                "            <td align='left' style='padding: 30px 30px 10px 30px;'>\n" +
                "              <img src='cid:hpsLogo' alt='HPS Logo' style='height: 50px;'>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 0 30px 30px 30px;'>\n" +
                "              <h2 style='color: #d32f2f; margin-bottom: 10px;'>Nouvel incident signalé</h2>\n" +
                "              <p style='font-size: 16px; color: #333;'>\n" +
                "                <strong>Titre :</strong> <span style='color: #1976d2;'>" + titre + "</span><br>\n" +
                "                <strong>Description :</strong><br>\n" +
                "                <span style='color: #555;'>" + description + "</span>\n" +
                "              </p>\n" +
                "              <div style='margin-top: 30px; text-align: right;'>\n" +
                "                <span style='font-size: 13px; color: #888;'>HPS Incident Management</span>\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='background: linear-gradient(90deg, #d32f2f 0%, #fbc02d 100%); height: 8px; border-radius: 0 0 10px 10px;'></td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";

            helper.setText(htmlContent, true);
            // Ajout du logo HPS en pièce jointe inline
            ClassPathResource logo = new ClassPathResource("images/HPS.png");
            helper.addInline("hpsLogo", logo);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email d'incident", e);
        }
    }
} 