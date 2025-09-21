BEGIN;

DROP TABLE IF EXISTS weekly_schedule;

CREATE TABLE weekly_schedule (
  hari VARCHAR(50),
  tanggal DATE,
  waktu VARCHAR(50),
  mata_pelajaran VARCHAR(255),
  guru VARCHAR(255),
  week VARCHAR(20)
);

-- Week 1 (16–19 Sept 2025)

-- Selasa 16/09/2025
INSERT INTO weekly_schedule (hari, tanggal, waktu, mata_pelajaran, guru, week) VALUES
('Selasa','2025-09-16','07:00-07:30','Persiapan Try Out',NULL,'Week 1'),
('Selasa','2025-09-16','07:30-09:00','Try Out TKA','-','Week 1'),
('Selasa','2025-09-16','09:00-09:30','Try Out TKA','-','Week 1'),
('Selasa','2025-09-16','09:30-10:15','Istirahat Pagi','-','Week 1'),
('Selasa','2025-09-16','10:15-11:00','Seni Rupa','Pak Sakti','Week 1'),
('Selasa','2025-09-16','11:00-11:45','Seni Rupa','Pak Sakti','Week 1'),
('Selasa','2025-09-16','11:45-12:50','Istirahat Siang','-','Week 1'),
('Selasa','2025-09-16','12:50-13:30','Matematika Dasar','Bu Ajeng','Week 1'),
('Selasa','2025-09-16','13:30-14:10','Matematika Dasar','Bu Ajeng','Week 1'),
('Selasa','2025-09-16','14:10-14:50','Geografi','Pak Eri','Week 1'),
('Selasa','2025-09-16','14:50-15:30','Geografi','Pak Eri','Week 1'),

-- Rabu 17/09/2025
('Rabu','2025-09-17','07:00-07:40','Sosiologi','Bu Yuni','Week 1'),
('Rabu','2025-09-17','07:40-08:20','Sosiologi','Bu Yuni','Week 1'),
('Rabu','2025-09-17','08:20-09:00','Agama','Pak Azhar','Week 1'),
('Rabu','2025-09-17','09:00-09:30','Istirahat Pagi','-','Week 1'),
('Rabu','2025-09-17','09:30-10:15','Agama','Pak Azhar','Week 1'),
('Rabu','2025-09-17','10:15-11:00','Sejarah Lanjutan','Pak Fiqih','Week 1'),
('Rabu','2025-09-17','11:00-11:45','Sejarah Lanjutan','Pak Fiqih','Week 1'),
('Rabu','2025-09-17','11:45-12:50','Istirahat Siang','-','Week 1'),
('Rabu','2025-09-17','12:50-13:30','Sejarah Lanjutan','Pak Fiqih','Week 1'),
('Rabu','2025-09-17','13:30-14:10','Informatika','Pak Eri','Week 1'),
('Rabu','2025-09-17','14:10-14:50','Informatika','Pak Eri','Week 1'),
('Rabu','2025-09-17','14:50-15:30','Informatika','Pak Eri','Week 1'),

-- Kamis 18/09/2025
('Kamis','2025-09-18','07:00-07:40','Literasi Kitab Suci',NULL,'Week 1'),
('Kamis','2025-09-18','07:40-08:20','Pendalaman TKA','-','Week 1'),
('Kamis','2025-09-18','08:20-09:00','Pendalaman TKA','-','Week 1'),
('Kamis','2025-09-18','09:00-09:30','Istirahat Pagi','-','Week 1'),
('Kamis','2025-09-18','09:30-10:15','Pendalaman TKA','-','Week 1'),
('Kamis','2025-09-18','10:15-11:00','Pendalaman TKA','-','Week 1'),
('Kamis','2025-09-18','11:00-11:45','PPKN','Bu Indri','Week 1'),
('Kamis','2025-09-18','11:45-12:50','Istirahat Siang','-','Week 1'),
('Kamis','2025-09-18','12:50-13:30','PPKN','Bu Indri','Week 1'),
('Kamis','2025-09-18','13:30-14:10','Ekonomi','Bu Ulfi','Week 1'),
('Kamis','2025-09-18','14:10-14:50','Geografi','Pak Eri','Week 1'),
('Kamis','2025-09-18','14:50-15:30','Geografi','Pak Eri','Week 1'),

-- Jumat 19/09/2025
('Jumat','2025-09-19','05:30-07:00','Olahraga Pagi','-','Week 1'),
('Jumat','2025-09-19','07:00-07:45','Istirahat','-','Week 1'),
('Jumat','2025-09-19','07:50-08:30','Ekonomi','Bu Ulfi','Week 1'),
('Jumat','2025-09-19','08:30-09:10','Ekonomi','Bu Ulfi','Week 1'),
('Jumat','2025-09-19','09:10-09:50','Ekonomi','Bu Ulfi','Week 1'),
('Jumat','2025-09-19','09:50-10:20','Istirahat',NULL,'Week 1'),
('Jumat','2025-09-19','10:20-11:00','Matematika Dasar','Bu Ajeng','Week 1'),
('Jumat','2025-09-19','11:00-11:40','Matematika Dasar','Bu Ajeng','Week 1'),
('Jumat','2025-09-19','11:40-12:30','Sholat Jumat',NULL,'Week 1');

COMMIT;
