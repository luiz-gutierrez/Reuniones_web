// Middleware factory: recibe los roles permitidos para una ruta
// Uso: checkRole('admin') o checkRole('admin', 'secretaria')
function checkRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
    }
    next();
  };
}

export default checkRole;
