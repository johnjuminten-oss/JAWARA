# 📘 School Schedule Management System – Complete Guide

This file explains how the system works, including **roles, workflows, data structures, requirements, alerts, testing, and a development to-do list** — all in one document.

---

## 🏗 System Structure

- **Batch** → Year level (X, XI, XII)  
  - Contains multiple **Classes**
- **Class** → Example: X MIPA 1  
  - Contains **Schedules**  
  - Contains **Students**  
  - Contains **Teachers (per subject)**
- **Schedules**  
  - **Fixed schedules** (Admin-created, official timetable)  
  - **Personal schedules** (Teacher/Student created, private)  
- **Users/Roles**  
  - **Admin**  
  - **Teacher**  
  - **Student**

---

## 📂 Data Model (Conceptual)

Batch (X, XI, XII)
└── Class (X MIPA 1, XI IPS 2, etc.)
├── Students (enrolled by Admin)
├── Teachers (assigned to subjects)
└── Schedules
├── Fixed (Admin)
└── Personal (Teacher/Student)

markdown
Copy code

---

## 👥 Roles, Duties & Workflows

### 1. Admin
- **Duties**
  - Create batches.
  - Add classes.
  - Create class schedules.
  - Assign teachers.
  - Enroll students.
  - Manage updates.

- **Workflow**
Admin → Create Batch → Add Classes → Assign Teachers → Create Class Schedule → Enroll Students

markdown
Copy code

- **Requirements**
- Batches and classes must be created first.
- Each subject requires a teacher.
- Each student belongs to one class.

---

### 2. Teacher
- **Duties**
- View assigned class schedules.
- View student lists.
- Add personal schedules.
- Broadcast schedules to class.
- Follow fixed schedules.

- **Workflow**
Teacher → View Assigned Classes → View Class Schedule → View Students → Add/Share Schedule

markdown
Copy code

- **Requirements**
- Must be assigned to subjects by Admin.
- Limited to own assigned classes.
- Can create personal schedules only.

---

### 3. Student
- **Duties**
- View class schedule.
- Add personal schedules.
- Follow fixed schedules.

- **Workflow**
Student → Login → View Own Class Schedule → Add Personal Schedule

pgsql
Copy code

- **Requirements**
- Must belong to a class group.
- Can only view their class schedule.
- Can create personal schedules.

---

## 📅 Calendar Behavior

- Fixed schedules = **Blue** (official).  
- Personal schedules = **Custom colors**.  
- Combined view = toggle fixed/personal/both.  
- Conflict detection = warns on overlaps.  
- Teacher broadcasts = appear in class calendar.  
- Alerts = highlight conflicts, overload, or missing info.  

---

## 🚨 Alerts & Notifications

1. **Busy Alert** → If more than **X activities per week**.  
2. **Conflict Alert** → If overlapping schedules are added.  
3. **Reminder Alert** → Before an upcoming class or exam.  
4. **Missing Teacher Alert** → If a subject has no teacher assigned.  
5. **Email Alerts** → All alerts and broadcasts can be sent to users’ email inbox.

---

## 🔗 Relationships & Access Control

Admin
├── Creates Batches
├── Creates Classes
├── Assigns Teachers
├── Enrolls Students
└── Creates Class Schedules

Teacher
├── Views Assigned Classes
├── Views Students
├── Creates Personal Schedules
└── Broadcasts Schedules to Class

Student
├── Views Own Class Schedule
└── Creates Personal Schedules

markdown
Copy code

- **Admin** → full access.  
- **Teacher** → restricted to assigned classes + personal schedules.  
- **Student** → restricted to own class + personal schedules.  

---

## ✅ System Requirements Checklist

- [ ] Admin has created batches and classes.  
- [ ] Teachers assigned to subjects.  
- [ ] Students enrolled in classes.  
- [ ] Class schedules created.  
- [ ] Teachers and students can add personal schedules.  
- [ ] Calendar supports toggle (fixed/personal).  
- [ ] Conflict detection implemented.  
- [ ] Alerts (busy, conflict, reminders, missing teacher) enabled.  
- [ ] Email alerts functional.  

---

## 🛠 Development To-Do List

### 1. Setup & Database
- [ ] Create database with tables:
  - Batches
  - Classes
  - Users (Admin, Teacher, Student)
  - Fixed Schedules
  - Personal Schedules
  - Alerts (Busy, Conflict, Reminder, Missing Teacher)
- [ ] Add relationships (Batch → Class → Students/Teachers/Schedules).
- [ ] Implement user authentication (roles).

### 2. Admin Features
- [ ] Create Batch (X, XI, XII).
- [ ] Add Classes (X MIPA 1, etc.).
- [ ] Assign Teachers to subjects.
- [ ] Enroll Students into classes.
- [ ] Create Class Schedules (day, subject, teacher, time).
- [ ] Manage updates (edit, delete, reassign).

### 3. Teacher Features
- [ ] View Assigned Classes.
- [ ] View Class Schedules.
- [ ] View Student List in assigned classes.
- [ ] Create Personal Schedules.
- [ ] Broadcast Schedule to class.
- [ ] Prevent modification of Fixed Schedules.

### 4. Student Features
- [ ] View own Class Schedule.
- [ ] Create Personal Schedules.
- [ ] Prevent modification of Class Schedules.

### 5. Calendar View
- [ ] Display Fixed Schedules (Blue).
- [ ] Display Personal Schedules (Custom).
- [ ] Toggle views (Fixed / Personal / Both).
- [ ] Implement conflict detection.

### 6. Alerts & Notifications
- [ ] Busy Alert (X activities per week).
- [ ] Conflict Alert (overlapping schedules).
- [ ] Reminder Alert (before class/exam).
- [ ] Missing Teacher Alert.
- [ ] Email alerts for all roles.

### 7. Security & Access Control
- [ ] Admin → Full control.
- [ ] Teacher → Only assigned classes.
- [ ] Student → Only their own class.
- [ ] Enforce policies at database/API level.

### 8. Testing & Validation
- [ ] Test schedule creation without conflicts.
- [ ] Test access restrictions for roles.
- [ ] Test calendar conflict detection.
- [ ] Test alerts (busy, conflict, reminders).
- [ ] Test email notifications delivery.
- [ ] Test real-time updates (changes appear instantly).

---

## 🧪 MVP Testing Parameters

### 1. Calendar Per User
- Each user has their own calendar view.  
- Validate that users only see what they’re allowed.

### 2. User Input Schedules
- Students/teachers can create personal schedules.  
- Confirm privacy of personal schedules.

### 3. Teacher Broadcast
- Teacher adds a schedule for a class.  
- All students in that class see it.  
- Other classes do not.

### 4. Busy Alert
- Add >X activities in one week → Alert triggers.  
- Add ≤X → No alert.

### 5. Other Alerts
- Overlapping schedules → Conflict alert.  
- Upcoming schedule → Reminder alert.  
- Missing teacher in class → Admin alert.

### 6. Email Alerts
- Alerts and broadcasts must reach email inbox.  
- Validate with test emails.

---

## 🚀 Next Steps
- Automate alerts & testing with scripts.  
- Expand to push notifications (optional).  
- Add admin dashboard to monitor alerts.  
- Collect feedback and iterate.

---
✅ Now everything is all in one MD file:

Roles & workflows

Data structure

Calendar behavior

Alerts & email

Requirements checklist

To-do list

MVP testing guide