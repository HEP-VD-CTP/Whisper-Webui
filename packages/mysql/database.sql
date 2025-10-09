CREATE DATABASE  IF NOT EXISTS `whisper`;
USE `whisper`;

-- 1. User Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` binary(12) NOT NULL,
  `email` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `pwd` varchar(512) DEFAULT NULL,
  `salt` varchar(45) DEFAULT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `blocked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `email_idx` (`email`),
  FULLTEXT KEY `fulltext_users` (`firstname`,`lastname`,`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 1.1. Insert default admin user
LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (unhex('AAAAAAAAAAAAAAAAAAAAAAAA'),'admin@admin.com','Admin','Admin','abd6cbbea3be6dcadf4df5c8061e1b5d78ccd6c700fc77f6e80cda775bb08cc97c24d4aa9a056d2813d32045960e94ca65252e5d2aae4ec5dd08249c7b8c05b2','5ed2184bb631326d487a5e774d684c9ead60da85624c6',1,0,0,'2025-10-09 13:15:12');
UNLOCK TABLES;

-- 2. Transcription Table
DROP TABLE IF EXISTS `transcriptions`;
CREATE TABLE `transcriptions` (
  `id` binary(12) NOT NULL,
  `name` varchar(255) NOT NULL,
  `file` varchar(255) NOT NULL,
  `lang` char(2) NOT NULL,
  `status` enum('waiting','processing','error','done') DEFAULT NULL,
  `created` datetime NOT NULL,
  `processed` datetime DEFAULT NULL,
  `done` datetime DEFAULT NULL,
  `deleted` tinyint DEFAULT '0',
  `text` longtext,
  `duration` float DEFAULT NULL,
  `metadata` text,
  `comment` text,
  PRIMARY KEY (`id`),
  FULLTEXT KEY `transcriptions_name_IDX` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Transcription_User Table
DROP TABLE IF EXISTS `transcriptions_users`;
CREATE TABLE `transcriptions_users` (
  `id` binary(12) NOT NULL,
  `idx_transcription` binary(12) NOT NULL,
  `idx_user` binary(12) NOT NULL,
  PRIMARY KEY (`id`,`idx_transcription`,`idx_user`),
  KEY `idx_transcription` (`idx_transcription`),
  KEY `idx_user` (`idx_user`),
  CONSTRAINT `transcriptions_users_ibfk_1` FOREIGN KEY (`idx_transcription`) REFERENCES `transcriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transcriptions_users_ibfk_2` FOREIGN KEY (`idx_user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Query Log Table
DROP TABLE IF EXISTS `queries`;
CREATE TABLE `queries` (
  `id` binary(24) NOT NULL,
  `route` varchar(4096) NOT NULL,
  `userid` varchar(24) DEFAULT NULL,
  `ip` varchar(255) NOT NULL,
  `status` smallint NOT NULL,
  `headers` text NOT NULL,
  `method` varchar(5) NOT NULL,
  `duration` int DEFAULT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




