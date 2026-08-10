import { pool } from '../config/db.js';

// GET /api/reuniones  (admin y secretaria)
async function getReuniones(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT re.id, re.titulo, re.descripcion, re.fecha, re.hora,
              re.creado_por, u.nombre AS creado_por_nombre
       FROM reuniones re
       LEFT JOIN users u ON re.creado_por = u.id
       ORDER BY re.fecha DESC, re.hora DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener reuniones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// POST /api/reuniones  (secretaria)
// body: { titulo, descripcion, fecha, hora }
async function crearReunion(req, res) {
  const { titulo, descripcion, fecha, hora } = req.body;

  if (!titulo || !fecha || !hora) {
    return res.status(400).json({ message: 'Titulo, fecha y hora son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO reuniones (titulo, descripcion, fecha, hora, creado_por)
       VALUES (?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, fecha, hora, req.user.id]
    );
    return res.status(201).json({ id: result.insertId, message: 'Reunion creada correctamente' });
  } catch (error) {
    console.error('Error al crear reunion:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export { getReuniones, crearReunion };
