// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaPhone, 
  FaLock, 
  FaSignInAlt, 
  FaSpinner,
  FaUserShield,
  FaBuilding,
  FaUserTie,
  FaUsers,
  FaUser
} from 'react-icons/fa';
import { MdEmail, MdPhoneAndroid } from 'react-icons/md';

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
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // Enviar formulario
  // ==========================================
  async function handleSubmit(e) {
    e.preventDefault();

    // Validar que el teléfono tenga al menos 8 dígitos
    if (telefono.length < 8) {
      setError('El teléfono debe tener al menos 8 dígitos');
      return;
    }

    setError('');
    setCargando(true);

    try {
      // Login
      const user = await login(telefono, contrasena);

      console.log('Usuario:', user);
      console.log('Rol:', user.rol);

      // Buscar ruta dependiendo del rol
      const ruta = RUTAS_POR_ROL[user.rol];

      // Si el rol no tiene ruta
      if (!ruta) {
        setError(`El rol "${user.rol}" no tiene una ruta configurada.`);
        return;
      }

      // Redireccionar
      navigate(ruta);

    } catch (err) {
      console.error('Error al iniciar sesión:', err);

      const mensaje = err.response?.data?.message || 'Error al iniciar sesión';
      setError(mensaje);

    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-600/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  Número de Teléfono
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 50000000"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all duration-200
                           placeholder-gray-400 text-gray-700"
                  required
                  disabled={cargando}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Ingresa solo números (8 dígitos)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  Contraseña
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="********"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all duration-200
                           placeholder-gray-400 text-gray-700"
                  required
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 
                           hover:text-gray-600 transition-colors"
                  disabled={cargando}
                >
                  {mostrarContrasena ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl 
                              flex items-start gap-2 animate-shake">
                <span className="text-lg">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                       py-3 rounded-xl font-semibold text-lg
                       transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30
                       hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-3"
            >
              {cargando ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  Ingresar
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      
    </div>
  );
}