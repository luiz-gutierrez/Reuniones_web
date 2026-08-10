import express from 'express';
import { getReuniones, crearReunion } from '../controllers/reunionController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// Admin y secretaria pueden ver las reuniones
router.get('/', verifyToken, checkRole('admin', 'secretaria'), getReuniones);
// Solo la secretaria puede crear reuniones
router.post('/', verifyToken, checkRole('secretaria'), crearReunion);

export default router;
