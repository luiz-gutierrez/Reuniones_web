import express from 'express';
import {
    getUsuarios,
    getRoles,
    getPuestosSinUsuarios,
    crearUsuario
} from '../controllers/userController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', verifyToken, checkRole('Admin', 'Secretaria'), getUsuarios);

// GET /api/usuarios/roles - Obtener todos los roles
router.get('/roles', verifyToken, getRoles);

// GET /api/usuarios/puestos-sin-usuarios - Obtener puestos sin usuarios
router.get('/puestos-sin-usuarios', verifyToken, getPuestosSinUsuarios);

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', verifyToken, checkRole('Admin'), crearUsuario);

export default router;