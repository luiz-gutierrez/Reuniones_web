import express from 'express';
import { getReuniones, 
         crearReunion,
         getInvitados,  
         actualizarInvitados } from '../controllers/reunionController.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';


const router = express.Router();

// Admin y secretaria pueden ver las reuniones
router.get('/', verifyToken, checkRole('Admin', 'Asistente'), getReuniones);
// Solo la secretaria puede crear reuniones
router.post('/', verifyToken, checkRole('Asistente'), crearReunion);
//Ver los invitados de la  reunion
router.get('/:id/invitados', verifyToken, checkRole('Asistente'), getInvitados);
//actualizar invitados de la reunion
router.put('/:id/invitados', verifyToken, checkRole('Asistente'), actualizarInvitados);

export default router;
