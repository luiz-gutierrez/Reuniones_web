import { pool } from '../config/db.js';

// GET /api/reuniones  (admin y secretaria)
async function getReuniones(req, res) {
  try {
    const userId = req.user.id;
    
    const [rows] = await pool.query(
      `SELECT 
        re.reu_id,
        re.reu_nombre,
        re.reu_descripcion,
        re.reu_lugar,
        re.reu_fecha,
        re.reu_hora,
        re.use_id,
        u.nombre AS creado_por_nombre,
        COUNT(a.asi_id) AS total_invitados,
        SUM(CASE WHEN a.asi_estatus = 'presente' THEN 1 ELSE 0 END) AS presentes,
        SUM(CASE WHEN a.asi_estatus = 'ausente' THEN 1 ELSE 0 END) AS ausentes,
        SUM(CASE WHEN a.asi_estatus = 'justificado' THEN 1 ELSE 0 END) AS justificados,
        SUM(CASE WHEN a.use_id = ? THEN 1 ELSE 0 END) AS soy_invitado
      FROM reuniones re
      LEFT JOIN users u ON re.use_id = u.id
      LEFT JOIN asistencias a ON re.reu_id = a.reu_id
      GROUP BY re.reu_id
      ORDER BY re.reu_fecha DESC, re.reu_hora DESC`,
      [userId]
    );
    
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener reuniones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// POST /api/reuniones  (secretaria)
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

  // ✅ Validar que tenga al menos 2 invitados
  if (!invitados || !Array.isArray(invitados) || invitados.length === 0) {
    return res.status(400).json({ 
      message: 'Debes seleccionar al menos 2 invitados para la reunión' 
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

// GET /api/reuniones/:id/invitados de la reunion 
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

// GET /api/reuniones/:id - Obtener una reunión por ID con todos sus detalles
async function getReunionById(req, res) {
  const { id } = req.params;

  // Validar que el ID existe
  if (!id) {
    return res.status(400).json({ 
      message: 'ID de reunión requerido' 
    });
  }

  // Validar que el ID sea un número
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ 
      message: 'ID de reunión inválido' 
    });
  }

  try {
    console.log(`📋 Obteniendo detalles de la reunión ID: ${id}`);

    // 1. Obtener los datos de la reunión
    const [rows] = await pool.query(
      `SELECT 
        re.reu_id,
        re.reu_nombre,
        re.reu_descripcion,
        re.reu_lugar,
        re.reu_fecha,
        re.reu_hora,
        re.use_id,
        u.nombre AS creador_nombre,
        u.apellido AS creador_apellido,
        u.correo AS creador_correo,
        COUNT(DISTINCT a.asi_id) AS total_invitados,
        SUM(CASE WHEN a.asi_estatus = 'presente' THEN 1 ELSE 0 END) AS presentes,
        SUM(CASE WHEN a.asi_estatus = 'ausente' THEN 1 ELSE 0 END) AS ausentes,
        SUM(CASE WHEN a.asi_estatus = 'justificado' THEN 1 ELSE 0 END) AS justificados
      FROM reuniones re
      LEFT JOIN users u ON re.use_id = u.id
      LEFT JOIN asistencias a ON re.reu_id = a.reu_id
      WHERE re.reu_id = ?
      GROUP BY re.reu_id`,
      [id]
    );

    // Verificar si la reunión existe
    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'Reunión no encontrada' 
      });
    }

    const reunion = rows[0];

    // 2. Obtener los invitados con sus detalles
    const [invitados] = await pool.query(
      `SELECT 
        a.asi_id,
        a.asi_estatus,
        u.id AS user_id,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.activo,
        p.pue_nombre AS puesto,
        d.dep_nombre AS departamento,
        r.rol_nombre AS rol
      FROM asistencias a
      INNER JOIN users u ON a.use_id = u.id
      LEFT JOIN puestos p ON u.pue_id = p.pue_id
      LEFT JOIN departamentos d ON p.dep_id = d.dep_id
      LEFT JOIN roles r ON p.rol_id = r.rol_id
      WHERE a.reu_id = ?
      ORDER BY u.nombre ASC`,
      [id]
    );

    // 3. Construir la respuesta completa
    const response = {
      reunion: {
        id: reunion.reu_id,
        nombre: reunion.reu_nombre,
        descripcion: reunion.reu_descripcion,
        lugar: reunion.reu_lugar,
        fecha: reunion.reu_fecha,
        hora: reunion.reu_hora,
        creador: {
          id: reunion.use_id,
          nombre: reunion.creador_nombre,
          apellido: reunion.creador_apellido,
          correo: reunion.creador_correo
        },
        estadisticas: {
          total_invitados: parseInt(reunion.total_invitados) || 0,
          presentes: parseInt(reunion.presentes) || 0,
          ausentes: parseInt(reunion.ausentes) || 0,
          justificados: parseInt(reunion.justificados) || 0
        },
        created_at: reunion.created_at,
        updated_at: reunion.updated_at
      },
      invitados: invitados.map(i => ({
        asi_id: i.asi_id,
        estatus: i.asi_estatus,
        usuario: {
          id: i.user_id,
          nombre: i.nombre,
          apellido: i.apellido,
          correo: i.correo,
          telefono: i.telefono,
          activo: i.activo === 1
        },
        puesto: i.puesto,
        departamento: i.departamento,
        rol: i.rol,
        asistencia_registrada: i.asistencia_registrada,
        asistencia_actualizada: i.asistencia_actualizada
      }))
    };

    console.log(`✅ Detalles de reunión ID ${id} cargados correctamente`);
    console.log(`📊 Total invitados: ${response.reunion.estadisticas.total_invitados}`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error al obtener reunión por ID:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor al obtener la reunión',
      error: error.message 
    });
  }
}

