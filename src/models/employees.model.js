const pool = require("../config/db");
const config = require("../config/table.config.json");
const bycrypt = require("bcrypt");

const employeeTable = config.tables.employees;
const roleTable = config.tables.role;
const departmentTable = config.tables.departments;

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${employeeTable} (
      emp_id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      address TEXT NOT NULL,
      role_id INT REFERENCES ${roleTable}(role_id),
      dept_id INT REFERENCES ${departmentTable}(dept_id),
      designation TEXT NOT NULL,
      salary NUMERIC NOT NULL,
      date_of_joining DATE NOT NULL,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);
};

const safeCols = [
  "emp_id",
  "name",
  "email",
  "address",
  "role_id",
  "dept_id",
  "designation",
  "salary",
  "date_of_joining",
];

const allowedFields = [
  "name",
  "email",
  "address",
  "role_id",
  "dept_id",
  "designation",
  "salary",
  "date_of_joining",
];

const addEmployee = async ({
  name,
  email,
  address,
  role_id,
  dept_id,
  designation,
  salary,
  date_of_joining,
}) => {
  const tempPassword = "welcome@123";

  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const { rows } = await pool.query(
    `
    INSERT INTO ${employeeTable}
    (
      name,
      email,
      password,
      address,
      role_id,
      dept_id,
      designation,
      salary,
      date_of_joining
    )
    VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
    `,
    [
      name,
      email,
      hashedPassword,
      address,
      role_id,
      dept_id,
      designation,
      salary,
      date_of_joining,
    ],
  );

  return rows[0];
};

const deleteEmployee = async (emp_id) => {
  const { rows } = await pool.query(
    `
    UPDATE ${employeeTable}
    SET is_active = false
    WHERE emp_id = $1
    RETURNING *
    `,
    [emp_id],
  );
  return rows[0] || null;
};

const showAllEmployee = async () => {
  const { rows } = await pool.query(`
    SELECT ${safe_cols.join(", ")},
    r.role_name,
    d.dept_name
    FROM ${employeeTable}
    JOIN ${roleTable} r ON ${employeeTable}.role_id = r.role_id
    JOIN ${departmentTable} d ON ${employeeTable}.dept_id = d.dept_id
    WHERE is_active = true`);

  return rows || null;
};

const getEmployeeById = async (emp_id) => {
  const { rows } = await pool.query(
    `
    SELECT ${safe_cols.join(", ")},
    r.role_name,
    d.dept_name
    FROM ${employeeTable}
    JOIN ${roleTable} r ON ${employeeTable}.role_id = r.role_id
    JOIN ${departmentTable} d ON ${employeeTable}.dept_id = d.dept_id
    WHERE emp_id = $1 AND is_active = true`,
    [emp_id],
  );
  return rows[0] || null;
};

const oldEmployee = async () => {
  const { rows } = await pool.query(`
    SELECT ${safe_cols.join(", ")},
    r.role_name,
    d.dept_name
    FROM ${employeeTable}
    JOIN ${roleTable} r ON ${employeeTable}.role_id = r.role_id
    JOIN ${departmentTable} d ON ${employeeTable}.dept_id = d.dept_id
    WHERE is_active = false`);
  return rows || null;
};

const getOldEmployeeById = async (emp_id) => {
  const { rows } = await pool.query(
    `
    SELECT ${safe_cols.join(", ")},
    r.role_name,
    d.dept_name
    FROM ${employeeTable}
    JOIN ${roleTable} r ON ${employeeTable}.role_id = r.role_id
    JOIN ${departmentTable} d ON ${employeeTable}.dept_id = d.dept_id
    WHERE emp_id = $1 AND is_active = false`,
    [emp_id],
  );
  return rows[0] || null;
};

const updateEmployee = async (emp_id, updateData) => {
  // allowed fields for update
  const allowedFields = [
    "name",
    "email",
    "address",
    "role_id",
    "dept_id",
    "designation",
    "salary",
    "date_of_joining",
  ];

  // filter valid fields only
  const fields = Object.keys(updateData).filter((field) =>
    allowedFields.includes(field),
  );

  // if no valid fields provided
  if (fields.length === 0) {
    throw new Error("No valid fields provided");
  }

  // create dynamic SET query
  const setQuery = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  // values array
  const values = fields.map((field) => updateData[field]);

  // add emp_id at last
  values.push(emp_id);

  const { rows } = await pool.query(
    `
    UPDATE ${employeeTable}
    SET ${setQuery}
    WHERE emp_id = $${values.length}
    RETURNING *
    `,
    values,
  );

  return rows[0] || null;
};

const updatePassword = async (emp_id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { rows } = await pool.query(
    `
    UPDATE ${employeeTable}
    SET 
      password = $1,
      must_change_password = false
    WHERE emp_id = $2
    RETURNING emp_id, email
    `,
    [hashedPassword, emp_id],
  );

  return rows[0] || null;
};

module.exports = {
  createTable,
  addEmployee,
  deleteEmployee,
  showAllEmployee,
  getEmployeeById,
  oldEmployee,
  getOldEmployeeById,
  updateEmployee,
  updatePassword,
};
