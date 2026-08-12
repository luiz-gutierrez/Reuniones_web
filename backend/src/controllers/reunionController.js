import { pool } from '../config/db.js';

// GET /api/reuniones  (admin y secretaria)
async function getReuniones(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
  re.reu_id,
  re.reu_nombre,
  re.reu_descripcion,
  re.reu_lugar,
  re.reu_fecha,
  re.reu_hora,
  re.created_at,
  re.updated_at,
  re.use_id,
  u.nombre AS creado_por_nombre
FROM reuniones re
LEFT JOIN users u ON re.use_id = u.id`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener reuniones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// POST /api/reuniones  (secretaria)
// body: { nombre, descripcion, fecha, hora }
async function crearReunion(req, res) {
  const {
    nombre,
    descripcion,
    lugar,
    fecha,
    hora
  } = req.body;

  if (!nombre || !lugar || !fecha || !hora) {
    return res.status(400).json({
      message: 'Nombre, lugar, fecha y hora son obligatorios'
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO reuniones 
        (reu_nombre, reu_descripcion, reu_lugar, reu_fecha, reu_hora, use_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion || null,
        lugar,
        fecha,
        hora,
        req.user.id
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      message: 'Reunión creada correctamente'
    });

  } catch (error) {
    console.error('Error al crear reunion:', error);

    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
}

export { getReuniones, crearReunion };
