BEGIN;

DROP TABLE IF EXISTS `Guru`;
CREATE TABLE `Guru` (
  `Variabel` VARCHAR(255), `Isi Data (Contoh)` VARCHAR(255), `Guru 1 (Client)` VARCHAR(255), `Guru 2 (Client)` VARCHAR(255), `Guru 3 (Client)` VARCHAR(255), `Guru 4 (Client)` VARCHAR(255)
);

INSERT IGNORE INTO `Guru` VALUES ('Nama Guru', 'Pak Budi', 'Fiqih', 'Ajeng', 'Ulfah Fitriah', 'Munawir');
INSERT IGNORE INTO `Guru` VALUES ('Email / LoginID', 'guru.math@gmail.com', 'Fiqihjuara@gmail.com', 'ajeng409@gmail.com', 'ulfahpatrusha@gmail.com', 'munawirawing9@gmail.com');
INSERT IGNORE INTO `Guru` VALUES ('Mata Pelajaran', 'Matematika', 'Sejarah Lanjutan', 'Matematika Dasar', 'Ekonomi', 'Sejarah Indonesia');
INSERT IGNORE INTO `Guru` VALUES ('Kelas Ajar', 'Kelas 10A', 'Kelas XII-H', 'Kelas XII-H', 'Kelas XII-H', 'Kelas XII-H');
INSERT IGNORE INTO `Guru` VALUES ('Tanggal lahir', '28/03/1990', '27 juli 1991', '5 Oktober 1993', '16 Maret 1994', '1980-04-25 00:00:00');

COMMIT;
