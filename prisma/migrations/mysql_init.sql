-- ============================================================
-- Migration script untuk MySQL Hostinger
-- Database: u5443501_twibbon
-- Jalankan script ini via phpMyAdmin di Hostinger
-- ============================================================

-- Buat tabel twibbon
CREATE TABLE IF NOT EXISTS `twibbon` (
  `id`             INT            NOT NULL AUTO_INCREMENT,
  `title`          VARCHAR(255)   NOT NULL,
  `slug`           VARCHAR(255)   NOT NULL,
  `description`    TEXT           NULL,
  `type`           ENUM('IMAGE', 'VIDEO') NOT NULL,
  `overlayFile`    TEXT           NOT NULL,
  `thumbnail`      TEXT           NOT NULL,
  `config`         JSON           NOT NULL,
  `isActive`       TINYINT(1)     NOT NULL DEFAULT 1,
  `createdAt`      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3)    NOT NULL,
  `downloadsCount` INT            NOT NULL DEFAULT 0,

  PRIMARY KEY (`id`),
  UNIQUE KEY `twibbon_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel untuk NextAuth sessions (opsional jika pakai DB sessions)
-- Jika hanya pakai JWT strategy, tabel ini tidak diperlukan
