const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise'); 
const saltRounds = 10;

const pool = mysql.createPool({
  host: 'localhost',
  user: '', //usuario
  password: '', //contraseña
  database: '', //base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

async function updatePasswords() {
  const connection = await pool.getConnection();
  try {
    console.log('Connected to MySQL server');

    const [rows] = await connection.query('SELECT * FROM clientes');
    
    for (const row of rows) {
      const hashedPassword = await hashPassword(row.contrasena);
      
      await connection.query('UPDATE clientes SET contrasena = ? WHERE email = ?', [hashedPassword, row.email]);
      console.log(`Password hashed and updated for user ${row.email}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    pool.end();
  }
}

updatePasswords();
