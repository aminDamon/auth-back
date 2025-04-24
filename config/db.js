const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'node_auth',
  password: process.env.DB_PASS || 'amin.hadi1382', // رمز واقعی اینجا قرار دهید
  port: process.env.DB_PORT || 5432,
  ssl: false, // برای توسعه غیرفعال کنید
});

// تست اتصال
pool.query('SELECT NOW()', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Database connected successfully');
});

module.exports = { pool };