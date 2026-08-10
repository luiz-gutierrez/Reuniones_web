-- ============================================================
-- Script complementario. Tu tabla `users` ya existe.
-- Este script crea lo que falta: roles, reuniones, tareas.
-- Ejecutalo en phpMyAdmin (XAMPP) sobre tu base de datos.
-- ============================================================

-- Tabla de roles (necesaria por el FK fk_users_rol de tu tabla users)
CREATE TABLE IF NOT EXISTS roles (
    rol_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (rol_id, nombre_rol) VALUES
    (1, 'admin'),
    (2, 'secretaria'),
    (3, 'usuario')
ON DUPLICATE KEY UPDATE nombre_rol = VALUES(nombre_rol);

-- Tabla de reuniones (vista de la secretaria)
CREATE TABLE IF NOT EXISTS reuniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    creado_por INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reuniones_usuario
        FOREIGN KEY (creado_por) REFERENCES users(id)
        ON DELETE SET NULL
);

-- Tabla de tareas (vista del usuario)
CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado ENUM('pendiente', 'en_proceso', 'completada') NOT NULL DEFAULT 'pendiente',
    fecha_limite DATE,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tareas_usuario
        FOREIGN KEY (usuario_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================================
-- IMPORTANTE sobre contrasenas:
-- La columna users.contrasena debe guardar el HASH bcrypt,
-- nunca la contrasena en texto plano.
--
-- Para crear tu primer usuario admin:
-- 1) Ejecuta:  node sql/hash_password.js "tu_contrasena"
-- 2) Copia el hash que te imprime
-- 3) Usa ese hash en el INSERT de abajo (reemplaza <HASH_AQUI>)
-- ============================================================

-- INSERT INTO users (nombre, apellido, telefono, correo, contrasena, rol_id)
-- VALUES ('Admin', 'Principal', '50000000', 'admin@correo.com', '<HASH_AQUI>', 1);
