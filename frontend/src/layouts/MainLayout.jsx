import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENUS = {
  Admin: [
    { to: '/admin/inicio', label: 'Inicio' },
    { to: '/admin/usuarios', label: 'Usuarios' }
  ],
  Secretaria: [
    { to: '/asistente/inicio', label: 'Inicio' },
    { to: '/asistente/reuniones', label: 'Reuniones' },
    { to: '/asistente/agenda', label: 'Agenda' }
  ],
  Usuario: [
    { to: '/usuario/inicio', label: 'Inicio' },
    { to: '/usuario/tareas', label: 'Tareas' }
  ]
};

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = user ? MENUS[user.rol] || [] : [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-title">Sistema</div>
        <nav className="topbar-nav">
          {menu.map((item) => (
            <Link key={item.to} to={item.to}>{item.label}</Link>
          ))}
        </nav>
        <div className="topbar-user">
          <span>{user?.nombre} ({user?.rol})</span>
          <button onClick={handleLogout}>Cerrar sesion</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
