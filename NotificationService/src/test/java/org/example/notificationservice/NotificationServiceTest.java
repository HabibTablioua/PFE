package org.example.notificationservice;

import org.example.notificationservice.Entity.Notification;
import org.example.notificationservice.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Test
    void testMarkAllAsRead() {
        // Test que la méthode ne lance pas d'exception
        assertDoesNotThrow(() -> {
            notificationService.markAllAsRead();
        });
    }

    @Test
    void testSaveNotification() {
        // Test que la méthode ne lance pas d'exception
        assertDoesNotThrow(() -> {
            notificationService.saveNotification("Test notification");
        });
    }
} 