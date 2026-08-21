// controllers/tareaController.js
import { pool } from '../config/db.js';

// ============================================
// POST /api/tareas - Crear múltiples tareas (Secretaria/Admin)
// ============================================
async function crearTareas(req, res) {
  const { tareas } = req.body;
  const userId = req.user.id;

  if (!tareas || !Array.isArray(tareas) || tareas.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere un array de tareas'
    });
  }

  try {
    await pool.query('START TRANSACTION');

    const tareasCreadas = [];
    
    for (const tarea of tareas) {
      const { tar_nombre, tar_descripcion, tar_fecha, use_id, reu_id } = tarea;

      if (!tar_nombre || !tar_fecha || !use_id || !reu_id) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Nombre, fecha, usuario y reunión son obligatorios'
        });
      }

      // ✅ CORREGIDO: Eliminar userId de los valores (solo 5 placeholders)
      const [result] = await pool.query(
        `INSERT INTO tareas (tar_nombre, tar_descripcion, tar_fecha, use_id, reu_id)
         VALUES (?, ?, ?, ?, ?)`,
        [tar_nombre, tar_descripcion || null, tar_fecha, use_id, reu_id]
      );

      tareasCreadas.push({
        id: result.insertId,
        ...tarea
      });
    }

    await pool.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Tareas creadas correctamente',
      tareas: tareasCreadas,
      total: tareasCreadas.length
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error al crear tareas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}

// ============================================
// GET /api/tareas/reunion/:id - Obtener tareas de una reunión (Secretaria/Admin)
// ============================================
async function getTareasByReunion(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        t.tar_id,
        t.tar_nombre,
        t.tar_descripcion,
        t.tar_fecha,
        t.tar_estatus,
        t.tar_prioridad,
        t.use_id,
        t.tar_nota,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.correo as usuario_correo,
        p.pue_nombre as usuario_puesto
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      LEFT JOIN puestos p ON u.pue_id = p.pue_id
      WHERE t.reu_id = ?
      ORDER BY t.tar_fecha ASC`,
      [id]
    );

    return res.json({
      success: true,
      count: rows.length,
      tareas: rows
    });
  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tareas'
    });
  }
}

// ============================================
// PUT /api/tareas/:id - Actualizar todos los campos (Secretaria/Admin)
// ============================================
async function actualizarTarea(req, res) {
  const { id } = req.params;
  const { tar_nombre, tar_descripcion, tar_fecha, use_id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de tarea requerido'
    });
  }

  if (!tar_nombre || !tar_descripcion || !tar_fecha || !use_id) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  try {
    const [tareaExistente] = await pool.query(
      'SELECT tar_id FROM tareas WHERE tar_id = ?',
      [id]
    );

    if (tareaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    const [result] = await pool.query(
      `UPDATE tareas 
       SET tar_nombre = ?, 
           tar_descripcion = ?, 
           tar_fecha = ?, 
           use_id = ?,
           update_at = NOW()
       WHERE tar_id = ?`,
      [tar_nombre, tar_descripcion, tar_fecha, use_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    const [tareaActualizada] = await pool.query(
      `SELECT 
        t.tar_id,
        t.tar_nombre,
        t.tar_descripcion,
        t.tar_fecha,
        t.tar_estatus,
        t.tar_prioridad,
        t.use_id,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      WHERE t.tar_id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Tarea actualizada correctamente',
      tarea: tareaActualizada[0]
    });

  } catch (error) {
    console.error('❌ Error al actualizar tarea:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea',
      error: error.message
    });
  }
}

// ============================================
// DELETE /api/tareas/:id - Eliminar una tarea (Secretaria/Admin)
// ============================================
async function eliminarTarea(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de tarea requerido'
    });
  }

  try {
    const [tarea] = await pool.query(
      'SELECT tar_id FROM tareas WHERE tar_id = ?',
      [id]
    );

    if (tarea.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM tareas WHERE tar_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Tarea eliminada correctamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la tarea',
      error: error.message
    });
  }
}

