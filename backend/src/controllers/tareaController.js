// controllers/tareaController.js
import { pool } from '../config/db.js';

// POST /api/tareas - Crear múltiples tareas
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

// GET /api/tareas/reunion/:id - Obtener tareas de una reunión
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

// ========== NUEVO CONTROLADOR ==========
// PUT /api/tareas/:id - Actualizar todos los campos de una tarea
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
// DELETE /api/tareas/:id - Eliminar una tarea
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

// PUT /api/tareas/:id - Actualizar estado de una tarea
async function actualizarEstadoTarea(req, res) {
  const { id } = req.params;
  const { tar_estado } = req.body;

  if (!id) {
    return res.status(400).json({
      message: 'ID de tarea requerido'
    });
  }

  if (!['pendiente', 'en progreso', 'completada'].includes(tar_estado)) {
    return res.status(400).json({
      message: 'Estado inválido. Debe ser: pendiente, en progreso o completada'
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE tareas 
       SET tar_estado = ?
       WHERE tar_id = ?`,
      [tar_estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Tarea no encontrada'
      });
    }

    return res.json({
      message: 'Estado actualizado correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return res.status(500).json({
      message: 'Error al actualizar estado'
    });
  }
}

export {
  crearTareas,
  getTareasByReunion,
  actualizarTarea,
  eliminarTarea,
  actualizarEstadoTarea
};