-- Script pour nettoyer la base de données et réinitialiser Flyway
-- Exécutez ce script dans votre base de données MySQL

-- Supprimer la table d'historique Flyway
DROP TABLE IF EXISTS flyway_schema_history;

-- Supprimer la table notification
DROP TABLE IF EXISTS notification;

-- Recréer la table notification avec le champ read
CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255),
    message TEXT,
    dateTime DATETIME,
    `read` BOOLEAN DEFAULT FALSE
); 