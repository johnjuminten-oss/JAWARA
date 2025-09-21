BEGIN;

DROP TABLE IF EXISTS `Jadwal_Ujian`;
CREATE TABLE `Jadwal_Ujian` (
  `Nama Ujian` VARCHAR(255), `Hari` VARCHAR(255), `Jam Mulai` VARCHAR(255), `Jam Selesai` VARCHAR(255), `Guru Pengampu` VARCHAR(255), `Target Kelas` VARCHAR(255)
);

INSERT IGNORE INTO `Jadwal_Ujian` VALUES ('UTS Matematika', 'Selasa', '09:30', '11:00', 'Pak Budi', 'Kelas 10A');

COMMIT;
