# 🚀 Team Task Manager

A full-stack web application designed to manage team projects, assign tasks, and track progress with role-based access control.

---

## 🌐 Live Application
👉 https://team-task-manager-nb8a.onrender.com

---

## 📌 Project Overview

Team Task Manager is built to simplify team collaboration.  
It allows users to create projects, manage members, assign tasks, and monitor progress — all in one place.

Each project has its own role-based system, ensuring secure and structured task management.

---

## ✨ Key Features

### 🔐 Authentication
- Secure user signup and login
- JWT-based authentication system

---

### 📁 Project Management
- Users can create multiple projects
- Project creator automatically becomes **Admin**

---

### 👥 Team Management
- Admin can add members using email
- Only registered users can be added
- Members are project-specific

---

### ✅ Task Management
- Admin can:
  - Create tasks
  - Assign tasks to members
- Each task includes:
  - Title
  - Description
  - Due date
  - Assigned member

---

### 🔄 Task Status Tracking
- Task statuses:
  - To Do
  - In Progress
  - Done
- Members can update task status

---

### 🔐 Role-Based Access Control

Roles are **project-specific**:

#### 👑 Admin
- Create projects
- Add/remove members
- Assign tasks
- Delete tasks

#### 👤 Member
- View assigned tasks
- Update task status
- Cannot manage members or assign tasks

---

## 📊 Dashboard

- Displays selected project data
- Shows:
  - Total tasks
  - Completed tasks
  - Pending tasks

👉 UI dynamically changes based on user role (Admin / Member)

---

## ⚙️ How It Works

1. User signs up and logs in
2. User creates a project → becomes Admin
3. Admin adds team members
4. Admin assigns tasks to members
5. Members log in and update task status
6. Dashboard updates in real-time based on role and data

---

## 🗄️ Database Design

### Tables:
- User
- Project
- ProjectMember
- Task

### Relationships:
- One user → multiple projects
- One project → multiple members
- Tasks belong to a project
- ProjectMember table handles role-based access

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python (Flask)
- Flask-JWT-Extended
- Flask-SQLAlchemy

### Database
- SQLite

### Deployment
- Render

---

## ⚙️ Run Locally

```bash
git clone https://github.com/Gate2024/Team_Task_Manager.git
cd Team_Task_Manager

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python app.py
