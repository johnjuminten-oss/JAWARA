BEGIN;

DROP TABLE IF EXISTS `Siswa`;
CREATE TABLE `Siswa` (
  `Variabel` VARCHAR(255), `Isi Data (Contoh)` VARCHAR(255), `Siswa 1` VARCHAR(255), `Siswa 2` VARCHAR(255), `Siswa 3` VARCHAR(255), `Siswa 4` VARCHAR(255), `Siswa 5` VARCHAR(255), `Siswa 6` VARCHAR(255), `Siswa 7` VARCHAR(255), `Siswa 8` VARCHAR(255), `Siswa 9` VARCHAR(255), `Siswa 10` VARCHAR(255), `Siswa 11` VARCHAR(255), `Siswa 12` VARCHAR(255), `Siswa 13` VARCHAR(255), `Siswa 14` VARCHAR(255), `Siswa 15` VARCHAR(255), `Siswa 16` VARCHAR(255), `Siswa 17` VARCHAR(255), `Siswa 18` VARCHAR(255), `Siswa 19` VARCHAR(255), `Siswa 20` VARCHAR(255)
);

INSERT IGNORE INTO `Siswa` VALUES ('Nama Siswa', 'Alice', 'Sarah Aquinny Lontoh', 'Farhan Ramadhan Kusumawardhana', 'Soraya Fatika Arawinda Galela ', 'Radya Raka Ramadhan', 'Agna Ilma Solihah', 'Khalif Ali Husain', 'Nurna Annisa Finsa', 'muhammad fabero arkana', 'Syarifa Syah Putri', 'Salma Fatiha Putri Rahardian', 'Pradhika Varen Wicaksono', 'Nama : Jovita Fiducia', 'muhammad fabero arkana', 'maliqa indra putri', 'fatima aletha zahra', 'Khansa Putri Karnova', 'Nazara Rifqa Rizkyantika', 'Aldila Prasasti', 'Disya Az Zahra Zulnasri', 'Kanesha Vallia');
INSERT IGNORE INTO `Siswa` VALUES ('Email / LoginID', 'alice@gmail.com', 'sarahaquinl06@gmail.com', 'farhan.dhanwar@gmail.com', 'sorayfatika@gmail.com', 'rdyark@gmail.com', ' agnailmasolihah@gmail.com', ' khalifalihusain30@gmail.com', 'finsanurna@gmail.com', 'muhammad.fabero@gmail.com', 'syarifasyahputri@gmail.com', ' salmafatihaputri@gmail.com', 'varenwicaksono@gmail.com', 'jovitaf.107@gmail.com', 'muhammad.fabero@gmail.com', 'maliqa.indra08@gmail.com', 'alethasofian@gmail.com', 'karnovakhansa@gmail.com', 'nazararifqa@gmail.com', 'aldilaprasastireal@gmail.com', 'disyazulnasri0610@gmail.com', 'kaneshavallia@gmail.com');
INSERT IGNORE INTO `Siswa` VALUES ('Kelas', 'Kelas 10A', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H', 'Kelas 12H');
INSERT IGNORE INTO `Siswa` VALUES ('Tanggal Lahir ', '28/03/1990', '15/06/2008', '21/09/2007', '13/10/2008', '2008-01-06 00:00:00', '2007-04-07 00:00:00', '30/10/2007', '2008-02-06 00:00:00', '2008-02-03 00:00:00', '15/10/2009', '2008-06-07 00:00:00', '2007-03-10 00:00:00', '2007-01-10 00:00:00', '2008-02-03 00:00:00', '16/03/2008', '2008-08-08 00:00:00', '14/08/2008', '2008-09-02 00:00:00', '15/06/2008', '2008-06-10 00:00:00', '2007-12-12 00:00:00');

COMMIT;
