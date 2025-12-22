# Inventory Management System

Enterprise production-ready inventory system.
# Inventory Management System API

A production-ready Inventory Management System built with **Node.js, Express, PostgreSQL, Docker**, and deployed on **Fly.io**.  
Supports authentication, role-based authorization, transactional stock transfers, audit logging, and automated migrations.

---

## 🚀 Features

- JWT Authentication (Access + Refresh Tokens)
- Role-Based Access Control (Admin / Manager)
- Atomic Stock Transfers (Postgres transactions)
- Audit Logging
- Automatic Database Migrations on Startup
- Dockerized (Local & Production)
- Cloud Deployment (Fly.io)
- Health Checks & Production Readiness

---

## 🧱 Architecture Overview

- **API**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT (HS256)
- **Infra**: Docker, Fly.io
- **Security**: RBAC, transactional consistency

---

## 📦 Tech Stack

| Layer | Technology |
|-----|-----------|
| Backend | Node.js, Express |
| Database | PostgreSQL 16 |
| Auth | JWT, bcrypt |
| Containers | Docker, Docker Compose |
| Deployment | Fly.io |

---

## 🗄 Database Schema (Core Tables)

- `users`
- `products`
- `locations`
- `stock`
- `stock_transfers`
- `audit_logs`

Foreign keys and constraints ensure consistency.

---

## 🔐 Authentication

### Register
`POST /api/v1/auth/register`

### Login
`POST /api/v1/auth/login`

Returns:
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
