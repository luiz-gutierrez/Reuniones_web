import 'dotenv/config';
import app from './src/app.js';

// Verificar que JWT_SECRET esté definido
if (!process.env.JWT_SECRET) {
  console.error('Error: la variable de entorno JWT_SECRET no está definida. Añádela en .env');
  process.exit(1);
}

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
