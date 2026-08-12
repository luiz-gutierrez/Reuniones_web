import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión cuando se carga la aplicación
  useEffect(() => {
    async function verificarSesion() {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // No hay sesión guardada
      if (!token || !storedUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Primero recuperamos el usuario guardado
        const usuarioGuardado = JSON.parse(storedUser);
        setUser(usuarioGuardado);

        // Después verificamos el token con el backend
        const { data } = await api.get('/auth/me');

        // Actualizamos la información del usuario
        setUser(data);

        localStorage.setItem(
          'user',
          JSON.stringify(data)
        );

      } catch (error) {
        console.error('Error al verificar sesión:', error);

        // Token inválido o expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);

      } finally {
        setLoading(false);
      }
    }

    verificarSesion();
  }, []);

  // Iniciar sesión
  async function login(telefono, contrasena) {
    try {
      const { data } = await api.post('/auth/login', {
        telefono,
        contrasena
      });

      // Guardar token
      localStorage.setItem('token', data.token);

      // Guardar usuario
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      // Actualizar estado
      setUser(data.user);

      return data.user;

    } catch (error) {
      console.error('Error al iniciar sesión:', error);

      throw error;
    }
  }

  // Cerrar sesión
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}