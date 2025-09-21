BEGIN;

DROP TABLE IF EXISTS `Batch_and_Class`;
CREATE TABLE `Batch_and_Class` (
  `Variabel` VARCHAR(255), `Isi Data (Contoh)` VARCHAR(255), `Isi Data (Client)` DOUBLE
);

INSERT IGNORE INTO `Batch_and_Class` VALUES ('Nama Angkatan', 'AKSAGARTA', NULL);
INSERT IGNORE INTO `Batch_and_Class` VALUES ('Nama Kelas', 'Kelas 12-H', NULL);

COMMIT;