// ============================================
// GET /api/tareas/usuario/:userId - Tareas de un usuario (Gerente/JefeDepto/Secretaria)
// ============================================
async function getTareasByUsuario(req, res) {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  const rolId = req.user.rol_id;
  const pueId = req.user.pue_id;

  try {
    const [userCheck] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    let tienePermiso = false;

    if (rolId === 1) { // Admin
      tienePermiso = true;
    } else if (parseInt(userId) === parseInt(currentUserId)) {
      tienePermiso = true;
    } else if (rolId === 3) { // Gerente
      const [targetUser] = await pool.query(
        `SELECT u.id, p.pue_id 
         FROM users u
         LEFT JOIN puestos p ON u.pue_id = p.pue_id
         WHERE u.id = ?`,
        [userId]
      );
      
      if (targetUser.length > 0) {
        const [verificar] = await pool.query(
          `SELECT * FROM puestos 
           WHERE pue_id = ? AND pue_padre_id = ?`,
          [targetUser[0].pue_id, pueId]
        );
        
        if (verificar.length > 0) {
          tienePermiso = true;
        }
      }
    } else if (rolId === 4) { // JefeDepto
      if (parseInt(userId) === parseInt(currentUserId)) {
        tienePermiso = true;
      }
    } else if (rolId === 2) { // Secretaria
      // Secretaria puede ver tareas en Revision de cualquier usuario
      tienePermiso = true;
    }

    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver las tareas de este usuario'
      });
    }

    // Obtener las tareas del usuario (solo Iniciar y Proceso)
    const [rows] = await pool.query(
      `SELECT 
        t.tar_id,
        t.tar_nombre,
        t.tar_descripcion,
        t.tar_fecha,
        t.tar_estatus,
        t.tar_prioridad,
        t.tar_nota,
        t.use_id,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.correo as usuario_correo,
        p.pue_nombre as usuario_puesto,
        r.rol_nombre as usuario_rol
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      LEFT JOIN puestos p ON u.pue_id = p.pue_id
      LEFT JOIN roles r ON p.rol_id = r.rol_id
      WHERE t.use_id = ? AND t.tar_estatus IN ('Iniciar', 'Proceso')
      ORDER BY t.tar_fecha DESC, 
               CASE t.tar_prioridad 
                 WHEN 'alta' THEN 1
                 WHEN 'media' THEN 2
                 WHEN 'baja' THEN 3
               END ASC`,
      [userId]
    );

    return res.json({
      success: true,
      count: rows.length,
      tareas: rows
    });

  } catch (error) {
    console.error('❌ Error al obtener tareas del usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tareas del usuario',
      error: error.message
    });
  }
}

