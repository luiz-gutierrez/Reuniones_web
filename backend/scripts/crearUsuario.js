// Script para crear un usuario con contrasena cifrada.
//
// Uso:
// node scripts/crearUsuario.js "Nombre" "Apellido" "Telefono" "correo@ejemplo.com" "contrasena" pue_id
//
// Ejemplo:
// node scripts/crearUsuario.js "Arnulfo" "Perez" "1234567890" "arnulfo@gmail.com" "123456" 1

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const [
  nombre,
  apellido,
  telefono,
  correo,
  contrasena,
  pue_id
] = process.argv.slice(2);

// ==========================================
// Validar argumentos
// ==========================================

if (
  !nombre ||
  !apellido ||
  !telefono ||
  !correo ||
  !contrasena ||
  !pue_id
) {
  console.log(`
Uso:

node scripts/crearUsuario.js "Nombre" "Apellido" "Telefono" "correo@ejemplo.com" "contrasena" pue_id

Ejemplo:

node scripts/crearUsuario.js "Arnulfo" "Perez" "1234567890" "arnulfo@gmail.com" "123456" 1
`);

  process.exit(1);
}

// ==========================================
// Validar que pue_id sea numérico
// ==========================================

if (isNaN(Number(pue_id))) {
  console.log('Error: pue_id debe ser un número.');

  process.exit(1);
}

(async function main() {
  try {

    // ==========================================
    // Buscar el puesto
    // ==========================================

    const [puestos] = await pool.query(
      `
      SELECT
        p.pue_id,
        p.pue_nombre,
        p.rol_id,
        r.rol_nombre,
        p.dep_id,
        d.dep_nombre

      FROM puestos p

      INNER JOIN roles r
        ON p.rol_id = r.rol_id

      LEFT JOIN departamentos d
        ON p.dep_id = d.dep_id

      WHERE p.pue_id = ?

      LIMIT 1
      `,
      [pue_id]
    );

    // ==========================================
    // Validar puesto
    // ==========================================

    if (puestos.length === 0) {
      console.log(
        `Error: no existe un puesto con pue_id = ${pue_id}`
      );

      await pool.end();
      process.exit(1);
    }

    const puesto = puestos[0];

    // ==========================================
    // Mostrar información del puesto
    // ==========================================

    console.log('');
    console.log('======================================');
    console.log(' INFORMACIÓN DEL PUESTO');
    console.log('======================================');

    console.log(`Puesto:       ${puesto.pue_nombre}`);
    console.log(`pue_id:       ${puesto.pue_id}`);
    console.log(`Rol:          ${puesto.rol_nombre}`);
    console.log(`rol_id:       ${puesto.rol_id}`);
    console.log(`Departamento: ${puesto.dep_nombre || 'Sin departamento'}`);
    console.log(`dep_id:       ${puesto.dep_id || 'Sin departamento'}`);

    console.log('======================================');
    console.log('');

    // ==========================================
    // Verificar si ya existe el teléfono
    // ==========================================

    const [usuariosTelefono] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE telefono = ?
      LIMIT 1
      `,
      [telefono]
    );

    if (usuariosTelefono.length > 0) {
      console.log(
        `Error: ya existe un usuario con el teléfono ${telefono}.`
      );

      await pool.end();
      process.exit(1);
    }

    // ==========================================
    // Verificar si ya existe el correo
    // ==========================================

    const [usuariosCorreo] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE correo = ?
      LIMIT 1
      `,
      [correo]
    );

    if (usuariosCorreo.length > 0) {
      console.log(
        `Error: ya existe un usuario con el correo ${correo}.`
      );

      await pool.end();
      process.exit(1);
    }

    // ==========================================
    // Cifrar contrasena
    // ==========================================

    const contraCifrada = await bcrypt.hash(
      contrasena,
      10
    );

    // ==========================================
    // Crear usuario
    // ==========================================

    const [result] = await pool.query(
      `
      INSERT INTO users
      (
        nombre,
        apellido,
        telefono,
        correo,
        contrasena,
        pue_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        nombre,
        apellido,
        telefono,
        correo,
        contraCifrada,
        pue_id
      ]
    );

    // ==========================================
    // Usuario creado
    // ==========================================

    console.log('');
    console.log('======================================');
    console.log(' USUARIO CREADO CORRECTAMENTE');
    console.log('======================================');

    console.log(`ID:            ${result.insertId}`);
    console.log(`Nombre:        ${nombre} ${apellido}`);
    console.log(`Telefono:      ${telefono}`);
    console.log(`Correo:        ${correo}`);
    console.log(`pue_id:        ${puesto.pue_id}`);
    console.log(`Puesto:        ${puesto.pue_nombre}`);
    console.log(`rol_id:        ${puesto.rol_id}`);
    console.log(`Rol:           ${puesto.rol_nombre}`);
    console.log(`dep_id:        ${puesto.dep_id || 'Sin departamento'}`);
    console.log(`Departamento:  ${puesto.dep_nombre || 'Sin departamento'}`);

    console.log('======================================');
    console.log('');

    await pool.end();

    process.exit(0);

  } catch (error) {

    console.error('');
    console.error('Error creando usuario:');
    console.error(error.message || error);
    console.error('');

    try {
      await pool.end();
    } catch (e) {}

    process.exit(1);
  }
})();