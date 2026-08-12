import express from 'express';
import { getUsuarios, crearUsuario } from '../controllers/userController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// Solo el admin y Asistente puede ver y crear usuarios
router.get('/', verifyToken, checkRole('Admin', 'Asistente'), getUsuarios);
router.post('/', verifyToken, checkRole('Admin'), crearUsuario);

export default router;
