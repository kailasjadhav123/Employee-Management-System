// db.js
// Creates and exports a reusable MySQL connection pool.

require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "kailas@123",
  database: process.env.DB_NAME || "employee_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});


async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log("✅ Connected to MySQL database:", process.env.DB_NAME);
  } finally {
    conn.release();
  }
}

module.exports = { pool, testConnection };
