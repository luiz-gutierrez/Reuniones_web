import { useAuth } from '../../context/AuthContext';

export default function SecretariaInicio() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h2>Bienvenida, {user?.nombre}</h2>
      <p>Panel de secretaria. Desde aqui puedes gestionar las reuniones.</p>
    </div>
  );
}
