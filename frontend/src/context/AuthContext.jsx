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
const login = async (telefono, contrasena) => {
  try {
    const response = await api.post('/auth/login', {
      telefono,
      contrasena
    });

    const { token, user } = response.data;

    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(user);
    return user;

  } catch (error) {
    console.error('Error en login:', error);
    
    // ✅ Manejar error específico de usuario desactivado
    if (error.response?.status === 403) {
      throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Teléfono o contraseña incorrectos');
    }
    
    throw new Error('Error al iniciar sesión');
  }
};

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