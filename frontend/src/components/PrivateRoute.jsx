import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles: array de roles permitidos, ej: ['admin']
export default function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
