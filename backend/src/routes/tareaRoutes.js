import express from 'express';
import { getTareas, actualizarEstadoTarea } from '../controllers/tareaController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// El usuario ve y actualiza solo sus propias tareas
router.get('/', verifyToken, checkRole('usuario'), getTareas);
router.patch('/:id/estado', verifyToken, checkRole('usuario'), actualizarEstadoTarea);

export default router;
