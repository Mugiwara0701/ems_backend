const Pool = require('pg')


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost")
    ? false
    : process.env.DB_SSL === "false"
      ? false
      : { rejectUnauthorized: false },
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
})

const connectDB = async () => {
  const client = await pool.connect();
  await client.query(`SELECT NOW()`)
  client.release();
  console.log(`✅ Database Connected Successfully`);
}


module.exports = { pool, connectDB }