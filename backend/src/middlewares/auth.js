// middlewares/auth.js
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { pool } from '../config/db.js';

async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  console.log('🔑 Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Token no proporcionado' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);
    
    // ✅ CORREGIDO: Obtener información completa del usuario
    const [rows] = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        u.correo, 
        u.activo,
        u.pue_id,
        p.rol_id,
        p.pue_padre_id,
        p.pue_nombre as puesto,
        r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // ✅ Asignar TODOS los campos a req.user
    req.user = {
      id: rows[0].id,
      nombre: rows[0].nombre,
      apellido: rows[0].apellido,
      telefono: rows[0].telefono,
      correo: rows[0].correo,
      activo: rows[0].activo,
      pue_id: rows[0].pue_id,
      rol_id: rows[0].rol_id,
      pue_padre_id: rows[0].pue_padre_id,
      puesto: rows[0].puesto,
      rol: rows[0].rol // ✅ IMPORTANTE: el campo 'rol' debe existir
    };

    console.log('👤 Usuario autenticado:', {
      id: req.user.id,
      nombre: req.user.nombre,
      rol: req.user.rol,
      rol_id: req.user.rol_id,
      pue_id: req.user.pue_id
    });
    
    next();
  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    return res.status(401).json({ 
      success: false,
      message: 'Token inválido o expirado' 
    });
  }
}

export default verifyToken;