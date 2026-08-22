// routes/puestosRoutes.js
import express from 'express';
import { pool } from '../config/db.js';
import verifyToken from '../middlewares/auth.js';
import checkRole from '../middlewares/role.js';

const router = express.Router();

// GET /api/puestos (solo admin)
router.get('/', verifyToken, checkRole('Admin','Director'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.pue_id, p.pue_nombre, d.dep_nombre as departamento, r.rol_nombre as rol
       FROM puestos p
       INNER JOIN departamentos d ON p.dep_id = d.dep_id
       INNER JOIN roles r ON p.rol_id = r.rol_id
       ORDER BY p.pue_nombre`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener puestos:', error);
    res.status(500).json({ message: 'Error al obtener puestos' });
  }
});

export default router;