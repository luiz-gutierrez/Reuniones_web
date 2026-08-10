// Utilidad para generar el hash bcrypt de una contrasena.
// Uso:
//   cd backend
//   npm install
//   node sql/hash_password.js "mi_contrasena"
//
// El resultado lo copias y lo pegas en la columna `contrasena`
// de la tabla users (nunca guardes la contrasena en texto plano).

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Uso: node sql/hash_password.js "tu_contrasena"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('Hash generado:');
console.log(hash);
