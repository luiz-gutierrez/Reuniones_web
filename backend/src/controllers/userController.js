import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

// GET /api/usuarios  (solo admin)
async function getUsuarios(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.telefono, u.correo,
              u.created_at, r.rol_nombre

       FROM users u
       INNER JOIN roles r ON u.rol_id = r.rol_id
       ORDER BY u.id DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// POST /api/usuarios  (solo admin)
// body: { nombre, apellido, telefono, correo, contrasena, rol_id }
async function crearUsuario(req, res) {
  const { nombre, apellido, telefono, correo, contrasena, rol_id } = req.body;

  if (!nombre || !apellido || !telefono || !correo || !contrasena || !rol_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    const [result] = await pool.query(
      `INSERT INTO users (nombre, apellido, telefono, correo, contrasena, rol_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, telefono, correo, hash, rol_id]
    );

    return res.status(201).json({ id: result.insertId, message: 'Usuario creado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El telefono ya esta registrado' });
    }
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export { getUsuarios, crearUsuario };