// ============================================
// PUT /api/tareas/:id/estado - Actualizar estado
// ============================================
async function actualizarEstadoTarea(req, res) {
  const { id } = req.params;
  const { tar_estatus, tar_nota } = req.body;
  const userId = req.user.id;
  const userRolId = req.user.rol_id;
  const userPueId = req.user.pue_id;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de tarea requerido'
    });
  }
  
  const estatusValidos = ['Iniciar', 'Proceso', 'Prerevision', 'Revision', 'Finalizado'];
  if (!estatusValidos.includes(tar_estatus)) {
    return res.status(400).json({
      success: false,
      message: 'Estado inválido. Debe ser: Iniciar, Proceso, Prerevision, Revisión o Finalizado'
    });
  }
  
  try {
    // Obtener tarea con información del usuario asignado
    const [tareaExistente] = await pool.query(
      `SELECT t.tar_id, t.tar_estatus, t.use_id, t.tar_nota,
              u.pue_id, p.rol_id, p.pue_padre_id,
              u.nombre, u.apellido
       FROM tareas t
       LEFT JOIN users u ON t.use_id = u.id
       LEFT JOIN puestos p ON u.pue_id = p.pue_id
       WHERE t.tar_id = ?`,
      [id]
    );
    
    if (tareaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    const tarea = tareaExistente[0];
    const estadoActual = tarea.tar_estatus;
    
    // ============================================
    // VALIDACIÓN DE PERMISOS SEGÚN EL ROL
    // ============================================
    let tienePermiso = false;
    let mensajePermiso = '';
    
    switch (userRolId) {
      // 1. ADMIN (rol_id: 1) - Puede hacer cualquier cambio
      case 1:
        tienePermiso = true;
        mensajePermiso = 'Administrador autorizado';
        break;
      
      // 2. GERENTE (rol_id: 3)
      case 3:
        // Verificar si el usuario tiene autoridad sobre esta tarea
        const [subordinado] = await pool.query(
          `SELECT * FROM puestos 
           WHERE pue_id = ? AND pue_padre_id = ?`,
          [tarea.pue_id, userPueId]
        );
        
        if (subordinado.length > 0 || tarea.pue_id === userPueId) {
          // ✅ El Gerente puede cambiar a cualquier estado (incluyendo Finalizado)
          tienePermiso = true;
          mensajePermiso = 'Gerente autorizado';
        } else {
          mensajePermiso = 'No tienes autoridad sobre esta tarea';
        }
        break;
      
      // 3. JEFE DEPTO (rol_id: 4)
      case 4:
        if (tarea.use_id === userId) {
          // ✅ El JefeDepto puede cambiar a cualquier estado
          tienePermiso = true;
          mensajePermiso = 'Jefe de Departamento actualizando su tarea';
        } else {
          mensajePermiso = 'Solo puedes actualizar tus propias tareas';
        }
        break;
      
      // 4. SECRETARIA (rol_id: 2)
      case 2:
        // ✅ La Secretaria puede cambiar a cualquier estado
        tienePermiso = true;
        mensajePermiso = 'Secretaria actualizando su tarea';
        break;
      
      default:
        mensajePermiso = 'No tienes permisos para actualizar esta tarea';
    }
    
    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: mensajePermiso,
        estadoActual,
        estadoSolicitado: tar_estatus,
        rol: req.user.rol
      });
    }
    
    // ============================================
    // ACTUALIZAR LA TAREA (SIN VALIDACIÓN DE FLUJO)
    // ============================================
    const [result] = await pool.query(
      `UPDATE tareas 
       SET tar_estatus = ?,
           tar_nota = ?,
           update_at = NOW()
       WHERE tar_id = ?`,
      [tar_estatus, tar_nota || tarea.tar_nota || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se pudo actualizar la tarea'
      });
    }
    
    // ============================================
    // REGISTRAR EN LOG (opcional)
    // ============================================
    try {
      await pool.query(
        `INSERT INTO tareas_log (tar_id, estado_anterior, estado_nuevo, usuario_id, fecha_cambio)
         VALUES (?, ?, ?, ?, NOW())`,
        [id, estadoActual, tar_estatus, userId]
      );
    } catch (logError) {
      console.warn('⚠️ No se pudo registrar el log:', logError.message);
    }
    
    // ============================================
    // OBTENER TAREA ACTUALIZADA
    // ============================================
    const [tareaActualizada] = await pool.query(
      `SELECT 
        t.tar_id,
        t.tar_nombre,
        t.tar_descripcion,
        t.tar_fecha,
        t.tar_estatus,
        t.tar_prioridad,
        t.tar_nota,
        t.use_id,
        t.update_at,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        p.pue_nombre as usuario_puesto,
        r.rol_nombre as usuario_rol,
        d.dep_nombre as departamento_nombre
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      LEFT JOIN puestos p ON u.pue_id = p.pue_id
      LEFT JOIN roles r ON p.rol_id = r.rol_id
      LEFT JOIN departamentos d ON p.dep_id = d.dep_id
      WHERE t.tar_id = ?`,
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: `Estado actualizado de "${estadoActual}" a "${tar_estatus}" correctamente`,
      tarea: tareaActualizada[0],
      cambio: {
        estado_anterior: estadoActual,
        estado_nuevo: tar_estatus,
        realizado_por: req.user.rol,
        usuario: `${req.user.nombre} ${req.user.apellido}`
      }
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de la tarea',
      error: error.message
    });
  }
}
// ============================================
// GET /api/tareas/usuario/:userId/todas - Todas las tareas del usuario (Gerente/JefeDepto/Secretaria)
// ============================================
async function getTareasByUsuarioAll(req, res) {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  const rolId = req.user.rol_id;
  const pueId = req.user.pue_id;
  
  try {
    const [userCheck] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    let tienePermiso = false;
    
    if (rolId === 1) { // Admin
      tienePermiso = true;
    } else if (parseInt(userId) === parseInt(currentUserId)) {
      tienePermiso = true;
    } else if (rolId === 3) { // Gerente
      const [targetUser] = await pool.query(
        `SELECT u.id, p.pue_id 
         FROM users u
         LEFT JOIN puestos p ON u.pue_id = p.pue_id
         WHERE u.id = ?`,
        [userId]
      );
      
      if (targetUser.length > 0) {
        const [verificar] = await pool.query(
          `SELECT * FROM puestos 
           WHERE pue_id = ? AND pue_padre_id = ?`,
          [targetUser[0].pue_id, pueId]
        );
        
        if (verificar.length > 0) {
          tienePermiso = true;
        }
      }
    } else if (rolId === 4) { // JefeDepto
      if (parseInt(userId) === parseInt(currentUserId)) {
        tienePermiso = true;
      }
    } else if (rolId === 2) { // Secretaria
      // Secretaria puede ver todas las tareas de cualquier usuario
      tienePermiso = true;
    }
    
    if (!tienePermiso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver las tareas de este usuario'
      });
    }
    
    // Obtener TODAS las tareas del usuario (todos los estados)
    const [rows] = await pool.query(
      `SELECT 
        t.tar_id,
        t.tar_nombre,
        t.tar_descripcion,
        t.tar_fecha,
        t.tar_estatus,
        t.tar_prioridad,
        t.tar_nota,
        t.use_id,
        t.update_at,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.correo as usuario_correo,
        p.pue_nombre as usuario_puesto,
        d.dep_nombre as departamento_nombre,
        r.rol_nombre as usuario_rol
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      LEFT JOIN puestos p ON u.pue_id = p.pue_id
      LEFT JOIN departamentos d ON p.dep_id = d.dep_id
      LEFT JOIN roles r ON p.rol_id = r.rol_id
      WHERE t.use_id = ?
      ORDER BY 
        CASE t.tar_estatus
          WHEN 'Iniciar' THEN 1
          WHEN 'Proceso' THEN 2
          WHEN 'Prerevision' THEN 3
          WHEN 'Revision' THEN 4
          WHEN 'Finalizado' THEN 5
        END,
        t.tar_prioridad DESC,
        t.tar_fecha ASC`,
      [userId]
    );
    
    return res.json({
      success: true,
      count: rows.length,
      tareas: rows
    });
  } catch (error) {
    console.error('❌ Error al obtener todas las tareas del usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener todas las tareas del usuario',
      error: error.message
    });
  }
}

