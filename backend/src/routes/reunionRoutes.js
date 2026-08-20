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

/**
 * @swagger
 * tags:
 *   name: Reuniones
 *   description: Gestión de reuniones
*/

// Admin y secretaria pueden ver las reuniones
/**
 * @swagger
 * /reuniones:
 *   get:
 *     summary: Obtiene todas las reuniones creadas
 *     tags: [Reuniones]
 *     security:
 *       - bearerAuth: []
 *     description: Requiere rol Admin o Secretaria. Incluye conteo de asistencias y si el usuario autenticado está invitado.
 *     responses:
 *       200:
 *         description: Lista de reuniones obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   reu_id:
 *                     type: integer
 *                     example: 1
 *                   reu_nombre:
 *                     type: string
 *                     example: Reunión de planeación Q3
 *                   reu_descripcion:
 *                     type: string
 *                   reu_lugar:
 *                     type: string
 *                   reu_fecha:
 *                     type: string
 *                     format: date
 *                   reu_hora:
 *                     type: string
 *                     example: "14:30:00"
 *                   use_id:
 *                     type: integer
 *                     description: ID del usuario que creó la reunión
 *                   creado_por_nombre:
 *                     type: string
 *                     example: Juan Pérez
 *                   total_invitados:
 *                     type: integer
 *                   presentes:
 *                     type: integer
 *                   ausentes:
 *                     type: integer
 *                   justificados:
 *                     type: integer
 *                   soy_invitado:
 *                     type: integer
 *                     description: 1 si el usuario autenticado está invitado, 0 si no
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No tiene el rol necesario para esta acción
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verifyToken, checkRole('Admin', 'Secretaria'), getReuniones);
// Solo la secretaria puede crear reuniones
/**
 * @swagger
 * /reuniones:
 *   post:
 *     summary: Crea una nueva reunión
 *     tags: [Reuniones]
 *     security:
 *       - bearerAuth: []
 *     description: Solo la Secretaria puede crear reuniones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - fecha
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Reunión de planeación Q3
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reunión creada correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No tiene el rol necesario para esta acción
 */
router.post('/', verifyToken, checkRole('Secretaria'), crearReunion);

//Ver los invitados actuales de la  reunion y selecionarlo
router.get('/:id/invitados', verifyToken, checkRole('Admin','Secretaria'), getInvitados);
//actualizar invitados de la reunion
/**
 * @swagger
 * /reuniones/{id}/invitados:
 *   put:
 *     summary: Actualiza la lista de invitados de una reunión
 *     tags: [Reuniones]
 *     security:
 *       - bearerAuth: []
 *     description: Solo la Secretaria puede actualizar invitados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reunión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invitados:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Lista de IDs de usuarios invitados
 *     responses:
 *       200:
 *         description: Invitados actualizados correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No tiene el rol necesario para esta acción
 *       404:
 *         description: Reunión no encontrada
 */
router.put('/:id/invitados', verifyToken, checkRole('Secretaria'), actualizarInvitados);
//Obtener una reunión por ID
router.get('/:id', verifyToken, checkRole('Admin','Secretaria','Gerente','JefeDepto'), getReunionById);
//Actualizar una reunión por ID
router.put('/:id', verifyToken, checkRole('Admin','Secretaria'), actualizarReunion);

// Obtener reuniones del usuario logueado
router.get('/usuario/:userId', verifyToken, checkRole('Admin','Gerente','JefeDepto'), getReunionesByUsuario);

// Obtener detalles de una reunión específic

export default router;
