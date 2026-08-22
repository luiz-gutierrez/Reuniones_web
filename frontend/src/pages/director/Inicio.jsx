import { useAuth } from '../../context/AuthContext';

export default function DirectorInicio() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h2>Bienvenido, {user?.nombre}</h2>
      <p>Panel de administrador. Desde aqui puedes gestionar los usuarios del sistema.</p>
    </div>
  );
}
