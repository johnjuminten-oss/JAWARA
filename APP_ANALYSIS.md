# Jawara School Management System - Application Analysis

## 1. Introduction
The Jawara School Management System is a comprehensive scheduling and event management platform designed for educational institutions. It supports role-based access control and provides tailored features for administrators, teachers, and students to manage academic schedules, events, assignments, and notifications efficiently.

## 2. Roles and Permissions

### Administrator
- Full system access and control.
- Manage batches, classes, schedules, teachers, and students.
- Create, update, delete any event or broadcast.
- View all personal events and system settings.

### Teacher
- Manage own events and assigned class events.
- Create lessons, exams, assignments, and broadcasts.
- View assigned classes and student lists.
- Limited to assigned classes for event management.

### Student
- View class schedules and personal events.
- Create and manage personal events.
- Access broadcast announcements and assignment deadlines.
- Restricted to own class and personal data.

## 3. Data Model and Backend Relationships

- **Batches** represent year levels (e.g., X, XI, XII).
- **Classes** belong to batches and contain students and schedules.
- **Profiles** represent users with roles (admin, teacher, student) linked to classes.
- **Subjects** are academic subjects linked to classes and teachers.
- **Events** include lessons, exams, assignments, personal events, and broadcasts.
- **Assignments** are linked to events and classes.
- **Notifications** provide alerts and messages to users.

Relationships:
- Teachers are assigned to subjects and classes.
- Students belong to classes.
- Events target specific classes or individuals.
- Row Level Security policies enforce data access based on roles and relationships.

## 4. Frontend Architecture

- Built with Next.js and React.
- Role-based dashboard pages (e.g., student dashboard).
- Components include calendar views, notifications panel, upcoming schedules, welcome banners, and event forms.
- Data fetching via Supabase client in `lib/dashboard.ts` with tailored queries per role.
- UI components use Radix UI and Tailwind CSS for styling and interactivity.

## 5. Backend Architecture

- Uses Supabase (PostgreSQL) as backend database and authentication provider.
- Database schema includes tables for batches, classes, profiles, subjects, events, assignments, notifications, and relationships.
- Row Level Security (RLS) policies enforce strict access control at the database level.
- Helper SQL functions define role checks and class membership validations.
- API routes and server-side functions fetch data securely based on user roles.
- Authentication and role enforcement handled in `lib/auth.ts`.

## 6. Features Summary

- Role-based access and permissions.
- Event management with multiple event types: lessons, exams, assignments, personal, broadcast.
- Recurring events and metadata support.
- Notifications and alerts for busy schedules, conflicts, reminders, and missing teachers.
- Calendar views with toggle for fixed and personal schedules.
- Conflict detection and alerts.
- Email notifications for alerts and broadcasts.

## 7. Security and Access Control

- Row Level Security policies restrict data access by user role and relationships.
- Policies allow admins full access, teachers access to assigned classes, and students access to own class data.
- Helper functions in SQL provide role and class membership checks.
- Authentication middleware enforces login and role-based redirects.
- Data integrity ensured with foreign keys, cascade deletes, and indexed queries.

## 8. Conclusion

The Jawara School Management System is a robust, secure, and feature-rich platform tailored for educational institutions. It provides comprehensive scheduling, event management, and communication tools for administrators, teachers, and students, while maintaining strict security and data access controls. The system's modular frontend and backend architecture enable efficient data handling and user experience.

---
