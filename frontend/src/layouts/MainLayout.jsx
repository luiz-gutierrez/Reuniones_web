import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaUsers, 
  FaTasks, 
  FaCalendarAlt, 
  FaClipboardList,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaBell,
  FaCog,
  FaUser,
  FaBuilding,
  FaCalendarCheck,
  FaUserTie
} from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

// Iconos para cada menú
const ICONOS_MENU = {
  'Inicio': <FaHome className="text-lg" />,
  'Usuarios': <FaUsers className="text-lg" />,
  'Tareas': <FaTasks className="text-lg" />,
  'Reuniones': <FaCalendarAlt className="text-lg" />,
  'Agenda': <FaClipboardList className="text-lg" />,
};

// Colores por rol
const COLORES_ROL = {
  Admin: 'bg-gradient-to-r from-purple-600 to-indigo-600',
  Secretaria: 'bg-gradient-to-r from-pink-500 to-rose-500',
  Gerente: 'bg-gradient-to-r from-blue-600 to-cyan-600',
  JefeDepto: 'bg-gradient-to-r from-emerald-600 to-teal-600',
  Usuario: 'bg-gradient-to-r from-gray-600 to-gray-700'
};

const MENUS = {
  Admin: [
    { to: '/admin/inicio', label: 'Inicio' },
    { to: '/admin/usuarios', label: 'Usuarios' },
<<<<<<< HEAD
    { to: '/admin/tareas', label: 'Tareas' },
    { to: '/admin/reuniones', label: 'Reuniones' }

=======
    { to: '/admin/tareas', label: 'Tareas' }
>>>>>>> b7e223894a20e5524b6d7106a4ba5b75da51baf2
  ],
  Secretaria: [
    { to: '/asistente/inicio', label: 'Inicio' },
    { to: '/asistente/reuniones', label: 'Reuniones' },
    { to: '/asistente/agenda', label: 'Agenda' }
  ],
  Gerente: [
    { to: '/gerente/inicio', label: 'Inicio' },
    { to: '/gerente/tareas', label: 'Tareas' },
    { to: '/gerente/reuniones', label: 'Reuniones' },
  ],
  JefeDepto: [
    { to: '/jefe_depto/inicio', label: 'Inicio' },
    { to: '/jefe_depto/tareas', label: 'Tareas' },
    { to: '/jefe_depto/reuniones', label: 'Reuniones' },
  ],
  Usuario: [
    { to: '/usuario/inicio', label: 'Inicio' },
    { to: '/usuario/tareas', label: 'Tareas' }
  ]
};

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  const menu = user ? MENUS[user.rol] || [] : [];
  const colorRol = user ? COLORES_ROL[user.rol] || 'bg-gradient-to-r from-gray-600 to-gray-700' : '';

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!user?.nombre) return '?';
    const nombres = user.nombre.split(' ');
    const apellidos = user.apellido?.split(' ') || [];
    return `${nombres[0]?.[0] || ''}${apellidos[0]?.[0] || ''}`.toUpperCase();
  };

  // Verificar si el link está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className={`w-10 h-10 rounded-xl ${colorRol} flex items-center justify-center text-white font-bold shadow-lg transform transition-transform group-hover:scale-105`}>
                  <FaCalendarCheck className="text-xl" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-800">Sistema</span>
                  <span className="text-xs text-gray-400 block -mt-1">Gestión de Reuniones</span>
                </div>
              </Link>
            </div>

            {/* Menú desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {menu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive(item.to)
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {ICONOS_MENU[item.label] || <FaUser className="text-lg" />}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User menu desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dropdown de usuario */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${colorRol} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {getInitials()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 leading-tight">
                      {user?.nombre} {user?.apellido || ''}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">{user?.rol}</p>
                  </div>
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform ${dropdownAbierto ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownAbierto && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user?.nombre} {user?.apellido || ''}</p>
                      <p className="text-xs text-gray-500">{user?.correo}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FaUserTie className="text-xs" />
                        {user?.rol}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownAbierto(false);
                        // Aquí puedes agregar navegación a perfil
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaUser className="text-gray-400" />
                      Mi Perfil
                    </button>
                    <button
                      onClick={() => {
                        setDropdownAbierto(false);
                        // Aquí puedes agregar navegación a configuración
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaCog className="text-gray-400" />
                      Configuración
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setDropdownAbierto(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="text-red-400" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Botón menú móvil */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {menuAbierto ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {menuAbierto && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {menu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuAbierto(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                    isActive(item.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {ICONOS_MENU[item.label] || <FaUser className="text-lg" />}
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 my-2"></div>
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Contenido principal */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}