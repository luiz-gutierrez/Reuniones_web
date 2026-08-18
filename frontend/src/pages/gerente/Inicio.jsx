import { useAuth } from '../../context/AuthContext';

export default function GerenteInicio() {
  const { user } = useAuth();
  return (
    <div className="page">
      <h2>Bienvenido, {user?.nombre}</h2>
      <p>Panel de gerente. Desde aqui puedes ver y actualizar tus tareas.</p>
    </div>
  );
}
