BEGIN;

DROP TABLE IF EXISTS `Notifikasi`;
CREATE TABLE `Notifikasi` (
  `Jenis Notifikasi` VARCHAR(255), `Isi Data (Contoh)` VARCHAR(255), `Isi Data (Client)` DOUBLE
);

INSERT IGNORE INTO `Notifikasi` VALUES ('Event Baru (kelas)', 'UTS Matematika ditambahkan ke jadwal.', NULL);
INSERT IGNORE INTO `Notifikasi` VALUES ('Broadcast Guru → Siswa', 'Tugas Bahasa Indonesia besok dikumpulkan.', NULL);

COMMIT;
