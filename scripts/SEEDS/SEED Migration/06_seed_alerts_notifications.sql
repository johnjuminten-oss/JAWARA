-- Insert alerts and notifications derived from Alerts.sql and Notifikasi.sql
BEGIN;

-- Alert: Reminder Ujian H-1
INSERT INTO public.alerts (id, user_id, alert_type, message, delivery, status, created_at)
SELECT uuid_generate_v4(), NULL, 'exam_reminder', 'Pengingat: UTS Matematika besok jam 09:30.', 'in_app', 'unread', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.alerts WHERE message = 'Pengingat: UTS Matematika besok jam 09:30.'
);

-- Alert: Overload Alert
INSERT INTO public.alerts (id, user_id, alert_type, message, delivery, status, created_at)
SELECT uuid_generate_v4(), NULL, 'overload_warning', 'Kamu sudah punya 5 jadwal minggu ini, periksa lagi.', 'in_app', 'unread', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.alerts WHERE message = 'Kamu sudah punya 5 jadwal minggu ini, periksa lagi.'
);

-- Notifications (generic system notifications)
INSERT INTO public.notifications (id, user_id, event_id, title, message, type, status, created_at)
SELECT uuid_generate_v4(), NULL, NULL, 'Event Baru (kelas)', 'UTS Matematika ditambahkan ke jadwal.', 'notification', 'unread', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications WHERE title='Event Baru (kelas)' AND message='UTS Matematika ditambahkan ke jadwal.'
);

INSERT INTO public.notifications (id, user_id, event_id, title, message, type, status, created_at)
SELECT uuid_generate_v4(), NULL, NULL, 'Broadcast Guru → Siswa', 'Tugas Bahasa Indonesia besok dikumpulkan.', 'notification', 'unread', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications WHERE title='Broadcast Guru → Siswa' AND message='Tugas Bahasa Indonesia besok dikumpulkan.'
);

COMMIT;


