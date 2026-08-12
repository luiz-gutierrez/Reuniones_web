import { pool } from '../config/db.js';

// GET /api/reuniones  (admin y secretaria)
async function getReuniones(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        re.reu_id,
        re.reu_nombre,
        re.reu_descripcion,
        re.reu_lugar,
        re.reu_fecha,
        re.reu_hora,
        re.use_id,
        u.nombre AS creado_por_nombre
      FROM reuniones re
      LEFT JOIN users u ON re.use_id = u.id`
    );
    
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener reuniones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// POST /api/reuniones  (secretaria)
// body: { nombre, descripcion, fecha, hora }
// Crear reunión con invitados
async function crearReunion(req, res) {
  const { nombre, descripcion, lugar, fecha, hora, invitados } = req.body;
  const creado_por = req.user.id;

  console.log('📝 Creando reunión:', { nombre, descripcion, lugar, fecha, hora, invitados });

  // Validar campos obligatorios
  if (!nombre || !fecha || !hora) {
    return res.status(400).json({ 
      message: 'Nombre, fecha y hora son obligatorios' 
    });
  }

  // ✅ Validar que tenga al menos un invitado
  if (!invitados || !Array.isArray(invitados) || invitados.length === 0) {
    return res.status(400).json({ 
      message: 'La reunión debe tener al menos un invitado' 
    });
  }

  // ✅ Validar que los invitados sean números válidos
  const invitadosValidos = invitados.filter(id => Number.isInteger(id) && id > 0);
  if (invitadosValidos.length === 0) {
    return res.status(400).json({ 
      message: 'Los IDs de invitados no son válidos' 
    });
  }

  try {
    // ✅ Verificar que los invitados existen en la base de datos
    const placeholders = invitadosValidos.map(() => '?').join(',');
    const [usuariosExistentes] = await pool.query(
      `SELECT id FROM users WHERE id IN (${placeholders})`,
      invitadosValidos
    );
    
    const idsExistentes = usuariosExistentes.map(u => u.id);
    
    if (idsExistentes.length === 0) {
      return res.status(400).json({ 
        message: 'Ninguno de los invitados seleccionados existe en el sistema' 
      });
    }

    // Iniciar transacción
    await pool.query('START TRANSACTION');

    // 1. Insertar la reunión
    const [result] = await pool.query(
      `INSERT INTO reuniones (reu_nombre, reu_descripcion, reu_lugar, reu_fecha, reu_hora, use_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, lugar || null, fecha, hora, creado_por]
    );

    const reu_id = result.insertId;
    console.log(`✅ Reunión creada con ID: ${reu_id}`);

    // 2. Insertar invitados (incluyendo al creador si está en la lista)
    const values = idsExistentes.map(use_id => [reu_id, use_id, 'ausente']);
    await pool.query(
      'INSERT INTO asistencias (reu_id, use_id, asi_estatus) VALUES ?',
      [values]
    );
    
    console.log(`✅ ${idsExistentes.length} invitados agregados`);

    // Confirmar transacción
    await pool.query('COMMIT');

    return res.status(201).json({ 
      id: reu_id, 
      message: 'Reunión creada correctamente',
      invitados_agregados: idsExistentes.length,
      invitados_totales: invitados.length,
      invitados_validos: idsExistentes,
      creador_incluido: idsExistentes.includes(creado_por)
    });

  } catch (error) {
    // Revertir transacción en caso de error
    await pool.query('ROLLBACK');
    console.error('❌ Error al crear reunión:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'Ya existe una reunión con estos datos' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}
// GET /api/reuniones/:id/invitados
async function getInvitados(req, res) {
  const { id } = req.params;

  console.log(`📋 Obteniendo invitados de la reunión ID: ${id}`);

  if (!id) {
    return res.status(400).json({
      message: 'ID de reunión requerido'
    });
  }

  try {
    // Verificar que la reunión existe
    const [reunion] = await pool.query(
      'SELECT reu_id FROM reuniones WHERE reu_id = ?',
      [id]
    );

    if (reunion.length === 0) {
      return res.status(404).json({
        message: 'Reunión no encontrada'
      });
    }

    // Obtener los invitados
    const [rows] = await pool.query(
      `SELECT 
        a.asi_id,
        a.asi_estatus,
        a.use_id,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.activo
       FROM asistencias a
       INNER JOIN users u ON a.use_id = u.id
       WHERE a.reu_id = ?
       ORDER BY u.nombre ASC`,
      [id]
    );

    console.log(`✅ ${rows.length} invitados encontrados`);
    return res.json(rows);

  } catch (error) {
    console.error('❌ Error al obtener invitados:', error);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
}

// PUT /api/reuniones/:id/invitados
async function actualizarInvitados(req, res) {
  const { id } = req.params;
  const { invitados } = req.body;

  console.log(`📝 Actualizando invitados de la reunión ID: ${id}`);
  console.log('📋 Nuevos invitados:', invitados);

  if (!id) {
    return res.status(400).json({
      message: 'ID de reunión requerido'
    });
  }

  if (!Array.isArray(invitados)) {
    return res.status(400).json({
      message: 'El campo invitados debe ser un array de IDs de usuarios'
    });
  }

  try {
    // Verificar que la reunión existe
    const [reunion] = await pool.query(
      'SELECT reu_id FROM reuniones WHERE reu_id = ?',
      [id]
    );

    if (reunion.length === 0) {
      return res.status(404).json({
        message: 'Reunión no encontrada'
      });
    }

    // Iniciar transacción
    await pool.query('START TRANSACTION');

    // Eliminar invitados actuales
    await pool.query('DELETE FROM asistencias WHERE reu_id = ?', [id]);

    // Insertar nuevos invitados
    let invitadosAgregados = 0;
    if (invitados.length > 0) {
      // Verificar que los usuarios existen
      const placeholders = invitados.map(() => '?').join(',');
      const [usuariosExistentes] = await pool.query(
        `SELECT id FROM users WHERE id IN (${placeholders})`,
        invitados
      );
      
      const idsExistentes = usuariosExistentes.map(u => u.id);
      const idsValidos = invitados.filter(id => idsExistentes.includes(id));
      
      if (idsValidos.length > 0) {
        const values = idsValidos.map(use_id => [id, use_id, 'ausente']);
        await pool.query(
          'INSERT INTO asistencias (reu_id, use_id, asi_estatus) VALUES ?',
          [values]
        );
        invitadosAgregados = idsValidos.length;
      }
    }

    await pool.query('COMMIT');

    console.log(`✅ ${invitadosAgregados} invitados actualizados`);
    return res.json({
      message: 'Invitados actualizados correctamente',
      invitados_agregados: invitadosAgregados
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error al actualizar invitados:', error);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
}

export { 
  getReuniones, 
  crearReunion,
  getInvitados,
  actualizarInvitados
};