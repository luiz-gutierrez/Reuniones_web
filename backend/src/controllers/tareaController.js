import { pool } from '../config/db.js';

// GET /api/tareas  (el usuario ve solo sus propias tareas)
async function getTareas(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, titulo, descripcion, estado, fecha_limite, created_at
       FROM tareas
       WHERE usuario_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// PATCH /api/tareas/:id/estado  (el usuario actualiza el estado de su tarea)
// body: { estado }  -> 'pendiente' | 'en_proceso' | 'completada'
async function actualizarEstadoTarea(req, res) {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'en_proceso', 'completada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ message: 'Estado invalido' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE tareas SET estado = ? WHERE id = ? AND usuario_id = ?`,
      [estado, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export { getTareas, actualizarEstadoTarea };
