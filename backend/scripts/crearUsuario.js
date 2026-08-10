// Script para crear un usuario con contraseña cifrada.
// Uso: node scripts/crearUsuario.js "Nombre" "Apellido" "Telefono" "correo@ejemplo.com" "contraseña" "admin"
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const [nombre, apellido, telefono, correo, contrasena, rolNombre] = process.argv.slice(2);

if (!nombre || !apellido || !telefono || !correo || !contrasena || !rolNombre) {
  console.log(
    'Uso: node scripts/crearUsuario.js "Nombre" "Apellido" "Telefono" "correo@ejemplo.com" "contraseña" "admin" | "secretaria" | "usuario"'
  );
  process.exit(1);
}

const rolMap = {
  admin: 1,
  secretaria: 2,
  usuario: 3
};

const rol_id = rolMap[rolNombre.toLowerCase()];

if (!rol_id) {
  console.log('Rol inválido. Usa: admin, secretaria o usuario');
  process.exit(1);
}

(async function main() {
  try {
    const contraCifrada = await bcrypt.hash(contrasena, 10);

    const [result] = await pool.query(
      'INSERT INTO users (nombre, apellido, telefono, correo, contrasena, rol_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, telefono, correo, contraCifrada, rol_id]
    );

    console.log(`Usuario ${correo} creado como ${rolNombre} (id=${result.insertId})`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creando usuario:', error.message || error);
    try {
      await pool.end();
    } catch (e) {}
    process.exit(1);
  }
})();
