const mysql = require('mysql');
const util = require('util');

// Create a pool of connections
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'jintu',
  database: 'FEDER'
});

// Promisify the pool query method
pool.query = util.promisify(pool.query);

// Event listener for new connection
pool.on('connection', (connection) => {
  console.log('Database connection established with ID:', connection.threadId);
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
  connection.release(); // Return the connection to the pool
});

module.exports = pool;
