import express from 'express';
import {crearTareas,
        getTareasByReunion,
        actualizarEstadoTarea} from '../controllers/tareaController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// El usuario ve y actualiza solo sus propias tareas
router.get('/', verifyToken, checkRole('Admin', 'Secretaria' ), crearTareas);
router.get('/reunion/:id', getTareasByReunion);
router.patch('/:id/estado', verifyToken, checkRole('Secretaria'), actualizarEstadoTarea);

export default router;
