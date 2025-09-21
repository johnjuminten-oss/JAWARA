🛠️ Jawara Supabase Schema Construction Guideline (Final Extended)
🎯 Goals

Support 3 roles: Admin, Teacher, Student.

Provide full attributes for user profiles.

Cover core academic + scheduling tables.

Map dashboard features → backend data.

Ensure RLS policies keep data secure per role.

1. Users (Profiles)

Every user links to auth.users. Store role-specific attributes here.

profiles

id → PK (FK → auth.users.id)

email → login

full_name

role → ENUM (admin, teacher, student)

batch_id → FK → batches.id

class_id → FK → classes.id

phone_number (optional)

avatar_url (optional)

last_login_at

created_at

🔹 Role extensions

Teacher → subjects_taught[] (array, or via teacher_subjects)

Student → parent_name, parent_contact

2. Core Academic Tables

batches

id, name (ex: Angkatan 2025), created_at

classes

id, batch_id (FK), name (ex: 10A), created_at

subjects

id, name (Matematika, Biologi, …)

teacher_subjects (M:N)

id, teacher_id (FK → profiles.id), subject_id

class_subjects (M:N)

id, class_id, subject_id

3. Events & Scheduling

events

id

title

description

start_at, end_at

location

event_type → ENUM (lesson, exam, assignment, personal, broadcast)

created_by (FK → profiles.id)

target_class (FK → classes.id, nullable)

visibility_scope → ENUM (personal, class, schoolwide)

metadata (jsonb, flexible extra data)

created_at

event_participants (optional, for attendance/individual assign)

event_id, profile_id, status

4. Communication

notifications

id, user_id, message, status (unread, read), created_at

alerts

id, user_id, alert_type (exam_reminder, overload_warning, conflict_alert, announcement),

message, delivery (in_app, email, both),

status (unread, read, dismissed),

created_at

5. Tracking & Logs

attendance

id, event_id, student_id, status (present, absent, late), created_at

submissions

id, assignment_id (FK → events.id), student_id, file_url, submitted_at, status

grades

id, student_id, event_id (exam/assignment), score, feedback, graded_at

activity_logs

id, profile_id, action, details, created_at

6. Dashboard Feature → Data Mapping
🟦 Admin

Manage users → profiles

Manage batches/classes → batches, classes

Manage subjects → subjects, teacher_subjects, class_subjects

Manage events → events

Broadcast → events (type=broadcast)

View alerts/notifs → alerts, notifications

🟩 Teacher

See assigned subjects → teacher_subjects

Manage lessons/exams/assignments → events

Broadcast → events (type=broadcast)

Track attendance → attendance

Review submissions → submissions

Input grades → grades

Class alerts → alerts

🟨 Student

View class schedule → events (target_class=class_id)

Personal events → events (created_by=me, type=personal)

Notifications → notifications

Alerts → alerts

Submit assignments → submissions

View grades → grades

Attendance history → attendance

7. Data Flow Example

Teacher creates UTS Biologi → events (exam, target_class=10A) → triggers notifications for students in 10A → also creates auto alerts (exam_reminder) for them.

Student submits PR Matematika → submissions row → teacher reviews → inserts grades.

Student creates Belajar Kelompok → events (personal) → visible only to that student.

8. RLS Policy Design

Admin → unrestricted.

Teacher → CRUD events for their classes, manage submissions/grades/attendance only for assigned students.

Student → read-only class events, create personal events, manage only their own submissions/grades/attendance.

9. Testing Dataset (Minimal)

1 Batch: Angkatan 2025

1 Class: 10A

1 Admin → full access

2 Teachers → Pak Budi (Matematika), Bu Siti (Biologi)

3 Students → Alice, Bob, Charlie

Sample Events:

Lesson: Matematika Senin 07:30

Exam: UTS Biologi Kamis 09:00

Personal: Belajar Kelompok Sabtu 14:00

Sample Notif: UTS Biologi ditambahkan

Sample Alert: Reminder H-1

👉 With this structure, your AI can generate:

SQL migrations (tables + enums + FKs + indexes)

Supabase RLS policies

API queries (CRUD)

Frontend-ready JSON responses