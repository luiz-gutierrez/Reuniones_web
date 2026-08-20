import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reunionRoutes from './routes/reunionRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';
import puestosRoutes from './routes/puestosRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js'; 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/reuniones', reunionRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/puestos', puestosRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;
