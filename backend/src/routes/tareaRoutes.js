import express from 'express';
import {crearTareas,
        getTareasByReunion,
        actualizarTarea,
        eliminarTarea,
        actualizarEstadoTarea,
        getTareasByUsuario,
        getTareasByUsuarioAll,
        getTareasAll } from '../controllers/tareaController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// crear tareas para una reunion
router.post('/', verifyToken, checkRole('Admin', 'Secretaria' ), crearTareas);
// Obtener tareas por reunion
router.get('/reunion/:id', verifyToken, checkRole('Admin', 'Secretaria'), getTareasByReunion);
// En tu archivo de rutas (ej: routes/tareas.js)
router.put('/:id', actualizarTarea);
// Para eliminar una tarea
router.delete('/:id', eliminarTarea);
// Para actualizar solo el estado de la tarea
router.put('/:id/estado', actualizarEstadoTarea);

// Obtener tareas del usuario (solo Iniciar y Proceso)
router.get('/usuario/:userId', verifyToken, checkRole('Gerente','JefeDepto'),getTareasByUsuario);
// Actualizar solo el estado
router.put('/:id/estado', verifyToken, checkRole('Gerente','JefeDepto'),actualizarEstadoTarea);
// Obtener TODAS las tareas del usuario
router.get('/usuario/:userId/todas', verifyToken, checkRole('Gerente','JefeDepto'),getTareasByUsuarioAll);

// Obtener todas las tareas
router.get('/', verifyToken, checkRole('Admin', 'Secretaria', 'Gerente'), getTareasAll);

export default router;
