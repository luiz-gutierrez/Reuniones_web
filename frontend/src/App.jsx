import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';

import AdminInicio from './pages/admin/Inicio';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminTareas from './pages/admin/Tareas';

import AsistenteInicio from './pages/asistente/Inicio';
import AsistenteReuniones from './pages/asistente/Reuniones';
import AsistenteAgenda from './pages/asistente/Agenda';
import AsistenteReunionDetalle from './pages/asistente/ReunionDetalle';
import AsistenteMinutas from './pages/asistente/Minutas';

import GerenteInicio from './pages/gerente/Inicio';
import GerenteTareas from './pages/gerente/Tareas';
import Reuniones from './pages/gerente/Reuniones';
import ReunionDetalle from './pages/gerente/ReunionDetalle';


import JefeDeptoInicio from './pages/jefe_depto/Inicio';
import Tareas from './pages/jefe_depto/Tareas';
import ReunionesJD from './pages/jefe_depto/ReunionesJD';
import ReunionDetalleJD from './pages/jefe_depto/ReunionDetalleJD';

import UsuarioInicio from './pages/usuario/Inicio';
import UsuarioTareas from './pages/usuario/Tareas';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas del admin */}
        <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/inicio" element={<AdminInicio />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/tareas" element={<AdminTareas />} />
          </Route>
        </Route>

        {/* Rutas de la secretaria */}
        <Route element={<PrivateRoute allowedRoles={['Secretaria']} />}>
          <Route element={<MainLayout />}>
            <Route path="/asistente/inicio" element={<AsistenteInicio />} />
            <Route path="/asistente/reuniones" element={<AsistenteReuniones />} />
            <Route path="/asistente/agenda" element={<AsistenteAgenda />} />
            <Route path="/asistente/reunion-detalle/:id" element={<AsistenteReunionDetalle />} />
            <Route path="/asistente/minutas/:id" element={<AsistenteMinutas />} />
          </Route>
        </Route>

        {/* Rutas del gerente */}
        <Route element={<PrivateRoute allowedRoles={['Gerente']} />}>
          <Route element={<MainLayout />}>
            <Route path="/gerente/inicio" element={<GerenteInicio />} />
            <Route path="/gerente/tareas" element={<GerenteTareas />} />
            <Route path="/gerente/reuniones" element={<Reuniones />} />
            <Route path="/gerente/reunion/:id" element={<ReunionDetalle />} />          
          </Route>
        </Route>

        {/* Rutas del jefe de departamento */}
        <Route element={<PrivateRoute allowedRoles={['JefeDepto']} />}>
          <Route element={<MainLayout />}>
            <Route path="/jefe_depto/inicio" element={<JefeDeptoInicio />} />
            <Route path="/jefe_depto/tareas" element={<Tareas />} />
            <Route path="/jefe_depto/reuniones" element={<ReunionesJD />} />
            <Route path="/jefe_depto/reunion/:id" element={<ReunionDetalleJD />} />   
          </Route>
        </Route>

        {/* Rutas del usuario */}
        <Route element={<PrivateRoute allowedRoles={['Usuario']} />}>
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
