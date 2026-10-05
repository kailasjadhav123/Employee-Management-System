// script.js //------

const API_BASE = "/api/employees";

const form = document.getElementById("employeeForm");
const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");
const formStatus = document.getElementById("formStatus");

const fields = {
  employee_id: document.getElementById("employeeId"),
  full_name: document.getElementById("fullName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  department: document.getElementById("department"),
  date_of_joining: document.getElementById("dateOfJoining"),
  salary: document.getElementById("salary"),
  address: document.getElementById("address"),
};

const badgeName = document.getElementById("badgeName");
const badgeDept = document.getElementById("badgeDept");
const badgeId = document.getElementById("badgeId");
const employeeCount = document.getElementById("employeeCount");
const directoryCount = document.getElementById("directoryCount");
const tableBody = document.getElementById("employeeTableBody");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-()\s]{7,20}$/;


// Validation //---------

function getGenderValue() {
  const checked = form.querySelector('input[name="gender"]:checked');
  return checked ? checked.value : "";
}

function validate() {
  const errors = {};

  if (!fields.employee_id.value.trim()) errors.employee_id = "Employee ID is required.";
  if (!fields.full_name.value.trim()) errors.full_name = "Full name is required.";

  if (!fields.email.value.trim() || !EMAIL_REGEX.test(fields.email.value.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!fields.phone.value.trim() || !PHONE_REGEX.test(fields.phone.value.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!getGenderValue()) errors.gender = "Select a gender.";
  if (!fields.department.value) errors.department = "Select a department.";
  if (!fields.date_of_joining.value) errors.date_of_joining = "Select the date of joining.";

  const salaryVal = fields.salary.value;
  if (salaryVal === "" || isNaN(salaryVal) || Number(salaryVal) < 0) {
    errors.salary = "Enter a valid, non-negative salary.";
  }

  if (!fields.address.value.trim()) errors.address = "Address is required.";

  return errors;
}

function clearFieldErrors() {
  document.querySelectorAll(".error-text").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
}

function showFieldErrors(errors) {
  clearFieldErrors();
  Object.entries(errors).forEach(([name, message]) => {
    const errorEl = document.querySelector(`[data-error-for="${name}"]`);
    if (errorEl) errorEl.textContent = message;

    if (name === "gender") return; // radio group has no single input to mark invalid

    const input = fields[name];
    if (input) input.classList.add("invalid");
  });
}

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = "form-status" + (type ? ` ${type}` : "");
}

// Live badge preview //------------

function updateBadgePreview() {
  badgeName.textContent = fields.full_name.value.trim() || "Full name";
  badgeDept.textContent = fields.department.value
    ? `${fields.department.value} Department`
    : "Department —";
  badgeId.textContent = fields.employee_id.value.trim()
    ? `ID ${fields.employee_id.value.trim()}`
    : "ID —";
}

[fields.full_name, fields.department, fields.employee_id].forEach((el) =>
  el.addEventListener("input", updateBadgePreview)
);
fields.department.addEventListener("change", updateBadgePreview);


form.querySelectorAll('input[name="gender"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    form.querySelectorAll(".radio-pill").forEach((pill) => pill.classList.remove("is-checked"));
    radio.closest(".radio-pill").classList.add("is-checked");
  });
});


// Clear button //---------------

clearBtn.addEventListener("click", () => {
  form.reset();
  clearFieldErrors();
  setStatus("", null);
  form.querySelectorAll(".radio-pill").forEach((pill) => pill.classList.remove("is-checked"));
  updateBadgePreview();
  fields.employee_id.focus();
});


// Submit handler //

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const errors = validate();
  if (Object.keys(errors).length > 0) {
    showFieldErrors(errors);
    setStatus("Please fix the highlighted fields.", "error");
    return;
  }

  clearFieldErrors();

  const payload = {
    employee_id: fields.employee_id.value.trim(),
    full_name: fields.full_name.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    gender: getGenderValue(),
    department: fields.department.value,
    date_of_joining: fields.date_of_joining.value,
    salary: Number(fields.salary.value),
    address: fields.address.value.trim(),
  };

  submitBtn.disabled = true;
  submitBtn.querySelector(".btn-label").textContent = "Saving…";
  setStatus("", null);

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) showFieldErrors(data.errors);
      setStatus(data.message || "Could not save employee.", "error");
      return;
    }

    setStatus(`Saved — ${payload.full_name} was added to the registry.`, "success");
    form.reset();
    form.querySelectorAll(".radio-pill").forEach((pill) => pill.classList.remove("is-checked"));
    updateBadgePreview();
    loadEmployees();
  } catch (err) {
    console.error(err);
    setStatus("Network error — is the backend server running?", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector(".btn-label").textContent = "Save employee";
  }
});


// Directory table //-----

function formatSalary(value) {
  const num = Number(value);
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function renderEmployees(employees) {
  employeeCount.textContent = employees.length;
  directoryCount.textContent = `${employees.length} record${employees.length === 1 ? "" : "s"}`;

  if (employees.length === 0) {
    tableBody.innerHTML = `<tr class="empty-row"><td colspan="8">No employees registered yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = employees
    .map(
      (emp) => `
      <tr data-id="${emp.id}">
        <td class="id-cell">${escapeHtml(emp.employee_id)}</td>
        <td>${escapeHtml(emp.full_name)}</td>
        <td><span class="dept-chip">${escapeHtml(emp.department)}</span></td>
        <td>${escapeHtml(emp.email)}</td>
        <td>${escapeHtml(emp.phone)}</td>
        <td>${formatDate(emp.date_of_joining)}</td>
        <td class="salary-cell">${formatSalary(emp.salary)}</td>
        <td><button class="delete-btn" data-id="${emp.id}">Remove</button></td>
      </tr>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function loadEmployees() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to load employees");
    const employees = await res.json();
    renderEmployees(employees);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr class="empty-row"><td colspan="8">Could not load the directory. Is the backend running?</td></tr>`;
  }
}

tableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const row = btn.closest("tr");
  const name = row.children[1]?.textContent || "this employee";

  if (!confirm(`Remove ${name} from the registry?`)) return;

  btn.disabled = true;
  btn.textContent = "Removing…";

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    loadEmployees();
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = "Remove";
    alert("Could not remove this employee. Please try again.");
  }
});


// Init //----

updateBadgePreview();
loadEmployees();
