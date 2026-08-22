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
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

// ==========================================
// Rutas dependiendo del rol
// ==========================================
const RUTAS_POR_ROL = {
  Admin: '/admin/inicio',
  Director: '/director/inicio',
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

    // Validar teléfono - solo números y 10 dígitos
    const telefonoLimpio = telefono.replace(/\D/g, '');
    
    if (!telefonoLimpio) {
      setError('El teléfono es obligatorio');
      return;
    }

    if (telefonoLimpio.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos');
      return;
    }

    if (!contrasena.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    if (contrasena.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setError('');
    setCargando(true);

    try {
      const user = await login(telefonoLimpio, contrasena);
      console.log('✅ Usuario:', user);

      const ruta = RUTAS_POR_ROL[user.rol];

      if (!ruta) {
        setError(`El rol "${user.rol}" no tiene una ruta configurada.`);
        setCargando(false);
        return;
      }

      navigate(ruta);

    } catch (err) {
      console.error('Error:', err);
      
      // ✅ Mensajes específicos según el error
      const mensaje = err.response?.data?.message || '';
      
      if (mensaje.includes('contraseña') || mensaje.includes('password') || mensaje.includes('incorrecta')) {
        setError('❌ Contraseña incorrecta. Verifica tus datos.');
      } else if (mensaje.includes('no encontrado') || mensaje.includes('No existe') || err.response?.status === 404) {
        setError('❌ Número no registrado. Verifica tus datos.');
      } else {
        setError('❌ Usuario o contraseña incorrectos. Verifica tus datos.');
      }
    } finally {
      setCargando(false);
    }
  }

  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setTelefono(value);
    }
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-600/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={telefono}
                  onChange={handleTelefonoChange}
                  placeholder="Ej: 5000000000"
                  maxLength={10}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all duration-200
                           placeholder-gray-400 text-gray-700
                           ${error && error.includes('teléfono') 
                             ? 'border-red-400 bg-red-50' 
                             : 'border-gray-200'
                           }`}
                  disabled={cargando}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => {
                    setContrasena(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="********"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all duration-200
                           placeholder-gray-400 text-gray-700"
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 
                           hover:text-gray-600 transition-colors"
                  disabled={cargando}
                >
                  {mostrarContrasena ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-start gap-2">
                <span>{error}</span>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando || telefono.length !== 10}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                       py-3 rounded-xl font-semibold text-lg
                       transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30
                       hover:scale-[1.02] active:scale-[0.98]
                       flex items-center justify-center gap-3
                       ${(cargando || telefono.length !== 10) 
                         ? 'opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none' 
                         : ''
                       }`}
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