-- Migration pour ajouter le champ read à la table notifications
ALTER TABLE notification ADD COLUMN `read` BOOLEAN DEFAULT FALSE;

-- Mettre à jour les notifications existantes pour qu'elles soient marquées comme lues
UPDATE notification SET `read` = TRUE WHERE `read` IS NULL; 