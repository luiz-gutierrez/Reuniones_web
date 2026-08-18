// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import 'dotenv/config';

async function login(req, res) {
  const { telefono, contrasena } = req.body;

  if (!telefono || !contrasena) {
    return res.status(400).json({ message: 'Teléfono y contraseña son obligatorios' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.telefono, u.correo, u.contrasena, u.activo,
              p.pue_id, r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.telefono = ?
       LIMIT 1`,
      [telefono]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Teléfono o contraseña incorrectos' });
    }

    const usuario = rows[0];

    // ✅ VERIFICAR SI EL USUARIO ESTÁ ACTIVO
    if (usuario.activo === 0) {
      return res.status(403).json({ 
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' 
      });
    }

    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Teléfono o contraseña incorrectos' });
    }

    const payload = {
      id: usuario.id,
      rol: usuario.rol
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    const { contrasena: _contrasena, ...usuarioSinPassword } = usuario;

    return res.json({
      token,
      user: {
        ...usuarioSinPassword,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export { login };