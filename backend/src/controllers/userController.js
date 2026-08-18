// controllers/userController.js
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

// ============================================
// FUNCIONES DEL CONTROLADOR (sin 'export' al inicio)
// ============================================

// GET /api/usuarios (solo admin)
async function getUsuarios(req, res) {
  try {
    console.log('📋 Obteniendo usuarios...');
    
    const [rows] = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        u.correo,
        u.activo,
        u.pue_id,
        u.created_at,
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
    
    console.log(`✅ Usuarios encontrados: ${rows.length}`);
    return res.json(rows);
    
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
}

// GET /api/usuarios/:id
async function getUsuarioById(req, res) {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        u.correo,
        u.activo,
        u.pue_id,
        u.created_at,
        p.pue_nombre as puesto,
        d.dep_nombre as departamento,
        r.rol_id,
        r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN departamentos d ON p.dep_id = d.dep_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    return res.json(rows[0]);
    
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
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
  try {
    const { nombre, apellido, telefono, correo, contrasena, pue_id } = req.body;
    
    // Validar que todos los campos estén presentes
    if (!nombre || !apellido || !telefono || !correo || !contrasena || !pue_id) {
      return res.status(400).json({ 
        message: 'Todos los campos son obligatorios' 
      });
    }
    
    // Verificar si el correo ya existe
    const [existeCorreo] = await pool.query(
      'SELECT id FROM users WHERE correo = ?',
      [correo]
    );
    
    if (existeCorreo.length > 0) {
      return res.status(400).json({ 
        message: 'El correo ya está registrado' 
      });
    }
    
    // Verificar si el puesto existe y no tiene usuario asignado
    const [puesto] = await pool.query(
      `SELECT pue_id, 
        (SELECT COUNT(*) FROM users WHERE pue_id = p.pue_id) as usuarios_asignados
       FROM puestos p WHERE p.pue_id = ?`,
      [pue_id]
    );
    
    if (puesto.length === 0) {
      return res.status(400).json({ 
        message: 'El puesto no existe' 
      });
    }
    
    if (puesto[0].usuarios_asignados > 0) {
      return res.status(400).json({ 
        message: 'Este puesto ya tiene un usuario asignado' 
      });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    // Insertar usuario
    const [result] = await pool.query(
      `INSERT INTO users 
       (nombre, apellido, telefono, correo, contrasena, pue_id, activo) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nombre, apellido, telefono, correo, hashedPassword, pue_id]
    );
    
    console.log(`✅ Usuario creado con ID: ${result.insertId}`);
    
    // Obtener el usuario creado con todos sus datos
    const [newUser] = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        u.correo,
        u.activo,
        u.created_at,
        p.pue_nombre as puesto,
        d.dep_nombre as departamento,
        r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN departamentos d ON p.dep_id = d.dep_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [result.insertId]
    );
    
    return res.status(201).json(newUser[0]);
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
}

// PUT /api/usuarios/:id
async function editarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, correo, contrasena, pue_id, activo } = req.body;
    
    // Verificar que el usuario existe
    const [usuarioExistente] = await pool.query(
      'SELECT id, pue_id FROM users WHERE id = ?',
      [id]
    );
    
    if (usuarioExistente.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el correo ya existe (excepto el del usuario actual)
    if (correo) {
      const [existeCorreo] = await pool.query(
        'SELECT id FROM users WHERE correo = ? AND id != ?',
        [correo, id]
      );
      
      if (existeCorreo.length > 0) {
        return res.status(400).json({ 
          message: 'El correo ya está registrado por otro usuario' 
        });
      }
    }
    
    // Verificar si el puesto existe y no tiene usuario asignado
    if (pue_id) {
      const [puesto] = await pool.query(
        `SELECT pue_id, 
          (SELECT COUNT(*) FROM users WHERE pue_id = p.pue_id AND id != ?) as usuarios_asignados
         FROM puestos p WHERE p.pue_id = ?`,
        [id, pue_id]
      );
      
      if (puesto.length === 0) {
        return res.status(400).json({ 
          message: 'El puesto no existe' 
        });
      }
      
      if (puesto[0].usuarios_asignados > 0) {
        return res.status(400).json({ 
          message: 'Este puesto ya tiene un usuario asignado' 
        });
      }
    }
    
    // Construir la consulta de actualización dinámicamente
    let updateFields = [];
    let values = [];
    
    if (nombre) {
      updateFields.push('nombre = ?');
      values.push(nombre);
    }
    
    if (apellido) {
      updateFields.push('apellido = ?');
      values.push(apellido);
    }
    
    if (telefono) {
      updateFields.push('telefono = ?');
      values.push(telefono);
    }
    
    if (correo) {
      updateFields.push('correo = ?');
      values.push(correo);
    }
    
    if (contrasena) {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      updateFields.push('contrasena = ?');
      values.push(hashedPassword);
    }
    
    if (pue_id) {
      updateFields.push('pue_id = ?');
      values.push(pue_id);
    }
    
    if (activo !== undefined && activo !== null) {
      updateFields.push('activo = ?');
      values.push(activo);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        message: 'No hay campos para actualizar' 
      });
    }
    
    // Agregar el ID al final de los valores
    values.push(id);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
    
    console.log(`✅ Usuario ${id} actualizado`);
    
    // Obtener el usuario actualizado
    const [updatedUser] = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        u.correo,
        u.activo,
        u.pue_id,
        u.created_at,
        p.pue_nombre as puesto,
        d.dep_nombre as departamento,
        r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN departamentos d ON p.dep_id = d.dep_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [id]
    );
    
    return res.json(updatedUser[0]);
    
  } catch (error) {
    console.error('❌ Error al editar usuario:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
}

// DELETE /api/usuarios/:id (soft delete - desactivar)
async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const [usuarioExistente] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (usuarioExistente.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que no sea el último administrador
    const [rolAdmin] = await pool.query(
      `SELECT COUNT(*) as total_admin 
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE r.rol_nombre = 'Admin' AND u.activo = 1`
    );
    
    const [usuarioRol] = await pool.query(
      `SELECT r.rol_nombre 
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [id]
    );
    
    if (usuarioRol.length > 0 && usuarioRol[0].rol_nombre === 'Admin' && rolAdmin[0].total_admin <= 1) {
      return res.status(400).json({ 
        message: 'No se puede eliminar al único administrador del sistema' 
      });
    }
    
    // Soft delete (desactivar)
    await pool.query(
      'UPDATE users SET activo = 0 WHERE id = ?',
      [id]
    );
    
    console.log(`✅ Usuario ${id} desactivado`);
    
    return res.json({ 
      message: 'Usuario desactivado exitosamente',
      usuarioId: id
    });
    
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
}

// DELETE /api/usuarios/:id/permanente (hard delete)
async function eliminarUsuarioPermanente(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const [usuarioExistente] = await pool.query(
      'SELECT id, pue_id FROM users WHERE id = ?',
      [id]
    );
    
    if (usuarioExistente.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que no sea el último administrador
    const [rolAdmin] = await pool.query(
      `SELECT COUNT(*) as total_admin 
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE r.rol_nombre = 'Admin' AND u.activo = 1`
    );
    
    const [usuarioRol] = await pool.query(
      `SELECT r.rol_nombre 
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [id]
    );
    
    if (usuarioRol.length > 0 && usuarioRol[0].rol_nombre === 'Admin' && rolAdmin[0].total_admin <= 1) {
      return res.status(400).json({ 
        message: 'No se puede eliminar al único administrador del sistema' 
      });
    }
    
    // Eliminar el usuario permanentemente
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    console.log(`✅ Usuario ${id} eliminado permanentemente`);
    
    return res.json({ 
      message: 'Usuario eliminado permanentemente',
      usuarioId: id
    });
    
  } catch (error) {
    console.error('❌ Error al eliminar usuario permanentemente:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
}

// PUT /api/usuarios/:id/reactivar
async function reactivarUsuario(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const [usuarioExistente] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (usuarioExistente.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Reactivar usuario
    await pool.query(
      'UPDATE users SET activo = 1 WHERE id = ?',
      [id]
    );
    
    console.log(`✅ Usuario ${id} reactivado`);
    
    // Obtener el usuario reactivado
    const [reactivatedUser] = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.telefono, 
        u.correo,
        u.activo,
        u.created_at,
        p.pue_nombre as puesto,
        d.dep_nombre as departamento,
        r.rol_nombre as rol
       FROM users u
       INNER JOIN puestos p ON u.pue_id = p.pue_id
       INNER JOIN departamentos d ON p.dep_id = d.dep_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       WHERE u.id = ?`,
      [id]
    );
    
    return res.json({
      message: 'Usuario reactivado exitosamente',
      usuario: reactivatedUser[0]
    });
    
  } catch (error) {
    console.error('❌ Error al reactivar usuario:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
}

// ============================================
// EXPORTACIÓN ÚNICA AL FINAL
// ============================================
export {
  getUsuarios,
  getUsuarioById,
  getRoles,
  getPuestosSinUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  eliminarUsuarioPermanente,
  reactivarUsuario
};