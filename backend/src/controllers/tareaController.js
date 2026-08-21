// controllers/tareaController.js
import { pool } from '../config/db.js';

// POST /api/tareas - Crear múltiples tareas (Secretaria)
async function crearTareas(req, res) {
  const { tareas } = req.body;

  if (!tareas || !Array.isArray(tareas) || tareas.length === 0) {
    return res.status(400).json({
      message: 'Se requiere un array de tareas'
    });
  }

  try {
    // Iniciar transacción
    await pool.query('START TRANSACTION');

    const tareasCreadas = [];
    
    for (const tarea of tareas) {
      const { tar_nombre, tar_descripcion, tar_fecha, use_id, reu_id } = tarea;

      // Validar campos obligatorios
      if (!tar_nombre || !tar_fecha || !use_id || !reu_id) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          message: 'Nombre, fecha, usuario y reunión son obligatorios'
        });
      }

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
      message: 'Tareas creadas correctamente',
      tareas: tareasCreadas,
      total: tareasCreadas.length
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error al crear tareas:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}

// GET /api/tareas/reunion/:id - Obtener tareas de una reunión(Secretaria)
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
        t.use_id,
        t.tar_nota,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.correo as usuario_correo
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      WHERE t.reu_id = ?
      ORDER BY t.tar_fecha ASC`,
      [id]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return res.status(500).json({
      message: 'Error al obtener tareas'
    });
  }
}

// PUT /api/tareas/:id - Actualizar todos los campos de una tarea(Secretaria)
async function actualizarTarea(req, res) {
  const { id } = req.params;
  const { tar_nombre, tar_descripcion, tar_fecha, use_id } = req.body;

  if (!id) {
    return res.status(400).json({
      message: 'ID de tarea requerido'
    });
  }

  // Validaciones básicas
  if (!tar_nombre || !tar_descripcion || !tar_fecha || !use_id) {
    return res.status(400).json({
      message: 'Todos los campos son requeridos'
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE tareas 
       SET tar_nombre = ?, 
           tar_descripcion = ?, 
           tar_fecha = ?, 
           use_id = ?
       WHERE tar_id = ?`,
      [tar_nombre, tar_descripcion, tar_fecha, use_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Tarea no encontrada'
      });
    }

    return res.json({
      message: 'Tarea actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return res.status(500).json({
      message: 'Error al actualizar tarea'
    });
  }
}
// DELETE /api/tareas/:id - Eliminar una tarea(Secretaria)
async function eliminarTarea(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: 'ID de tarea requerido'
    });
  }

  try {
    // Primero verificamos si la tarea existe
    const [tarea] = await pool.query(
      'SELECT tar_id FROM tareas WHERE tar_id = ?',
      [id]
    );

    if (tarea.length === 0) {
      return res.status(404).json({
        message: 'Tarea no encontrada'
      });
    }

    // Eliminar la tarea
    const [result] = await pool.query(
      'DELETE FROM tareas WHERE tar_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Tarea no encontrada'
      });
    }

    return res.json({
      message: 'Tarea eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return res.status(500).json({
      message: 'Error al eliminar la tarea'
    });
  }
}

// GET /api/tareas/usuario/:userId - Obtener tareas de un usuario específico(Todos)
async function getTareasByUsuario(req, res) {
  const { userId } = req.params;

  try {
    // Primero, verifica que el usuario existe
    const [userCheck] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Obtener las tareas del usuario
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
        u.correo as usuario_correo
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      WHERE t.use_id = ?
      ORDER BY t.tar_fecha DESC, 
               CASE t.tar_prioridad 
                 WHEN 'alta' THEN 1
                 WHEN 'media' THEN 2
                 WHEN 'baja' THEN 3
               END ASC`,
      [userId]
    );

    return res.json(rows);

  } catch (error) {
    console.error('❌ Error al obtener tareas del usuario:', error);
    // Envía más detalles del error para depurar
    return res.status(500).json({
      message: 'Error al obtener tareas del usuario',
      error: error.message,
      sql: error.sql // Solo para depuración
    });
  }
}

// GET /api/tareas/ (Gerente, JefeDepto)
async function actualizarEstadoTarea(req, res) {
  const { id } = req.params;
  const { tar_estatus, tar_nota } = req.body;
  // Validar que el ID existe
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de tarea requerido'
    });
  }

  // ✅ Actualizar los estados válidos 
  const estatusValidos = ['Iniciar', 'Proceso', 'Prerevision', 'Revision', 'Finalizado'];
  if (!estatusValidos.includes(tar_estatus)) {
    return res.status(400).json({
      success: false,
      message: 'Estado inválido. Debe ser: Iniciar, Proceso, Prerevision, Revisión o Finalizado'
    });
  }

  try {
    // Verificar que la tarea existe
    const [tareaExistente] = await pool.query(
      'SELECT tar_id, tar_estatus FROM tareas WHERE tar_id = ?',
      [id]
    );

    if (tareaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // ✅ Corregir: pasar 3 valores para 3 placeholders
    const [result] = await pool.query(
      `UPDATE tareas 
       SET tar_estatus = ?,
           tar_nota = ?
       WHERE tar_id = ?`,
      [tar_estatus, tar_nota || null, id] // ✅ 3 valores para 3 placeholders
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se pudo actualizar la tarea'
      });
    }

    // Obtener la tarea actualizada
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
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
      WHERE t.tar_id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Estado actualizado a "${tar_estatus}" correctamente`,
      tarea: tareaActualizada[0]
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

// GET /api/tareas/usuario/:userId/todas - Obtener TODAS las tareas del usuario (Admin)
async function getTareasByUsuarioAll(req, res) {
  const { userId } = req.params;
  try {
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
        u.correo as usuario_correo
      FROM tareas t
      INNER JOIN users u ON t.use_id = u.id
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

    return res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener todas las tareas del usuario:', error);
    return res.status(500).json({
      message: 'Error al obtener todas las tareas del usuario',
      error: error.message
    });
  }
}

// Obtener todas las tareas con información relacionada
async function getTareasAll(req, res) {
  try {
    console.log('📋 Obteniendo todas las tareas...');

    const [rows] = await pool.query(
      `SELECT 
        t.tar_id,
        t.tar_nombre,
        t.tar_descripcion,
        t.tar_estatus,
        t.tar_prioridad,
        t.tar_nota,
        t.tar_fecha,
        t.use_id,
        t.reu_id,
        -- Información del usuario asignado
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.telefono as usuario_telefono,
        u.correo as usuario_correo,
        -- Información del puesto del usuario
        p.pue_nombre as usuario_puesto,
        -- Información del departamento del usuario
        d.dep_id as departamento_id,
        d.dep_nombre as departamento_nombre,
        -- Información de la reunión
        re.reu_nombre as reunion_titulo,
        re.reu_descripcion as reunion_descripcion,
        re.reu_fecha as reunion_fecha
      FROM tareas t
      LEFT JOIN users u ON t.use_id = u.id
      LEFT JOIN puestos p ON u.pue_id = p.pue_id
      LEFT JOIN departamentos d ON p.dep_id = d.dep_id
      LEFT JOIN reuniones re ON t.reu_id = re.reu_id
      ORDER BY t.tar_fecha DESC, t.tar_id DESC`
    );

    console.log(`✅ Tareas encontradas: ${rows.length}`);

    return res.status(200).json({
      success: true,
      count: rows.length,
      tareas: rows
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



export {
  crearTareas,
  getTareasByReunion,
  actualizarTarea,
  eliminarTarea,
  getTareasByUsuario,
  actualizarEstadoTarea,
  getTareasByUsuarioAll,
  getTareasAll,
};