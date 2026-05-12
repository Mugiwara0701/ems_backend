const pool = require('../config/db')
const config = require('../config/table.config.json')

const attendanceTable = config.tables.attendance;
const employeeTable = config.tables.employees;

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${attendanceTable}(
    attendance_id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES ${employeeTable}(emp_id),
    date DATE NOT NULL,
    check_in TIME ,
    check_out TIME ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(emp_id, check_in)
    )
  }`)
}

const addCheckIn = async (emp_id, date, check_in) => {
  const { rows } = await pool.query(`
    INSERT INTO ${attendanceTable}(emp_id, date, check_in) VALUES($1, $2, $3)
    RETURNING *
    `, [emp_id, date, check_in])
  return rows[0] || null;
}

const addCheckOut = async (emp_id, date, check_out) => {
  const { rows } = await pool.query(`
    UPDATE ${attendanceTable} SET check_out = $3
    WHERE emp_id = $1 AND date = $2
    RETURNING *
    `), [emp_id, date, check_out]
  return rows[0] || null;
}

const getAttendanceByEmpId = async (emp_id) => {
  const { rows } = await pool.query(`
    SELECT 
    a.*,
    e.name AS emp_name,
    a.date AS attendance_date,
    a.check_in AS attendance_check_in,
    a.check_out AS attendance_check_out
    FROM ${attendanceTable} a
    JOIN ${employeeTable} e
    on a.emp_id = e.emp_id
    WHERE a.emp_id = $1
    ORDER BY a.date DESC
    `), [emp_id]
  return rows;
}


module.exports = { createTable, addCheckIn, addCheckOut, getAttendanceByEmpId }