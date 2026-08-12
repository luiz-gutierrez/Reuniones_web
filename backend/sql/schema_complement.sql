
-- Base de datos: `diagsa_sistema`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `asi_id` int(11) NOT NULL,
  `asi_estatus` enum('Presente','Ausente') NOT NULL DEFAULT 'Ausente',
  `use_id` int(11) NOT NULL,
  `reu_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamentos`
--

CREATE TABLE `departamentos` (
  `dep_id` int(11) NOT NULL,
  `dep_nombre` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `departamentos`
--

INSERT INTO `departamentos` (`dep_id`, `dep_nombre`, `created_at`, `update_at`) VALUES
(1, 'Administrativo y Finanzas', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(2, 'Comercial', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(3, 'Operativo', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(4, 'Capital Humano', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(5, 'Tesoreria', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(6, 'Inventario', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(7, 'Innovacion y Desarrollo', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(8, 'Contabilidad', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(9, 'Sistemas', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(10, 'Taller', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(11, 'Monitoreo', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(12, 'Supervisores de Zona', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(13, 'Ecommerce', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(14, 'Compras', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(15, 'Ventas de Mayoreo', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(16, 'Mercadotecnia', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(17, 'Logistica', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(18, 'Mantenimiento', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(19, 'Almacen', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(20, 'Garantias', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(21, 'Capacitacion', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(22, 'Reclutamiento y Seleccion', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(23, 'Intendencia', '2026-08-12 05:15:33', '2026-08-12 05:15:33'),
(24, 'Director ', '2026-08-12 05:22:45', '2026-08-12 05:22:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `minutas`
--

CREATE TABLE `minutas` (
  `min_id` int(11) NOT NULL,
  `min_nombre` varchar(150) NOT NULL,
  `min_lugar` varchar(150) DEFAULT NULL,
  `min_descripcion` text DEFAULT NULL,
  `reu_id` int(11) NOT NULL,
  `use_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puestos`
--

CREATE TABLE `puestos` (
  `pue_id` int(11) NOT NULL,
  `pue_nombre` varchar(150) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `dep_id` int(11) DEFAULT NULL,
  `pue_padre_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `puestos`
--

INSERT INTO `puestos` (`pue_id`, `pue_nombre`, `rol_id`, `dep_id`, `pue_padre_id`, `created_at`, `update_at`) VALUES
(1, 'Gerente general', 1, 24, NULL, '2026-08-12 05:34:54', '2026-08-12 05:34:54'),
(2, 'Asistente', 2, NULL, 1, '2026-08-12 05:40:02', '2026-08-12 05:40:02'),
(3, 'Gerente Administrativo y Finanzas', 3, 1, 1, '2026-08-12 05:40:02', '2026-08-12 05:40:02'),
(4, 'Gerente Comercial', 3, 2, 1, '2026-08-12 05:40:02', '2026-08-12 05:40:02'),
(5, 'Gerente Operativo', 3, 3, 1, '2026-08-12 05:40:02', '2026-08-12 05:40:02'),
(6, 'Gerente de Capital Humano', 3, 4, 1, '2026-08-12 05:40:02', '2026-08-12 05:40:02'),
(7, 'Jefe depto Tesoreria', 4, 5, 3, '2026-08-12 05:42:28', '2026-08-12 06:00:02'),
(8, 'Jefe depto Inventario', 4, 6, 3, '2026-08-12 05:48:58', '2026-08-12 06:01:50'),
(9, 'Jefe depto Innovacion y Desarrollo', 4, 7, 3, '2026-08-12 05:48:58', '2026-08-12 06:01:50'),
(10, 'Jefe depto Contabilidad', 4, 8, 3, '2026-08-12 05:48:58', '2026-08-12 06:01:50'),
(11, 'Jefe depto Sistemas', 4, 9, 3, '2026-08-12 05:48:58', '2026-08-12 06:01:50'),
(12, 'Jefe depto Taller', 4, 10, 3, '2026-08-12 05:48:58', '2026-08-12 06:01:50'),
(13, 'Jefe depto Monitoreo', 4, 11, 3, '2026-08-12 05:48:58', '2026-08-12 06:01:50'),
(14, 'Jefe depto Supervisores de Zona', 4, 12, 4, '2026-08-12 05:56:02', '2026-08-12 06:01:50'),
(15, 'Jefe depto Ecommerce', 4, 13, 4, '2026-08-12 05:56:02', '2026-08-12 06:01:50'),
(16, 'Jefe depto Compras', 4, 14, 4, '2026-08-12 05:56:02', '2026-08-12 06:01:50'),
(17, 'Jefe depto Ventas de Mayoreo', 4, 15, 4, '2026-08-12 05:56:02', '2026-08-12 06:01:50'),
(18, 'Jefe depto Mercadotecnia', 4, 16, 4, '2026-08-12 05:56:02', '2026-08-12 06:01:50'),
(19, 'Jefe depto Logistica', 4, 17, 5, '2026-08-12 06:04:38', '2026-08-12 06:04:38'),
(20, 'Jefe depto Mantenimiento', 4, 18, 5, '2026-08-12 06:04:38', '2026-08-12 06:04:38'),
(21, 'Jefe depto Almacen', 4, 19, 5, '2026-08-12 06:05:17', '2026-08-12 06:05:17'),
(22, 'Jefe depto Garantias', 4, 20, 5, '2026-08-12 06:05:17', '2026-08-12 06:05:17'),
(23, 'Jefe depto Capacitacion', 4, 21, 6, '2026-08-12 06:07:07', '2026-08-12 06:12:05'),
(24, 'Jefe depto Reclutamiento y Seleccion', 4, 22, 6, '2026-08-12 06:11:32', '2026-08-12 06:11:32'),
(25, 'Jefe depto Intendencia', 4, 23, 6, '2026-08-12 06:11:32', '2026-08-12 06:11:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reuniones`
--

CREATE TABLE `reuniones` (
  `reu_id` int(11) NOT NULL,
  `reu_nombre` varchar(150) NOT NULL,
  `reu_descripcion` text DEFAULT NULL,
  `reu_lugar` varchar(150) DEFAULT NULL,
  `reu_fecha` date NOT NULL,
  `reu_hora` time NOT NULL,
  `use_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `rol_id` int(11) NOT NULL,
  `rol_nombre` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`rol_id`, `rol_nombre`, `created_at`, `update_at`) VALUES
(1, 'Admin', '2026-08-12 05:00:21', '2026-08-12 05:00:21'),
(2, 'Asistente', '2026-08-12 05:00:21', '2026-08-12 05:00:21'),
(3, 'Gerente', '2026-08-12 05:00:21', '2026-08-12 05:00:21'),
(4, 'JefeDepto', '2026-08-12 05:00:21', '2026-08-12 15:47:10'),
(5, 'Auxiliar', '2026-08-12 05:00:21', '2026-08-12 05:00:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `tar_id` int(11) NOT NULL,
  `tar_nombre` varchar(150) NOT NULL,
  `tar_descripcion` text DEFAULT NULL,
  `tar_estatus` enum('Realizar','Proceso','Finalizado') NOT NULL DEFAULT 'Realizar',
  `tar_prioridad` enum('baja','media','alta') NOT NULL DEFAULT 'media',
  `tar_fecha` date NOT NULL,
  `use_id` int(11) DEFAULT NULL,
  `min_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `apellido` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(150) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `contrasena` varchar(255) NOT NULL,
  `pue_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `apellido`, `telefono`, `correo`, `activo`, `contrasena`, `pue_id`, `created_at`, `update_at`) VALUES
(2, 'Arnulfo', 'Perez', '1234567890', 'arnulfo@gmail.com', 1, '$2a$10$Kh5tBS2tHLWNtoJHI9H6Feq.icaoJdNCDw1THNXA23BSi7yj4PsRu', 1, '2026-08-12 16:21:16', '2026-08-12 16:21:16');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`asi_id`),
  ADD UNIQUE KEY `uq_asistencia_user_reunion` (`use_id`,`reu_id`),
  ADD KEY `fk_asistencias_reunion` (`reu_id`);

--
-- Indices de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  ADD PRIMARY KEY (`dep_id`);

--
-- Indices de la tabla `minutas`
--
ALTER TABLE `minutas`
  ADD PRIMARY KEY (`min_id`),
  ADD KEY `fk_minutas_reunion` (`reu_id`),
  ADD KEY `fk_minutas_user` (`use_id`);

--
-- Indices de la tabla `puestos`
--
ALTER TABLE `puestos`
  ADD PRIMARY KEY (`pue_id`),
  ADD KEY `fk_puestos_rol` (`rol_id`),
  ADD KEY `fk_puestos_departamento` (`dep_id`),
  ADD KEY `fk_puestos_padre` (`pue_padre_id`);

--
-- Indices de la tabla `reuniones`
--
ALTER TABLE `reuniones`
  ADD PRIMARY KEY (`reu_id`),
  ADD KEY `fk_reuniones_organizador` (`use_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`rol_id`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`tar_id`),
  ADD KEY `fk_tareas_user` (`use_id`),
  ADD KEY `fk_tareas_minuta` (`min_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD KEY `fk_users_puesto` (`pue_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `asi_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  MODIFY `dep_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `minutas`
--
ALTER TABLE `minutas`
  MODIFY `min_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `puestos`
--
ALTER TABLE `puestos`
  MODIFY `pue_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `reuniones`
--
ALTER TABLE `reuniones`
  MODIFY `reu_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `tar_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `fk_asistencias_reunion` FOREIGN KEY (`reu_id`) REFERENCES `reuniones` (`reu_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asistencias_user` FOREIGN KEY (`use_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `minutas`
--
ALTER TABLE `minutas`
  ADD CONSTRAINT `fk_minutas_reunion` FOREIGN KEY (`reu_id`) REFERENCES `reuniones` (`reu_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_minutas_user` FOREIGN KEY (`use_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `puestos`
--
ALTER TABLE `puestos`
  ADD CONSTRAINT `fk_puestos_departamento` FOREIGN KEY (`dep_id`) REFERENCES `departamentos` (`dep_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_puestos_padre` FOREIGN KEY (`pue_padre_id`) REFERENCES `puestos` (`pue_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_puestos_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`rol_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `reuniones`
--
ALTER TABLE `reuniones`
  ADD CONSTRAINT `fk_reuniones_organizador` FOREIGN KEY (`use_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `fk_tareas_minuta` FOREIGN KEY (`min_id`) REFERENCES `minutas` (`min_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tareas_user` FOREIGN KEY (`use_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_puesto` FOREIGN KEY (`pue_id`) REFERENCES `puestos` (`pue_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
