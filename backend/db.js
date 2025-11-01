const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'prabhat@123', // Update with your MySQL password
  database: 'jewellery_db',
  connectionLimit: 10
});

module.exports = pool;
