const pool = require('../config/db');

exports.addPet = async (req, res) => {
  const { nombre_mascota, raza_mascota, tipo_animal, edad, sexo, email } = req.body;

  try {
    const [clientResult] = await pool.query('SELECT id_cliente, tipo_plan FROM clientes WHERE email = ?', [email]);

    if (clientResult.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const id_cliente = clientResult[0].id_cliente;
    const tipo_plan = clientResult[0].tipo_plan;

    if (tipo_plan === 'basico') {
      const [petCountResult] = await pool.query('SELECT COUNT(*) as petCount FROM mascotas WHERE id_cliente = ?', [id_cliente]);

      if (petCountResult[0].petCount >= 1) {
        return res.status(403).json({ message: 'El plan básico solo permite añadir una mascota.' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO mascotas (id_cliente, nombre_mascota, raza_mascota, tipo_animal, edad, sexo) VALUES (?, ?, ?, ?, ?, ?)',
      [id_cliente, nombre_mascota, raza_mascota, tipo_animal, edad, sexo]
    );

    res.status(201).json({ message: 'Mascota añadida correctamente', id_mascota: result.insertId });
  } catch (error) {
    console.error('Error añadiendo mascota:', error);
    res.status(500).json({ message: 'Error añadiendo mascota', error: error.message });
  }
};

exports.deletePet = async (req, res) => {
    const { id_mascota } = req.params;
  
    try {
      const [result] = await pool.query('DELETE FROM mascotas WHERE id_mascota = ?', [id_mascota]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Mascota no encontrada' });
      }
  
      res.status(200).json({ message: 'Mascota eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar:', error);
      res.status(500).json({ message: 'Error al eliminar', error: error.message });
    }
  };

  exports.updatePet = async (req, res) => {
    const { id_mascota } = req.params;
    const { nombre_mascota, raza_mascota, tipo_animal, edad, sexo } = req.body;
  
    try {
      const [result] = await pool.query(
        'UPDATE mascotas SET nombre_mascota = ?, raza_mascota = ?, tipo_animal = ?, edad = ?, sexo = ? WHERE id_mascota = ?',
        [nombre_mascota, raza_mascota, tipo_animal, edad, sexo, id_mascota]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Mascota no encontrada' });
      }
  
      res.status(200).json({ message: 'Mascota actualizada correctamente' });
    } catch (error) {
      console.error('Error actualizando mascota:', error);
      res.status(500).json({ message: 'Error actualizando mascota', error: error.message });
    }
  };
  