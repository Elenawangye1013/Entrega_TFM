const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: '', //usuario
    password: '', //contraseña
    database: '', //base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



module.exports = pool;
