BEGIN;

DROP TABLE IF EXISTS `Alerts`;
CREATE TABLE `Alerts` (
  `Jenis Alert` VARCHAR(255), `Isi Data (Contoh)` VARCHAR(255), `Isi Data (Client)` DOUBLE
);

INSERT IGNORE INTO `Alerts` VALUES ('Reminder Ujian H-1', 'Pengingat: UTS Matematika besok jam 09:30.', NULL);
INSERT IGNORE INTO `Alerts` VALUES ('Overload Alert', 'Kamu sudah punya 5 jadwal minggu ini, periksa lagi.', NULL);

COMMIT;