// ============================================
// GET /api/tareas/ - Obtener todas las tareas (Admin/Secretaria/Gerente)
// ============================================
async function getTareasAll(req, res) {
  try {
    console.log('📋 Obteniendo todas las tareas...');
    
    const userId = req.user.id;
    const rolId = req.user.rol_id;
    const pueId = req.user.pue_id;

    let filtroAdicional = '';
    let params = [];
    
    // ADMIN (rol_id: 1) - Ver todas las tareas
    if (rolId === 1) {
      console.log('👑 Administrador - Ver todas las tareas');
    }
    // GERENTE (rol_id: 3) - Ver tareas de sus Jefes de Departamento
    else if (rolId === 3) {
      console.log('👔 Gerente - Filtrando por subordinados');
      const [puestosHijos] = await pool.query(
        `SELECT pue_id FROM puestos WHERE pue_padre_id = ?`,
        [pueId]
      );
      
      const puestosIds = puestosHijos.map(p => p.pue_id);
      
      if (puestosIds.length > 0) {
        filtroAdicional = `WHERE (p.pue_id = ? OR p.pue_id IN (?))`;
        params = [pueId, puestosIds];
      } else {
        filtroAdicional = `WHERE p.pue_id = ?`;
        params = [pueId];
      }
    }
    // SECRETARIA (rol_id: 2) - Ver tareas en estado "Revision"
    else if (rolId === 2) {
      console.log('📝 Secretaria - Ver tareas en Revision');
      filtroAdicional = `WHERE t.tar_estatus = 'Revision'`;
      params = [];
    }
    // JEFE DEPTO (rol_id: 4) - Ver solo sus tareas
    else if (rolId === 4) {
      console.log('📋 JefeDepto - Ver solo sus tareas');
      filtroAdicional = `WHERE p.pue_id = ?`;
      params = [pueId];
    }
    // OTROS ROLES
    else {
      console.log('👤 Otro rol - Ver solo sus tareas');
      filtroAdicional = `WHERE p.pue_id = ?`;
      params = [pueId];
    }

    let query = `
      SELECT 
        t.tar_id,
        t.tar_nombre,
        t.tar_descripcion,
        t.tar_estatus,
        t.tar_prioridad,
        t.tar_nota,
        t.tar_fecha,
        t.use_id,
        t.reu_id,
        t.created_at,
        t.update_at,
        -- Información del usuario asignado
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.telefono as usuario_telefono,
        u.correo as usuario_correo,
        -- Información del puesto del usuario
        p.pue_nombre as usuario_puesto,
        p.pue_id as puesto_id,
        p.pue_padre_id as puesto_padre_id,
        -- Información del rol
        r.rol_nombre as usuario_rol,
        -- Información del departamento
        d.dep_id as departamento_id,
        d.dep_nombre as departamento_nombre,
        -- Información de la reunión
        re.reu_nombre as reunion_titulo,
        re.reu_descripcion as reunion_descripcion,
        re.reu_fecha as reunion_fecha
      FROM tareas t
      LEFT JOIN users u ON t.use_id = u.id
      LEFT JOIN puestos p ON u.pue_id = p.pue_id
      LEFT JOIN roles r ON p.rol_id = r.rol_id
      LEFT JOIN departamentos d ON p.dep_id = d.dep_id
      LEFT JOIN reuniones re ON t.reu_id = re.reu_id
      ${filtroAdicional}
      ORDER BY 
        CASE t.tar_estatus
          WHEN 'Iniciar' THEN 1
          WHEN 'Proceso' THEN 2
          WHEN 'Prerevision' THEN 3
          WHEN 'Revision' THEN 4
          WHEN 'Finalizado' THEN 5
        END,
        t.tar_prioridad DESC,
        t.tar_fecha ASC
    `;

    console.log('🔍 Query:', query);
    console.log('📝 Parámetros:', params);

    const [rows] = await pool.query(query, params);
    
    console.log(`✅ Tareas encontradas: ${rows.length}`);

    const permisos = {
      puedeEditar: [1, 3, 4].includes(rolId),
      puedeCambiarEstado: [1, 2, 3, 4].includes(rolId),
      puedeEliminar: [1, 2].includes(rolId),
      puedeAsignar: [1, 3].includes(rolId),
      puedeCrear: [1, 2].includes(rolId),
      puedeVerTodo: rolId === 1,
      rolActual: req.user.rol
    };

    return res.status(200).json({
      success: true,
      count: rows.length,
      tareas: rows,
      usuario: {
        id: userId,
        pue_id: pueId,
        rol_id: rolId,
        rol_nombre: req.user.rol
      },
      permisos: permisos
    });

  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener las tareas',
      error: error.message
    });
  }
}

// ============================================
// EXPORTAR
// ============================================
export {
  crearTareas,
  getTareasByReunion,
  actualizarTarea,
  eliminarTarea,
  getTareasByUsuario,
  actualizarEstadoTarea,
  getTareasByUsuarioAll,
  getTareasAll
};