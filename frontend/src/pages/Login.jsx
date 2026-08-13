import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ==========================================
// Rutas dependiendo del rol
// ==========================================
const RUTAS_POR_ROL = {
  Admin: '/admin/inicio',
  Secretaria: '/asistente/inicio',
  Gerente: '/gerente/inicio',
  JefeDepto: '/jefe_depto/inicio',
  Usuario: '/usuario/inicio'
};

export default function Login() {
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // Enviar formulario
  // ==========================================
  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setCargando(true);

    try {
      // Login
      const user = await login(
        telefono,
        contrasena
      );

      console.log('Usuario:', user);
      console.log('Rol:', user.rol);

      // Buscar ruta dependiendo del rol
      const ruta = RUTAS_POR_ROL[user.rol];

      // Si el rol no tiene ruta
      if (!ruta) {
        setError(
          `El rol "${user.rol}" no tiene una ruta configurada.`
        );

        return;
      }

      // Redireccionar
      navigate(ruta);

    } catch (err) {
      console.error(
        'Error al iniciar sesión:',
        err
      );

      const mensaje =
        err.response?.data?.message ||
        'Error al iniciar sesión';

      setError(mensaje);

    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">

      <form
        className="login-card"
        onSubmit={handleSubmit}
      >

        <h1>Iniciar sesión</h1>

        {/* TELÉFONO */}
        <label htmlFor="telefono">
          Teléfono
        </label>

        <input
          id="telefono"
          type="text"
          value={telefono}
          onChange={(e) =>
            setTelefono(e.target.value)
          }
          placeholder="Ej: 50000000"
          required
        />

        {/* contrasena */}
        <label htmlFor="contrasena">
          contrasena
        </label>

        <input
          id="contrasena"
          type="password"
          value={contrasena}
          onChange={(e) =>
            setContrasena(e.target.value)
          }
          placeholder="********"
          required
        />

        {/* ERROR */}
        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={cargando}
        >
          {cargando
            ? 'Ingresando...'
            : 'Ingresar'}
        </button>

      </form>

    </div>
  );
}