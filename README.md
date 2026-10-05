# Employee Management System

A full-stack Employee Registration application.

* **Frontend:** HTML, CSS, vanilla JavaScript (served as static files by Express)
* **Backend:** Node.js + Express.js (REST API)
* **Database:** MySQL

The form collects Employee ID, Full Name, Email, Phone, Gender, Department,
Date of Joining, Salary, and Address, saves it to MySQL, and lists every
saved employee in a directory table below the form (with a delete option).

```
employee-management-system/
├── public/                 ← Frontend
│   ├── index.html
│   ├── css/style.css
│   └── js/script.js
├── server.js                ← Express app & API routes
├── db.js                    ← MySQL connection pool
├── schema.sql                ← Database + table creation script
├── package.json
├── .env.example
└── README.md
```

## 1. Prerequisites

* Node.js 18+ and npm
* MySQL Server 8.x (or compatible) running locally or remotely

## 2. Set up the database

Run the provided schema file to create the database and table:

```bash
mysql -u root -p < schema.sql
```

This creates a database called `employee_management` with a single
`employees` table.

## 3. Configure environment variables

Copy the example env file and fill in your MySQL credentials:

```bash
cp .env.example .env
```

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_management
PORT=5000
```

## 4. Install dependencies

```bash
npm install
```

## 5. Run the server

```bash
npm start
```

You should see:

```
✅ Connected to MySQL database: employee_management
🚀 Server running at http://localhost:5000
```

Open **http://localhost:5000** in your browser — Express serves the
frontend and the API from the same port, so there is no CORS setup needed.

For development with auto-restart on file changes:

```bash
npm run dev
```

## API Reference

| Method | Endpoint              | Description                       |
|--------|------------------------|-----------------------------------|
| GET    | `/api/health`           | Health check                      |
| POST   | `/api/employees`        | Create a new employee             |
| GET    | `/api/employees`        | List all employees (newest first) |
| GET    | `/api/employees/:id`    | Get a single employee by id       |
| DELETE | `/api/employees/:id`    | Delete an employee by id          |

### Example request body for `POST /api/employees`

```json
{
  "employee_id": "EMP-1042",
  "full_name": "Asha Patel",
  "email": "asha.patel@company.com",
  "phone": "+1 555 123 4567",
  "gender": "Female",
  "department": "IT",
  "date_of_joining": "2024-03-15",
  "salary": 65000,
  "address": "221B Baker Street, Springfield, IL"
}
```

The server validates required fields, email format, phone format, a
non-negative salary, and enforces uniqueness on `employee_id` and `email`
(returns `409 Conflict` on duplicates, `400 Bad Request` on validation
errors with a per-field `errors` object).

## Form features

* Modern, responsive two-column layout (stacks on mobile)
* Live "ID badge" preview that updates as you type the name, department,
  and employee ID
* Required-field, email-format, phone-format, and salary validation,
  both client-side (instant feedback) and server-side (authoritative)
* **Submit** button — saves the form to MySQL via the API and refreshes
  the directory table
* **Clear** button — resets every field, radio button, dropdown, and
  textarea back to empty
* Employee Directory table with a **Remove** action per row (calls the
  `DELETE` endpoint)

## Troubleshooting

* **"Failed to connect to MySQL"** — double-check `.env` credentials and
  that MySQL is running (`mysql -u root -p` should connect manually).
* **"Network error — is the backend server running?"** in the browser —
  make sure `npm start` is running and you're visiting
  `http://localhost:5000` (not opening `index.html` directly from disk).
* **Port already in use** — change `PORT` in `.env`.
