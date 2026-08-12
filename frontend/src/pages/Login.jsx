import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RUTAS_POR_ROL = {
  Admin: '/admin/inicio',
  Asistente: '/asistente/inicio',
  Usuario: '/usuario/inicio'
};

export default function Login() {
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const user = await login(telefono, contrasena);
      navigate(RUTAS_POR_ROL[user.rol] || '/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesion';
      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Iniciar sesion</h1>

        <label htmlFor="telefono">Telefono</label>
        <input
          id="telefono"
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ej: 50000000"
          required
        />

        <label htmlFor="contrasena">Contrasena</label>
        <input
          id="contrasena"
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="********"
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
