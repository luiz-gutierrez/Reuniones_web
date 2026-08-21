// middlewares/role.js
// Middleware factory: recibe los roles permitidos para una ruta

function checkRole(...rolesPermitidos) {
  return (req, res, next) => {
    console.log('🔍 Verificando rol...');
    console.log('👤 Usuario en req.user:', req.user);
    console.log('📋 Roles permitidos:', rolesPermitidos);
    
    if (!req.user) {
      console.log('❌ Usuario no autenticado');
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no autenticado' 
      });
    }

    // Obtener el rol del usuario (puede ser por nombre o por ID)
    const userRol = req.user.rol;
    const userRolId = req.user.rol_id;

    console.log(`👤 Rol del usuario: ${userRol} (ID: ${userRolId})`);
    
    // Verificar si el rol está permitido (por nombre o por ID)
    const tienePermiso = rolesPermitidos.some(rol => {
      // Comparar por nombre
      if (userRol && userRol === rol) return true;
      // Comparar por ID (si el rol permitido es un número)
      if (userRolId && parseInt(rol) === userRolId) return true;
      return false;
    });
    
    if (!tienePermiso) {
      console.log(`❌ Acceso denegado. Rol: ${userRol}, Permitidos: ${rolesPermitidos}`);
      return res.status(403).json({ 
        success: false,
        message: `No tienes permisos para acceder a este recurso. Se requiere: ${rolesPermitidos.join(', ')}`,
        tu_rol: userRol || 'Usuario',
        roles_permitidos: rolesPermitidos
      });
    }

    console.log('✅ Rol verificado correctamente');
    next();
  };
}

export default checkRole;