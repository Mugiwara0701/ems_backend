const pool = require('../config/db').pool
const config = require('../config/table.config.json')


const leaveRequestTable = config.tables.leave;
const employeeTable = config.tables.employees;

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${leaveRequestTable}(
      leave_id SERIAL PRIMARY KEY,
      emp_id INT REFERENCES ${employeeTable}(emp_id),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

const addLeaveRequest = async (emp_id, start_date, end_date, reason) => {
  const { rows } = await pool.query(`
    INSERT INTO ${leaveRequestTable}(emp_id, start_date, end_date, reason) VALUES($1, $2, $3, $4)
    RETURNING *
    `), [emp_id, start_date, end_date, reason]
  return rows[0] || null;
}

const acceptLeaveRequest = async (leave_id) => {
  const { rows } = await pool.query(`
    UPDATE ${leaveRequestTable} SET status = 'accepted'
    WHERE leave_id = $1
    RETURNING *
    `), [leave_id]
  return rows[0] || null;
}

const rejectLeaveRequest = async (leave_id) => {
  const { rows } = await pool.query(`
    UPDATE ${leaveRequestTable} SET status = 'rejected'
    WHERE leave_id = $1
    RETURNING *
    `), [leave_id]
  return rows[0] || null;
}



module.exports = { createTable, addLeaveRequest, acceptLeaveRequest, rejectLeaveRequest }