

# 📋 Microchip Task Management System

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

A full-stack Task Management System with JWT authentication, task assignment, filtering, and pagination. Built with **FastAPI** on the backend, **React + Vite** on the frontend, and **MySQL** as the database.

---

## 📑 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Requirements](#-requirements)
- [Database Setup](#-database-setup)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Running the Project](#-running-the-project)
- [API Reference](#-api-reference)
  - [Authentication](#authentication-apis)
  - [Users](#user-apis)
  - [Tasks](#task-apis)
- [Architecture](#-architecture)
- [Pre-Submission Checklist](#-pre-submission-checklist)

---

## ✨ Features

- 🔐 User registration and login with JWT authentication
- ✅ Create, update, delete, assign, and fetch tasks
- 🔍 Task filtering by status and assigned user
- 📄 Pagination support for task listing
- 🛡️ Protected API routes via Bearer token
- 📱 Responsive frontend dashboard

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── users.py
│   │       └── tasks.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── user.py
│   │   └── task.py
│   ├── repositories/
│   │   ├── user_repository.py
│   │   └── task_repository.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── task.py
│   ├── services/
│   │   ├── auth_service.py
│   │   └── task_service.py
│   └── main.py
├── requirements.txt
└── seed_data.py

frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 🛠️ Requirements

| Tool | Version |
|------|---------|
| Python | 3.8+ |
| Node.js | 18+ |
| npm | Latest |
| MySQL | 8+ |

---

## 🗄️ Database Setup

```sql
CREATE DATABASE task_manager;
USE task_manager;
```

### Users Table

```sql
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    hashed_password VARCHAR(255)  NOT NULL,
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      TEXT         NULL,
    status           VARCHAR(50)  NOT NULL DEFAULT 'pending',
    assigned_user_id INT          NULL,
    created_by       INT          NOT NULL,
    due_date         DATETIME     NULL,
    created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_assigned_user
        FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by)       REFERENCES users(id) ON DELETE CASCADE
);
```

> **Note:** Two foreign keys reference the `users` table. SQLAlchemy relationships must explicitly declare which key they use to avoid `AmbiguousForeignKeysError`.

---

## ⚙️ Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib[bcrypt] pydantic email-validator
```

### `requirements.txt`

```
fastapi
uvicorn
sqlalchemy
pymysql
python-jose
passlib[bcrypt]
pydantic
email-validator
```

### Configuration — `app/core/config.py`

```python
DATABASE_URL                = "mysql+pymysql://root:YOUR_PASSWORD@localhost/task_manager"
SECRET_KEY                  = "your-secret-key"
ALGORITHM                   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
```

### Seed Sample Data

After tables are created, populate the database with sample users and tasks:

```bash
python seed_data.py
```

This creates two users (`Vijay` and `Rahul`) and three sample tasks across all status types.

---

## 🖥️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Starting from scratch with Vite:**

```bash
npm create vite@latest frontend
cd frontend
npm install
npm install axios react-router-dom
npm run dev
```

---

## 🚀 Running the Project

| Step | Command | URL |
|------|---------|-----|
| 1. Start MySQL | Ensure `task_manager` DB exists | — |
| 2. Start Backend | `uvicorn app.main:app --reload` | http://localhost:8000 |
| 3. Swagger Docs | _(auto-generated)_ | http://localhost:8000/docs |
| 4. Start Frontend | `npm run dev` | http://localhost:5173 |

---

## 📡 API Reference

> 🔒 Routes marked with a lock require the following header:
> ```
> Authorization: Bearer <your_jwt_token>
> ```

---

### Authentication APIs

#### `POST /api/v1/auth/register`

Register a new user account.

**Request Body**
```json
{
  "name": "Vijay",
  "email": "vijay@example.com",
  "password": "Password123"
}
```

**Response `200 OK`**
```json
{
  "id": 1,
  "name": "Vijay",
  "email": "vijay@example.com"
}
```

---

#### `POST /api/v1/auth/login`

Authenticate and receive a JWT access token.

**Request Body**
```json
{
  "email": "vijay@example.com",
  "password": "Password123"
}
```

**Response `200 OK`**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Vijay",
    "email": "vijay@example.com"
  }
}
```

---

### User APIs

#### `GET /api/v1/users/` 🔒

Retrieve a list of all registered users.

**Response `200 OK`**
```json
[
  { "id": 1, "name": "Vijay", "email": "vijay@example.com" },
  { "id": 2, "name": "Rahul", "email": "rahul@example.com" }
]
```

---

#### `GET /api/v1/users/{user_id}` 🔒

Retrieve a specific user by ID.

**Response `200 OK`**
```json
{
  "id": 1,
  "name": "Vijay",
  "email": "vijay@example.com"
}
```

---

### Task APIs

#### `POST /api/v1/tasks/` 🔒

Create a new task.

**Request Body**
```json
{
  "title": "Finish backend integration",
  "description": "Connect React frontend to FastAPI backend",
  "status": "pending",
  "assigned_user_id": 2,
  "due_date": "2026-04-01T12:00:00"
}
```

**Response `201 Created`**
```json
{
  "id": 1,
  "title": "Finish backend integration",
  "description": "Connect React frontend to FastAPI backend",
  "status": "pending",
  "assigned_user_id": 2,
  "assigned_user_name": "Rahul",
  "created_by": 1,
  "due_date": "2026-04-01T12:00:00",
  "created_at": "2026-03-27T10:00:00"
}
```

---

#### `GET /api/v1/tasks/` 🔒

Retrieve a paginated list of tasks with optional filters.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `int` | `1` | Page number |
| `page_size` | `int` | `10` | Results per page |
| `status` | `string` | — | Filter: `pending`, `in_progress`, `completed` |
| `assigned_user_id` | `int` | — | Filter by assigned user ID |

**Example Requests**
```
GET /api/v1/tasks/
GET /api/v1/tasks/?page=1&page_size=5
GET /api/v1/tasks/?status=pending
GET /api/v1/tasks/?assigned_user_id=2
GET /api/v1/tasks/?status=in_progress&page=2&page_size=10
```

**Response `200 OK`**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Finish backend integration",
      "description": "Connect React frontend to FastAPI backend",
      "status": "pending",
      "assigned_user_id": 2,
      "assigned_user_name": "Rahul",
      "due_date": "2026-04-01T12:00:00",
      "created_at": "2026-03-27T10:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

---

#### `GET /api/v1/tasks/{task_id}` 🔒

Retrieve a specific task by ID.

**Response `200 OK`**
```json
{
  "id": 1,
  "title": "Finish backend integration",
  "description": "Connect React frontend to FastAPI backend",
  "status": "pending",
  "assigned_user_id": 2,
  "assigned_user_name": "Rahul",
  "due_date": "2026-04-01T12:00:00",
  "created_at": "2026-03-27T10:00:00"
}
```

---

#### `PUT /api/v1/tasks/{task_id}` 🔒

Update an existing task.

**Request Body**
```json
{
  "title": "Finish backend integration - updated",
  "description": "Connected login, users, and tasks APIs",
  "status": "in_progress",
  "assigned_user_id": 3,
  "due_date": "2026-04-03T18:00:00"
}
```

**Response `200 OK`**
```json
{
  "id": 1,
  "title": "Finish backend integration - updated",
  "description": "Connected login, users, and tasks APIs",
  "status": "in_progress",
  "assigned_user_id": 3,
  "assigned_user_name": "Priya",
  "due_date": "2026-04-03T18:00:00",
  "updated_at": "2026-03-27T14:30:00"
}
```

---

#### `DELETE /api/v1/tasks/{task_id}` 🔒

Delete a task by ID.

**Response `200 OK`**
```json
{
  "message": "Task deleted successfully."
}
```

---

### Task Status Values

| Status | Description |
|--------|-------------|
| `pending` | Task has not been started |
| `in_progress` | Task is actively being worked on |
| `completed` | Task has been finished |

---

## 🏗️ Architecture

The backend follows a strict layered architecture:

```
HTTP Request
     │
     ▼
┌─────────────┐
│  API Layer  │  ← Routes, request/response handling
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Schema Layer │  ← Pydantic validation
└──────┬───────┘
       │
       ▼
┌───────────────┐
│ Service Layer │  ← Business logic
└──────┬────────┘
       │
       ▼
┌──────────────────┐
│ Repository Layer │  ← SQLAlchemy DB queries
└──────┬───────────┘
       │
       ▼
┌─────────────┐
│ Model Layer │  ← ORM table definitions
└─────────────┘
```

### Frontend Layers

| Folder | Purpose |
|--------|---------|
| `pages/` | Login, Register, Dashboard views |
| `components/` | Navbar, TaskForm, TaskList, Filters, Pagination |
| `api/` | Axios client + API service functions |
| `styles/` | CSS layout and responsive design |

---

## ✅ Pre-Submission Checklist

- [ ] User registration works
- [ ] User login returns a valid JWT token
- [ ] JWT token is stored and attached to protected requests
- [ ] Users API responds correctly with auth token
- [ ] Task creation works
- [ ] Task update works
- [ ] Task deletion works
- [ ] Task assignment to a user works
- [ ] Filter by status returns correct results
- [ ] Filter by assigned user returns correct results
- [ ] Pagination returns correct page and size
- [ ] Frontend loads without CORS or authentication errors
- [ ] Swagger docs open and all sample payloads are testable

---

## 📄 License

Developed as a technical submission for **Microchip Technology**.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
