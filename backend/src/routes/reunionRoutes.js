import express from 'express';
import { getReuniones, 
         crearReunion,
         getInvitados,  
         actualizarInvitados,
         getReunionById,
         actualizarReunion,
        getReunionesByUsuario } from '../controllers/reunionController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';


const router = express.Router();

// Admin y secretaria pueden ver las reuniones
router.get('/', verifyToken, checkRole('Admin', 'Secretaria'), getReuniones);
// Solo la secretaria puede crear reuniones
router.post('/', verifyToken, checkRole('Secretaria'), crearReunion);
//Ver los invitados actuales de la  reunion y selecionarlo
router.get('/:id/invitados', verifyToken, checkRole('Secretaria'), getInvitados);
//actualizar invitados de la reunion
router.put('/:id/invitados', verifyToken, checkRole('Secretaria'), actualizarInvitados);
//Obtener una reunión por ID
router.get('/:id', verifyToken, checkRole( 'Admin', 'Secretaria','Gerente'), getReunionById);
//Actualizar una reunión por ID
router.put('/:id', verifyToken, checkRole('Secretaria'), actualizarReunion);

// Obtener reuniones del usuario logueado
router.get('/usuario/:userId', verifyToken, checkRole('Gerente'), getReunionesByUsuario);

// Obtener detalles de una reunión específic

export default router;
