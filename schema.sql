-- Employee Management System - Database Schema -----

CREATE DATABASE IF NOT EXISTS employee_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE employee_management;

CREATE TABLE IF NOT EXISTS employees (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      VARCHAR(50)    NOT NULL UNIQUE,
  full_name        VARCHAR(150)   NOT NULL,
  email            VARCHAR(150)   NOT NULL UNIQUE,
  phone            VARCHAR(20)    NOT NULL,
  gender           ENUM('Male', 'Female', 'Other') NOT NULL,
  department       ENUM('HR', 'Finance', 'IT', 'Sales') NOT NULL,
  date_of_joining  DATE           NOT NULL,
  salary           DECIMAL(12, 2) NOT NULL,
  address          TEXT           NOT NULL,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Helpful indexes for lookups/sorting used by the API
CREATE INDEX idx_department ON employees (department);
CREATE INDEX idx_created_at ON employees (created_at);
