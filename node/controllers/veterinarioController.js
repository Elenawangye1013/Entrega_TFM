const pool = require('../config/db');

exports.getVets = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM veterinarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener veterinarinarios", error });
  }
};
