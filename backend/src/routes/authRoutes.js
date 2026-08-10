import express from 'express';
import { login, me } from '../controllers/authController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', verifyToken, me);

export default router;
