# ElectroTrack WMS — Electrician Workforce & Management System

An enterprise-grade, modern Web Application and Workforce Management System built for electrical contracting firms, field technicians, and electrical service providers.

---

## Key Features

- **Workforce & Electrician Dispatching**: Assign and track certified electricians with real-time job queues, skill specializations, and availability metrics.
- **Client & Customer CRM**: Manage commercial and residential customer directories, GSTIN registration, contact profiles, and billing histories.
- **Itemized Invoicing & PDFKit Generation**: Create itemized invoices with line items, labour costs, direct material charges, transportation/service allowances, discounts, and taxes with dynamic PDF streaming.
- **Live Shift Tracking & Attendance**: Field check-in/check-out timestamps, active shift management, and automated work duration calculation.
- **Inventory & Materials Management**: SKU cataloging, minimum stock threshold alerts, and real-time inventory valuation.
- **Business Intelligence & Analytics**: Interactive revenue charts, job distribution visualizations, technician performance leaderboards, and dashboard metrics.
- **Company Branding & Settings**: Configurable company details, bank account credentials (IFSC / UPI QR), and custom terms and conditions.

---

## Tech Stack

- **Frontend**: React 18 SPA, React Router v6, Chart.js / React-ChartJS-2, React Icons, Axios, React Toastify.
- **Design System**: Dark glassmorphism interface, CSS custom properties / design tokens, responsive collapsible sidebar.
- **Backend API**: Node.js, Express.js, Mongoose ODM, JWT Authentication (bcrypt.js), PDFKit Document Generator.
- **Database**: MongoDB (Local or MongoDB Atlas).

---

## Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB (Running on `mongodb://localhost:27017`)

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
*API Server runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
npm install
npm start
```
*Web App runs on `http://localhost:3000`*

---

## Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@company.com` | `password123` |
| **Electrician / Technician** | *(Register new technician or assign via Electricians menu)* | *User defined* |

---

## Documentation

For full architectural breakdown, API endpoint catalog, database models, and setup guides, refer to [**REFERENCE.md**](./REFERENCE.md) and [**TEST_REPORT.md**](./TEST_REPORT.md).
