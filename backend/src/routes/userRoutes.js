import express from 'express';
import { getUsuarios, crearUsuario } from '../controllers/userController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// Solo el admin y Secretaria puede ver y crear usuarios
router.get('/', verifyToken, checkRole('Admin', 'Secretaria'), getUsuarios);
router.post('/', verifyToken, checkRole('Admin'), crearUsuario);

export default router;
