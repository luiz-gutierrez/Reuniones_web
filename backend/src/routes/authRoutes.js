import express from 'express';
import { login } from '../controllers/authController.js';
import verifyToken from '../middlewares/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();

router.post('/login', login);

router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.telefono, u.correo,
              r.rol_nombre as rol
       FROM users u
       INNER JOIN roles r ON u.rol_id = r.rol_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ message: 'Error al obtener informacion del usuario' });
  }
});

export default router;