// PUT /api/reuniones/:id - Actualizar reunión
async function actualizarReunion(req, res) {
  const { id } = req.params;
  const { reu_nombre, reu_descripcion, reu_lugar, reu_fecha, reu_hora } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID de reunión requerido' });
  }

  if (!reu_nombre || !reu_fecha || !reu_hora) {
    return res.status(400).json({ 
      message: 'Nombre, fecha y hora son obligatorios' 
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE reuniones 
       SET reu_nombre = ?, 
           reu_descripcion = ?, 
           reu_lugar = ?, 
           reu_fecha = ?, 
           reu_hora = ?
       WHERE reu_id = ?`,
      [reu_nombre, reu_descripcion, reu_lugar, reu_fecha, reu_hora, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reunión no encontrada' });
    }

    return res.json({ 
      message: 'Reunión actualizada correctamente',
      reunion: { reu_nombre, reu_descripcion, reu_lugar, reu_fecha, reu_hora }
    });

  } catch (error) {
    console.error('Error al actualizar reunión:', error);
    return res.status(500).json({ message: 'Error al actualizar reunión' });
  }
}

// GET /api/reuniones/usuario/:userId - Obtener reuniones donde el usuario es invitado
async function getReunionesByUsuario(req, res) {
  const { userId } = req.params;

  try {
    console.log(`🔍 Buscando reuniones para usuario: ${userId}`);

    // Consulta SIN reu_estatus (por si no existe)
    const [rows] = await pool.query(
      `SELECT 
        r.reu_id,
        r.reu_nombre,
        r.reu_descripcion,
        r.reu_fecha,
        r.reu_hora,
        r.reu_lugar,
        r.created_at,
        u.nombre as creador_nombre,
        u.apellido as creador_apellido,
        u.correo as creador_correo,
        a.asi_estatus as mi_asistencia,
        (SELECT COUNT(*) FROM asistencias a2 WHERE a2.reu_id = r.reu_id) as total_invitados
      FROM asistencias a
      INNER JOIN reuniones r ON a.reu_id = r.reu_id
      INNER JOIN users u ON r.use_id = u.id
      WHERE a.use_id = ?
      ORDER BY r.reu_fecha DESC, r.reu_hora DESC`,
      [userId]
    );

    console.log(`✅ Encontradas ${rows.length} reuniones`);

    // Si hay reuniones, obtener la lista de invitados
    if (rows.length > 0) {
      const reunionesIds = rows.map(r => r.reu_id);
      
      const [invitados] = await pool.query(
        `SELECT 
          a.reu_id,
          a.use_id,
          a.asi_estatus,
          u.nombre,
          u.apellido,
          u.correo
        FROM asistencias a
        INNER JOIN users u ON a.use_id = u.id
        WHERE a.reu_id IN (?)
        ORDER BY u.nombre ASC`,
        [reunionesIds]
      );

      // Agrupar invitados por reunión
      const invitadosPorReunion = {};
      invitados.forEach(inv => {
        if (!invitadosPorReunion[inv.reu_id]) {
          invitadosPorReunion[inv.reu_id] = [];
        }
        invitadosPorReunion[inv.reu_id].push({
          use_id: inv.use_id,
          nombre: inv.nombre,
          apellido: inv.apellido,
          correo: inv.correo,
          asi_estatus: inv.asi_estatus
        });
      });

      rows.forEach(reunion => {
        reunion.invitados = invitadosPorReunion[reunion.reu_id] || [];
      });
    }

    return res.json(rows);

  } catch (error) {
    console.error('❌ Error en getReunionesByUsuario:', error);
    console.error('❌ SQL:', error.sql);
    console.error('❌ SQL Message:', error.sqlMessage);
    
    return res.status(500).json({
      message: 'Error al obtener reuniones del usuario',
      error: error.message,
      sqlMessage: error.sqlMessage || null
    });
  }
}

// GET /api/reuniones/:id - Obtener detalles de una reunión específica
// async function getReunionById(req, res) {
//   const { id } = req.params;

//   try {
//     const [rows] = await pool.query(
//       `SELECT 
//         r.reu_id,
//         r.reu_nombre,
//         r.reu_descripcion,
//         r.reu_fecha,
//         r.reu_hora_inicio,
//         r.reu_hora_fin,
//         r.reu_lugar,
//         r.reu_tipo,
//         r.reu_estatus,
//         r.created_at,
//         r.use_id as creador_id,
//         u.nombre as creador_nombre,
//         u.apellido as creador_apellido,
//         u.correo as creador_correo
//       FROM reuniones r
//       INNER JOIN users u ON r.use_id = u.id
//       WHERE r.reu_id = ?`,
//       [id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         message: 'Reunión no encontrada'
//       });
//     }

//     const reunion = rows[0];

//     // Obtener invitados
//     const [invitados] = await pool.query(
//       `SELECT 
//         u.id,
//         u.nombre,
//         u.apellido,
//         u.correo,
//         u.telefono,
//         ri.rol,
//         ri.confirmacion
//       FROM reunion_invitados ri
//       INNER JOIN users u ON ri.use_id = u.id
//       WHERE ri.reu_id = ?`,
//       [id]
//     );
//     reunion.invitados = invitados;

//     // Obtener tareas de la reunión
//     const [tareas] = await pool.query(
//       `SELECT 
//         t.tar_id,
//         t.tar_nombre,
//         t.tar_descripcion,
//         t.tar_fecha,
//         t.tar_estatus,
//         t.tar_prioridad,
//         t.use_id as asignado_a,
//         u.nombre as asignado_nombre,
//         u.apellido as asignado_apellido
//       FROM tareas t
//       LEFT JOIN users u ON t.use_id = u.id
//       WHERE t.reu_id = ?`,
//       [id]
//     );
//     reunion.tareas = tareas;

//     return res.json(reunion);
//   } catch (error) {
//     console.error('❌ Error al obtener reunión:', error);
//     return res.status(500).json({
//       message: 'Error al obtener la reunión',
//       error: error.message
//     });
//   }
// }

export { 
  getReuniones, 
  crearReunion,
  getInvitados,
  actualizarInvitados,
  getReunionById,
  actualizarReunion,
getReunionesByUsuario
};