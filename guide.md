{
  "app_name": "EduSchedule (JAWARA)",
  "roles": {
    "student": {
      "dashboard": {
        "sections": [
          {
            "id": "greeting_header",
            "display": [
              "Personalized greeting (Good Morning/Evening + student_name)",
              "Quick stats: Active Schedules count, Today’s date",
              "Recent notification highlight (max 1 urgent alert)"
            ]
          },
          {
            "id": "notifications",
            "display": [
              "Notification list with badges for unread",
              "Compact mode: Title + time",
              "Detail view on click (Location, Teacher, Type)"
            ]
          },
          {
            "id": "class_info",
            "display": [
              "Batch & Class info",
              "Scheduled events count"
            ]
          },
          {
            "id": "calendar",
            "view_modes": ["Day", "Week", "Month"],
            "color_codes": {
              "lesson": "blue",
              "exam": "red",
              "broadcast": "green",
              "personal": "purple"
            },
            "icons": {
              "lesson": "📘",
              "exam": "📝",
              "broadcast": "📢",
              "personal": "👤"
            },
            "actions": ["Add Event", "Filter by type"]
          },
          {
            "id": "upcoming_events",
            "display_mode": "list_compact",
            "items": [
              "Subject/Event title",
              "Date & time",
              "Type label + icon",
              "Expandable details"
            ]
          },
          {
            "id": "personal_schedule",
            "display": [
              "Next 1–2 personal events preview",
              "+ Add personal schedule button"
            ]
          },
          {
            "id": "progress_tracker",
            "display": [
              "Weekly attendance % or schedules attended",
              "Login streak counter"
            ]
          }
        ]
      }
    },
    "teacher": {
      "dashboard": {
        "sections": [
          {
            "id": "greeting_header",
            "display": [
              "Greeting (Good Morning, Teacher_name)",
              "Quick stats: # classes, # upcoming lessons",
              "Pending approvals or tasks"
            ]
          },
          {
            "id": "notifications",
            "display": [
              "Class-related alerts",
              "System updates",
              "Broadcast feedback (who has seen the event)"
            ]
          },
          {
            "id": "class_calendar",
            "display": [
              "Merged calendar across assigned classes",
              "Event types color-coded",
              "Filter: Class | Subject | Broadcasts"
            ],
            "actions": [
              "Add new lesson schedule",
              "Broadcast to class",
              "Edit/delete own events"
            ]
          },
          {
            "id": "upcoming_class_events",
            "display_mode": "list",
            "items": [
              "Lesson title + time",
              "Target class",
              "Student attendance (future extension)"
            ]
          },
          {
            "id": "quick_actions",
            "buttons": [
              "Add Schedule",
              "Broadcast",
              "Message Class"
            ]
          }
        ]
      }
    },
    "admin": {
      "dashboard": {
        "sections": [
          {
            "id": "greeting_header",
            "display": [
              "System overview",
              "Quick stats: Total batches, Total classes, Total users"
            ]
          },
          {
            "id": "system_notifications",
            "display": [
              "Alerts about system health",
              "New users registered",
              "Failed emails or schedule conflicts"
            ]
          },
          {
            "id": "management_panels",
            "display": [
              "Batch management (create, delete)",
              "Class management (assign teachers/students)",
              "User management (add/edit/delete)"
            ]
          },
          {
            "id": "analytics",
            "display": [
              "Usage metrics: Active users, Events created",
              "Email delivery reports",
              "Conflict/Overload frequency"
            ]
          },
          {
            "id": "global_calendar",
            "display": [
              "View all schedules across system",
              "Filter by batch/class",
              "Highlight conflicts"
            ]
          },
          {
            "id": "quick_actions",
            "buttons": [
              "Import Students",
              "Add Batch",
              "Add Class",
              "Generate Report"
            ]
          }
        ]
      }
    }
  },
  "shared_components": {
    "notifications": {
      "types": ["lesson_update", "exam_reminder", "broadcast", "system_alert"],
      "delivery": ["in_app", "email"]
    },
    "calendar": {
      "views": ["Day", "Week", "Month"],
      "color_coding": true,
      "conflict_detection": true
    },
    "events": {
      "fields": [
        "title",
        "description",
        "start_time",
        "end_time",
        "location",
        "event_type",
        "created_by",
        "target_class"
      ]
    }
  }
}
