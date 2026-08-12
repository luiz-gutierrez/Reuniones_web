// middlewares/auth.js
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { pool } from '../config/db.js';

// Verifica que el request traiga un token JWT valido en el header:
// Authorization: Bearer <token>
async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  console.log('🔑 Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);
    
    // Obtener información completa del usuario desde la base de datos
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.telefono, u.correo, u.activo,
              r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Agregar toda la información del usuario a req.user
    req.user = rows[0];
    console.log('👤 Usuario autenticado:', req.user);
    
    next();
  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export default verifyToken;