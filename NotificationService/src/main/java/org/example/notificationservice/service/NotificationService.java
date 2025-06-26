package org.example.notificationservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.example.notificationservice.Entity.Notification;
import org.example.notificationservice.repository.NotificationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public void saveNotification(String message) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setDateTime(LocalDateTime.now());
        notificationRepository.save(notification);
        log.info("✅ Notification enregistrée : {}", message);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
        log.info("✅ Notification supprimée : ID {}", id);
    }

    public void deleteAllNotifications() {
        notificationRepository.deleteAll();
        log.info("✅ Toutes les notifications ont été supprimées.");
    }

}

