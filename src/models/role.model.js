const pool = require("../config/db");
const config = require("../config/table.config.json");

const roleTable = config.tables.role;

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${roleTable} (
    role_id SERIAL PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
    )`);
};

const addRole = async (role_name) => {
  const { rows } = await pool.query(
    `
    INSERT INTO ${roleTable} 
    (role_name) 
    VALUES ($1) 
    RETURNING *`,
    [role_name],
  );
  return rows[0] || null;
};

const deleteRole = async (role_id) => {
  const { rows } = await pool.query(
    `
    DELETE FROM ${roleTable}
    WHERE role_id = $1
    RETURNING *`,
    [role_id],
  );
  return rows[0] || null;
};

const updateRole = async (role_id, role_name) => {
  const { rows } = await pool.query(
    `
    UPDATE ${roleTable}
    SET role_name = $2
    WHERE role_id = $1
    `,
    [role_id, role_name],
  );
};

const getAllRoles = async () => {
  const { rows } = await pool.query(`
    SELECT * FROM ${roleTable}`);
  return rows || [];
};

module.exports = { createTable, addRole, deleteRole, getAllRoles, updateRole };
