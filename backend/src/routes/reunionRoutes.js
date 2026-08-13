import express from 'express';
import { getReuniones, 
         crearReunion,
         getInvitados,  
         actualizarInvitados,
         getReunionById  } from '../controllers/reunionController.js';
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
router.get('/:id', verifyToken, checkRole( 'Admin', 'Secretaria'), getReunionById);




export default router;
