{
  "app_name": "Jawara School Management System (Jawara SMS)",
  "description": "School scheduling and management app with calendar, personal schedules, class events, broadcasts, and alerts. Built with Supabase (DB + RLS) and Next.js frontend.",
  "building_guideline": {
    "phase_1_setup": {
      "steps": [
        "Initialize Next.js project with TypeScript and TailwindCSS.",
        "Install Supabase client SDK and configure environment variables.",
        "Set up Supabase schema with migrations (tables + enums).",
        "Configure RLS (Row Level Security) policies per role."
      ],
      "output": [
        "Working backend schema in Supabase",
        "Secured API with RLS"
      ]
    },
    "phase_2_auth_and_profiles": {
      "steps": [
        "Enable Supabase Auth with email login.",
        "Create trigger function to auto-insert profile row when new auth user is created.",
        "Build role-based routing (admin, teacher, student).",
        "Add profile editing page (name, avatar, phone)."
      ],
      "output": [
        "User login/registration working",
        "Profile auto-created and editable"
      ]
    },
    "phase_3_calendar_and_events": {
      "steps": [
        "Implement calendar component (react-big-calendar or similar).",
        "Fetch events from Supabase and merge layers (admin, teacher, student personal).",
        "Enable CRUD for personal events (teacher + student).",
        "Enable admin to create class-wide fixed events.",
        "Enable teacher to create class events (quiz, homework, deadline)."
      ],
      "output": [
        "Calendar with event layers",
        "Event forms (create, edit, delete)"
      ]
    },
    "phase_4_broadcast_and_alerts": {
      "steps": [
        "Build broadcast creation form for teachers and admins.",
        "Choose delivery type: banner (read-only) or inject into calendar.",
        "Implement alerts system: exam reminder, overload warning, conflict alert.",
        "Connect alerts to email delivery (SMTP/SendGrid)."
      ],
      "output": [
        "Broadcast visible to students",
        "Alerts appear on dashboard",
        "Email alerts triggered automatically"
      ]
    },
    "phase_5_notifications_and_ui": {
      "steps": [
        "Add notification dropdown (with unread count).",
        "Link notifications to event creation/broadcasts.",
        "Add alerts panel with filters.",
        "Add responsive UI layout (sidebar + top navigation)."
      ],
      "output": [
        "Notifications system complete",
        "Responsive dashboards"
      ]
    },
    "phase_6_testing_and_dataset": {
      "steps": [
        "Seed test dataset: 1 batch (Angkatan 2025), 1 class (10A), 1 admin, 2 teachers, 3 students.",
        "Add sample events: lesson, exam, personal, broadcast.",
        "Run testing for 2 weeks with dummy users.",
        "Validate alerts (exam reminder, overload) and notifications."
      ],
      "output": [
        "Testing dataset ready",
        "Validated alerts and notification logic"
      ]
    }
  },
  "roles": {
    "admin": {
      "permissions": [
        "Full CRUD on users, classes, and events",
        "Create fixed schedules for classes",
        "Send schoolwide broadcasts",
        "Monitor all alerts and notifications"
      ],
      "dashboard": {
        "components": [
          "Admin Calendar View",
          "User Management Table",
          "Batch & Class Management Panel",
          "Broadcast Creation Panel",
          "System Alerts Panel",
          "Notifications Center"
        ]
      }
    },
    "teacher": {
      "permissions": [
        "CRUD personal events",
        "CRUD class events (lessons, quizzes, deadlines, homework)",
        "Broadcast messages to assigned class",
        "View fixed admin schedules"
      ],
      "dashboard": {
        "components": [
          "Teacher Calendar (merged view)",
          "Add/Edit Class Event Form",
          "Add Personal Event Form",
          "Broadcast Creation Panel",
          "Class Alerts Panel",
          "Notifications Center"
        ]
      }
    },
    "student": {
      "permissions": [
        "CRUD personal events",
        "View admin-created fixed schedules",
        "View teacher-created class events",
        "Receive broadcasts (banner or calendar injection)",
        "Receive alerts (exam reminder, overload, conflict)"
      ],
      "dashboard": {
        "components": [
          "Student Calendar (merged view)",
          "Add Personal Event Form",
          "Broadcast Banner (read-only)",
          "Alerts Panel",
          "Notifications List"
        ]
      }
    }
  },
  "event_layers": {
    "admin_class_events": "Created by Admin for target classes (fixed schedule)",
    "teacher_class_events": "Created by Teacher for assigned class (quizzes, homework, deadlines)",
    "teacher_personal_events": "Private to Teacher",
    "student_personal_events": "Private to Student"
  },
  "features": {
    "calendar": "Every user sees a merged calendar of admin events, class events, and their personal events.",
    "personal_events": "Teacher and Student can add/edit/delete their own events.",
    "broadcast": "Teacher can broadcast either as a message banner OR calendar injection to class.",
    "alerts": [
      "Exam reminder (H-1)",
      "Overload warning (more than X events in a week)",
      "Conflict alert (overlapping events)"
    ],
    "email_alerts": "Alerts are delivered both in-app and via email if enabled."
  },
  "database_schema": {
    "profiles": {
      "fields": [
        "id (uuid, FK → auth.users.id)",
        "email",
        "full_name",
        "role (enum: admin, teacher, student)",
        "batch_id (FK → batches.id)",
        "class_id (FK → classes.id)",
        "phone_number (optional)",
        "avatar_url (optional)",
        "last_login_at",
        "created_at"
      ]
    },
    "batches": {
      "fields": ["id", "name (ex: Angkatan 2025)", "created_at"]
    },
    "classes": {
      "fields": ["id", "batch_id", "name (ex: 10A)", "created_at"]
    },
    "events": {
      "fields": [
        "id",
        "title",
        "description",
        "start_at",
        "end_at",
        "location",
        "event_type (lesson, exam, assignment, personal, broadcast)",
        "created_by (FK → profiles.id)",
        "target_class (FK → classes.id, nullable)",
        "visibility_scope (personal, class, schoolwide)",
        "metadata (jsonb)",
        "created_at"
      ]
    },
    "notifications": {
      "fields": ["id", "user_id", "message", "status (unread, read)", "created_at"]
    },
    "alerts": {
      "fields": [
        "id",
        "user_id",
        "alert_type (exam_reminder, overload_warning, conflict_alert, announcement)",
        "message",
        "delivery (in_app, email, both)",
        "status (unread, read, dismissed)",
        "created_at"
      ]
    }
  },
  "testing_dataset": {
    "batch": "Angkatan 2025",
    "class": "10A",
    "admin": "Admin Sekolah",
    "teachers": ["Pak Budi (Matematika)", "Bu Siti (Biologi)"],
    "students": ["Alice", "Bob", "Charlie"],
    "sample_events": [
      "Lesson: Matematika Senin 07:30",
      "Exam: UTS Biologi Kamis 09:00",
      "Personal: Belajar Kelompok Sabtu 14:00"
    ],
    "sample_notifications": ["UTS Biologi ditambahkan ke jadwal kelas 10A"],
    "sample_alerts": ["Reminder: UTS Biologi besok jam 09:00"]
  }
}
