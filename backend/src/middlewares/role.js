// middlewares/role.js
// Middleware factory: recibe los roles permitidos para una ruta
// Uso: checkRole('Admin') o checkRole('Admin', 'Secretaria')

function checkRole(...rolesPermitidos) {
  return (req, res, next) => {
    console.log('🔍 Verificando rol...');
    console.log('👤 Usuario en req.user:', req.user);
    console.log('📋 Roles permitidos:', rolesPermitidos);
    
    if (!req.user) {
      console.log('❌ Usuario no autenticado');
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    console.log(`👤 Rol del usuario: ${req.user.rol}`);
    
    if (!req.user.rol || !rolesPermitidos.includes(req.user.rol)) {
      console.log(`❌ Acceso denegado. Rol: ${req.user.rol}, Permitidos: ${rolesPermitidos}`);
      return res.status(403).json({ 
        message: `No tienes permisos para acceder a este recurso. Se requiere: ${rolesPermitidos.join(', ')}` 
      });
    }

    console.log('✅ Rol verificado correctamente');
    next();
  };
}

export default checkRole;