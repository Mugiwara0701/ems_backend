const pool = require('../config/db').pool
const config = require('../config/table.config.json')

const departmentTable = config.tables.departments;

const CreateTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${departmentTable}(
    dept_id SERIAL PRIMARY KEY,
    dept_name Text NOT NULL UNIQUE
    )
    `)
}

const addDepartment = async (dept_name) => {
  const { rows } = await pool.query(`
    INSERT INTO ${departmentTable}(dept_name)VALUES($1)
    RETURNING *
    `), [dept_name]
  return rows[0] || null;
}

const deleteDepartment = async (dept_id) => {
  const { rows } = await pool.query(`
    DELETE FROM ${departmentTable} WHERE dept_id=$1
    RETURNING *
    `), [dept_id]
  return rows[0] || null;
}

const getAllDepartments = async () => {
  const { rows } = await pool.query(`
    SELECT * FROM ${departmentTable} 
    `)
  return rows;
}



module.exports = { CreateTable, addDepartment, deleteDepartment, getAllDepartments }