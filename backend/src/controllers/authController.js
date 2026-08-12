import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { pool } from '../config/db.js';

// POST /api/auth/login
// body: { telefono, contrasena }
async function login(req, res) {
  const { telefono, contrasena } = req.body;

  if (!telefono || !contrasena) {
    return res.status(400).json({ message: 'Telefono y contrasena son obligatorios' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.telefono, u.correo, u.contrasena,
              u.rol_id, r.rol_nombre
       FROM users u
       INNER JOIN roles r ON u.rol_id = r.rol_id
       WHERE u.telefono = ?
       LIMIT 1`,
      [telefono]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Telefono o contrasena incorrectos' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Telefono o contrasena incorrectos' });
    }

    const payload = {
      id: usuario.id,
      rol: usuario.rol_nombre // 'admin' | 'secretaria' | 'usuario'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    return res.json({
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        correo: usuario.correo,
        rol: usuario.rol_nombre
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// GET /api/auth/me  (requiere token)
async function me(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.telefono, u.correo, r.rol_nombre
       FROM users u
       INNER JOIN roles r ON u.rol_id = r.rol_id
       WHERE u.id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    return res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      correo: usuario.correo,
      rol: usuario.rol_nombre
    });
  } catch (error) {
    console.error('Error en me:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export { login, me };
