import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';

import AdminInicio from './pages/admin/Inicio';
import AdminUsuarios from './pages/admin/Usuarios';

import SecretariaInicio from './pages/secretaria/Inicio';
import SecretariaReuniones from './pages/secretaria/Reuniones';

import UsuarioInicio from './pages/usuario/Inicio';
import UsuarioTareas from './pages/usuario/Tareas';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas del admin */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/inicio" element={<AdminInicio />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          </Route>
        </Route>

        {/* Rutas de la secretaria */}
        <Route element={<PrivateRoute allowedRoles={['secretaria']} />}>
          <Route element={<MainLayout />}>
            <Route path="/secretaria/inicio" element={<SecretariaInicio />} />
            <Route path="/secretaria/reuniones" element={<SecretariaReuniones />} />
          </Route>
        </Route>

        {/* Rutas del usuario */}
        <Route element={<PrivateRoute allowedRoles={['usuario']} />}>
          <Route element={<MainLayout />}>
            <Route path="/usuario/inicio" element={<UsuarioInicio />} />
            <Route path="/usuario/tareas" element={<UsuarioTareas />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
