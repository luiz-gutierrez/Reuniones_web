// controllers/userController.js
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

// GET /api/usuarios (solo admin)
async function getUsuarios(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        u.correo,
        u.activo,
        u.created_at,
        u.pue_id,
        p.pue_nombre as puesto,
        d.dep_nombre as departamento,
        r.rol_id,
        r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN departamentos d ON p.dep_id = d.dep_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       ORDER BY u.id DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// GET /api/roles
async function getRoles(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM roles ORDER BY rol_nombre');
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return res.status(500).json({ message: 'Error al obtener roles' });
  }
}

// GET /api/puestos/sin-usuarios
async function getPuestosSinUsuarios(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM users u WHERE u.pue_id = p.pue_id) as usuarios_asignados
       FROM puestos p
       WHERE (SELECT COUNT(*) FROM users u WHERE u.pue_id = p.pue_id) = 0
       ORDER BY p.pue_nombre`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener puestos sin usuarios:', error);
    return res.status(500).json({ message: 'Error al obtener puestos' });
  }
}

// POST /api/usuarios (solo admin)
async function crearUsuario(req, res) {
  console.log('📝 Body recibido:', req.body);
  console.log('👤 Usuario que crea:', req.user);

  const { nombre, apellido, telefono, correo, contrasena, pue_id } = req.body;

  // Validaciones
  if (!nombre || !apellido || !telefono || !correo || !contrasena || !pue_id) {
    console.log('❌ Campos faltantes');
    return res.status(400).json({ 
      message: 'Todos los campos son obligatorios' 
    });
  }

  // Validar formato de teléfono
  if (!/^\d{8,15}$/.test(telefono)) {
    return res.status(400).json({ 
      message: 'El teléfono debe tener entre 8 y 15 dígitos' 
    });
  }

  // Validar formato de correo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ 
      message: 'El correo electrónico no es válido' 
    });
  }

  try {
    // Verificar si el puesto existe
    const [puestoExists] = await pool.query(
      'SELECT pue_id FROM puestos WHERE pue_id = ?',
      [pue_id]
    );
    
    if (puestoExists.length === 0) {
      return res.status(400).json({ 
        message: 'El puesto especificado no existe' 
      });
    }

    // Hashear contrasena
    const hash = await bcrypt.hash(contrasena, 10);

    // Insertar usuario
    const [result] = await pool.query(
      `INSERT INTO users (nombre, apellido, telefono, correo, contrasena, pue_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, telefono, correo, hash, pue_id]
    );

    console.log(`✅ Usuario creado con ID: ${result.insertId}`);
    
    // Obtener el usuario creado con todos sus datos
    const [newUser] = await pool.query(
      `SELECT 
        u.id, u.nombre, u.apellido, u.telefono, u.correo, u.activo,
        p.pue_nombre as puesto,
        r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [result.insertId]
    );
    
    return res.status(201).json({ 
      message: 'Usuario creado correctamente',
      usuario: newUser[0]
    });

  } catch (error) {
    console.error('❌ Error detallado al crear usuario:', error);
    
    // Error de duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      let campo = '';
      if (error.sqlMessage.includes('telefono')) {
        campo = 'teléfono';
      } else if (error.sqlMessage.includes('correo')) {
        campo = 'correo';
      }
      return res.status(409).json({ 
        message: `El ${campo} ya está registrado` 
      });
    }
    
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}

export { 
getUsuarios, 
getRoles,
getPuestosSinUsuarios,
crearUsuario };