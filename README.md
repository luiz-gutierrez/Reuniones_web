# Proyecto: Login + 3 roles (React + Vite / Node.js / MySQL - XAMPP)

## Estructura

```
proyecto/
  backend/     -> API Node.js + Express + MySQL (mysql2)
  frontend/    -> React + Vite
```

## Roles y vistas

- **admin**: Inicio, Usuarios (lista de usuarios del sistema)
- **secretaria**: Inicio, Reuniones (listar y crear)
- **usuario**: Inicio, Tareas (listar y cambiar estado)

El login se hace con **telefono + contrasena**, contra tu tabla `users`.

## 1) Base de datos (XAMPP)

1. Inicia Apache y MySQL desde XAMPP.
2. Crea tu base de datos (o usa la que ya tengas) e importa tu tabla `users`
   (la que ya tienes creada).
3. Ejecuta el script `backend/sql/schema_complement.sql` en phpMyAdmin.
   Este script crea las tablas que faltan: `roles`, `reuniones`, `tareas`,
   y llena `roles` con: admin, secretaria, usuario.
4. Crea tu primer usuario admin:
   ```
   cd backend
   npm install
   node sql/hash_password.js "tu_contrasena"
   ```
   Copia el hash que te imprime y úsalo en un INSERT como el de ejemplo
   que aparece al final de `schema_complement.sql`.

## 2) Backend

```
cd backend
npm install
cp .env.example .env
```

Edita `.env` con los datos de tu XAMPP (usuario root, password vacio por
defecto, nombre de tu base de datos, etc).

```
npm run dev
```

El backend queda corriendo en `http://localhost:4000`.

Endpoints principales:
- `POST /api/auth/login` -> { telefono, contrasena }
- `GET  /api/auth/me` (requiere token)
- `GET  /api/usuarios` (solo admin)
- `POST /api/usuarios` (solo admin)
- `GET  /api/reuniones` (admin y secretaria)
- `POST /api/reuniones` (solo secretaria)
- `GET  /api/tareas` (solo usuario, ve solo las suyas)
- `PATCH /api/tareas/:id/estado` (solo usuario)

## 3) Frontend

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

El frontend queda corriendo en `http://localhost:5173` y ya apunta al
backend en `http://localhost:4000/api` (puedes cambiarlo en `.env`).

## Flujo

1. El usuario entra a `/login` e ingresa telefono + contrasena.
2. El backend valida contra la tabla `users` (join con `roles`), compara
   la contrasena con bcrypt, y devuelve un token JWT + los datos del user.
3. El frontend guarda el token y redirige segun el rol:
   - admin -> /admin/inicio
   - secretaria -> /secretaria/inicio
   - usuario -> /usuario/inicio
4. Las rutas estan protegidas por rol (`PrivateRoute`), y el backend
   tambien valida el rol en cada endpoint (`checkRole`).

## Notas

- Las contrasenas SIEMPRE se guardan hasheadas con bcrypt, nunca en
  texto plano.
- Puedes agregar mas vistas o endpoints siguiendo el mismo patron:
  controller -> route -> montar en `src/app.js` (backend) y
  page -> ruta protegida en `App.jsx` (frontend).
