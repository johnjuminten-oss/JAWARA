## Dashboard components by role

This document lists all dashboard-related components grouped by role (Admin, Teacher, Student) and shared dashboard pieces. Descriptions are inferred from filenames and the provided `components/student/dashboard-content.tsx` excerpt. If you want exact prop lists or internals, I can open any file and extract them.

Assumptions
- Descriptions are inferred from filenames and common UI patterns in this repo.
- "Dashboard" components are considered any component in a role subfolder or the `components/dashboard` shared folder that is used on the role's dashboard.

## Admin

- `components/admin/dashboard-content.tsx` — Main admin dashboard container; composes admin widgets, header, and layout for admin views.
- `components/admin/batch-management.tsx` — Management UI to create/list/edit batches.
- `components/admin/batch-class-management.tsx` — UI for managing batches scoped to classes (assigning classes to batches or vice versa).
- `components/admin/class-management.tsx` — Manage classes (create, rename, metadata).
- `components/admin/class-capacity-modal.tsx` — Modal used to view or edit class capacity limits.
- `components/admin/schedule-management.tsx` — UI to manage schedules at the system level (create/edit recurring schedules, calendars).
- `components/admin/student-assignment.tsx` — Tool to assign students to classes/batches.
- `components/admin/teacher-assignment.tsx` — Tool to assign teachers to classes or batches.
- `components/admin/user-management.tsx` — Manage user accounts, roles, and basic profile admin actions.
- `components/admin/system-settings.tsx` — Global system settings UI used by admins.

Note: The `components/admin` folder may also contain admin-specific subfolders (`alerts`, `calendar`, `dashboard`, etc.) — those contain support UIs and widgets used by the admin dashboard.

## Teacher

- `components/teacher/dashboard-content.tsx` — Main teacher dashboard container; aggregates teacher widgets (calendar, broadcasts, schedules) and composes the teacher-specific layout.
- `components/teacher/teacher-calendar-view.tsx` — Calendar view tailored for teachers (class schedules, teaching assignments, toggles for visibility).
- `components/teacher/broadcast-form.tsx` — Generic broadcast message form (used by teachers to compose class-level messages).
- `components/teacher/teacher-broadcast-form.tsx` — Teacher-specific wrapper around broadcast creation, likely fills teacher metadata and target class info.
- `components/teacher/personal-events-view.tsx` — UI for viewing and managing the teacher's personal events (non-class events).
- `components/teacher/schedule-type-selector.tsx` — Small selector UI to pick schedule types (class, personal, recurring).
- `components/teacher/schedule-type-selector-modal.tsx` — Modal variant of the schedule-type selector for workflows that need a dialog.

## Student

- `components/student/dashboard-content.tsx` — Main student dashboard container. (See file excerpt: it composes `Header`, `WelcomeBanner`, `NotificationsPanel`, `StudentCalendarView`, `UpcomingSchedules`, `EventForm`, and `AlertModal`.)
  - Responsibility: render student-specific dashboard layout, show class calendar (if assigned), teacher schedules, personal events, notifications, and quick actions (add personal event).
- `components/student/student-calendar-view.tsx` — Calendar view used in the student dashboard that queries and renders class events for the student.
- `components/student/teacher-broadcast-banner.tsx` — Small banner component to surface teacher broadcasts on the student dashboard.

## Shared dashboard components (`components/dashboard`)

- `components/dashboard/header.tsx` — Shared header used across dashboards: user avatar, quick links, role switcher or breadcrumbs.
- `components/dashboard/welcome-banner.tsx` — Welcome banner with stats and an optional message (used on student and probably teacher dashboards).
- `components/dashboard/notifications-panel.tsx` — Notifications list UI used in dashboards to show/read notifications and their status (unread count, actions).
- `components/dashboard/upcoming-schedules.tsx` — Reusable list/grid used to render upcoming events or schedules grouped by type (teacher schedules, personal events).
- `components/dashboard/broadcast-banner.tsx` — Banner to surface broadcast messages (global or role-specific) on dashboards.
- `components/dashboard/calendar-placeholder.tsx` — Lightweight placeholder shown when a calendar isn't available (e.g., not assigned to a class).

## How I derived these descriptions
- Filenames and conventional UI responsibilities (e.g., "dashboard-content" implies page container; "-view" implies a calendar or list view; "-form" implies a create/edit form).
- The provided `components/student/dashboard-content.tsx` was inspected and confirms how shared components are composed on the student dashboard.

## Next steps (optional)
- I can open any specific file and extract exact props, types, and usage examples.
- I can generate a small README or update code comments to document which dashboard component is used where.

## Requirements coverage
- Requirement: "for every role, give me every role dashboard component names and what are their function" — Done (inferred from filenames and the provided file excerpt).

---
Generated from repository component listings and `components/student/dashboard-content.tsx` excerpt.
