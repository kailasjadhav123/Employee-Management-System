// server.js
// Express backend for the Employee Management System.

require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { pool, testConnection } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Validation helpers ----------
const VALID_GENDERS = ["Male", "Female", "Other"];
const VALID_DEPARTMENTS = ["HR", "Finance", "IT", "Sales"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-()\s]{7,20}$/;

function validateEmployeePayload(body) {
  const errors = {};
  const {
    employee_id,
    full_name,
    email,
    phone,
    gender,
    department,
    date_of_joining,
    salary,
    address,
  } = body;

  if (!employee_id || !employee_id.trim()) {
    errors.employee_id = "Employee ID is required.";
  }

  if (!full_name || !full_name.trim()) {
    errors.full_name = "Full name is required.";
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.email = "A valid email address is required.";
  }

  if (!phone || !PHONE_REGEX.test(phone.trim())) {
    errors.phone = "A valid phone number is required.";
  }

  if (!gender || !VALID_GENDERS.includes(gender)) {
    errors.gender = "Please select a gender.";
  }

  if (!department || !VALID_DEPARTMENTS.includes(department)) {
    errors.department = "Please select a valid department.";
  }

  if (!date_of_joining || isNaN(Date.parse(date_of_joining))) {
    errors.date_of_joining = "A valid date of joining is required.";
  }

  if (salary === undefined || salary === null || salary === "" || isNaN(salary) || Number(salary) < 0) {
    errors.salary = "Salary must be a positive number.";
  }

  if (!address || !address.trim()) {
    errors.address = "Address is required.";
  }

  return errors;
}

// Routes ----------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Employee Management API is running." });
});

// Create a new employee
app.post("/api/employees", async (req, res) => {
  const errors = validateEmployeePayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed.", errors });
  }

  const {
    employee_id,
    full_name,
    email,
    phone,
    gender,
    department,
    date_of_joining,
    salary,
    address,
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO employees
        (employee_id, full_name, email, phone, gender, department, date_of_joining, salary, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id.trim(),
        full_name.trim(),
        email.trim(),
        phone.trim(),
        gender,
        department,
        date_of_joining,
        Number(salary),
        address.trim(),
      ]
    );

    const [rows] = await pool.query("SELECT * FROM employees WHERE id = ?", [result.insertId]);

    res.status(201).json({ message: "Employee registered successfully.", employee: rows[0] });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      if (err.sqlMessage.includes("email")) {
        return res.status(409).json({ message: "An employee with this email already exists." });
      }
      return res.status(409).json({ message: "An employee with this Employee ID already exists." });
    }
    console.error("Error inserting employee:", err);
    res.status(500).json({ message: "Server error while saving employee." });
  }
});

// Get all employees 
app.get("/api/employees", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employees ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Server error while fetching employees." });
  }
});

// Get a single employee by id
app.get("/api/employees/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employees WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ message: "Server error while fetching employee." });
  }
});

// Delete an employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM employees WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Server error while deleting employee." });
  }
});

// Fallback to frontend 
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server ----------
(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MySQL. Check your .env settings.", err.message);
    process.exit(1);
  }
})();
