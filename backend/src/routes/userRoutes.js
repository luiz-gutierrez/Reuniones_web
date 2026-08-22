// routes/userRoutes.js
import express from 'express';
import { 
  getUsuarios,
  getUsuarioById,
  getRoles,
  getPuestosSinUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  eliminarUsuarioPermanente,
  reactivarUsuario
} from '../controllers/userController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// ✅ Rutas GET con diferentes endpoints
router.get('/', verifyToken, checkRole('Admin', 'Director','Secretaria'), getUsuarios);
router.get('/roles', verifyToken, getRoles);  // ← Esta ruta es la que falta
router.get('/puestos-sin-usuarios', verifyToken, getPuestosSinUsuarios);
router.get('/:id', verifyToken, checkRole('Admin', 'Director','Secretaria'), getUsuarioById);

// ✅ Rutas POST, PUT, DELETE
router.post('/', verifyToken, checkRole('Admin','Director'), crearUsuario);
router.put('/:id', verifyToken, checkRole('Admin','Director'), editarUsuario);
router.put('/:id/reactivar', verifyToken, checkRole('Admin','Director'), reactivarUsuario);
router.delete('/:id', verifyToken, checkRole('Admin','Director'), eliminarUsuario);
router.delete('/:id/permanente', verifyToken, checkRole('Admin','Director'), eliminarUsuarioPermanente);

export default router;