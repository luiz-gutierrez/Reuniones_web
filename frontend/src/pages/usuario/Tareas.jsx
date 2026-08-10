import { useEffect, useState } from 'react';
import api from '../../api/axios';

const ESTADOS = ['pendiente', 'en_proceso', 'completada'];

export default function UsuarioTareas() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarTareas();
  }, []);

  async function cargarTareas() {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/tareas');
      setTareas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tareas');
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.patch(`/tareas/${id}/estado`, { estado });
      await cargarTareas();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar tarea');
    }
  }

  return (
    <div className="page">
      <h2>Mis tareas</h2>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error-text">{error}</p>}

      {!cargando && !error && tareas.length === 0 && (
        <p>No tienes tareas asignadas.</p>
      )}

      {!cargando && !error && tareas.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Descripcion</th>
              <th>Fecha limite</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tareas.map((t) => (
              <tr key={t.id}>
                <td>{t.titulo}</td>
                <td>{t.descripcion}</td>
                <td>{t.fecha_limite}</td>
                <td>
                  <select
                    value={t.estado}
                    onChange={(e) => cambiarEstado(t.id, e.target.value)}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
