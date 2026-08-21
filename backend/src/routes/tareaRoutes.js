// routes/tareaRoutes.js (versión con JefeDepto en todas)
import express from 'express';
import {
  crearTareas,
  getTareasByReunion,
  actualizarTarea,
  eliminarTarea,
  actualizarEstadoTarea,
  getTareasByUsuario,
  getTareasByUsuarioAll,
  getTareasAll
} from '../controllers/tareaController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// ============================================
// RUTAS PARA ADMIN Y SECRETARIA
// ============================================

// POST /api/tareas - Crear tareas para una reunión
router.post('/', verifyToken, checkRole('Admin', 'Secretaria'), crearTareas);

// GET /api/tareas/reunion/:id - Obtener tareas por reunión
router.get('/reunion/:id', verifyToken, checkRole('Admin', 'Secretaria'), getTareasByReunion);

// PUT /api/tareas/:id - Actualizar tarea completa
router.put('/:id', verifyToken, checkRole('Admin', 'Secretaria'), actualizarTarea);

// DELETE /api/tareas/:id - Eliminar tarea
router.delete('/:id', verifyToken, checkRole('Admin', 'Secretaria'), eliminarTarea);

// ============================================
// RUTA PARA ACTUALIZAR ESTADO
// ============================================

// PUT /api/tareas/:id/estado - Actualizar estado
router.put('/:id/estado', verifyToken, checkRole('Admin', 'Secretaria', 'Gerente', 'JefeDepto'), actualizarEstadoTarea);

// ============================================
// RUTAS PARA VER TAREAS
// ============================================

// GET /api/tareas/usuario/:userId - Tareas del usuario (solo Iniciar y Proceso)
router.get('/usuario/:userId', verifyToken, checkRole('Admin', 'Gerente', 'JefeDepto', 'Secretaria'), getTareasByUsuario);

// GET /api/tareas/usuario/:userId/todas - TODAS las tareas del usuario
router.get('/usuario/:userId/todas', verifyToken, checkRole('Admin', 'Gerente', 'JefeDepto', 'Secretaria'), getTareasByUsuarioAll);

// GET /api/tareas/ - Obtener todas las tareas según rol
router.get('/', verifyToken, checkRole('Admin', 'Secretaria', 'Gerente', 'JefeDepto'), getTareasAll);

export default router;