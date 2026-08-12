import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function SecretariaReuniones() {
  const [reuniones, setReuniones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [nombre, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarReuniones();
  }, []);

  async function cargarReuniones() {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/reuniones');
      setReuniones(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reuniones');
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(e) {
  e.preventDefault();
  setGuardando(true);
  setError('');

  try {
    await api.post('/reuniones', {
      nombre,
      descripcion,
      lugar,
      fecha,
      hora
    });

    setTitulo('');
    setDescripcion('');
    setLugar('');
    setFecha('');
    setHora('');

    await cargarReuniones();

  } catch (err) {
    setError(
      err.response?.data?.message || 'Error al crear reunión'
    );
  } finally {
    setGuardando(false);
  }
}

  return (
    <div className="page">
      <h2>Reuniones</h2>

      <form className="inline-form" onSubmit={handleCrear}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
           <input
          type="text"
          placeholder="Lugar de la reunion"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          required
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Agregar reunion'}
        </button>
      </form>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error-text">{error}</p>}

      {!cargando && !error && (
        <table className="table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Lugar</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Creada por</th>
            </tr>
          </thead>
          <tbody>
  {reuniones.map((r) => (
    <tr key={r.reu_id}>
      <td>{r.reu_id}</td>
      <td>{r.reu_nombre}</td>
      <td>{r.reu_descripcion}</td>
      <td>{r.reu_lugar}</td>
      <td>{r.reu_fecha}</td>
      <td>{r.reu_hora}</td>
      <td>{r.creado_por_nombre}</td>
    </tr>
  ))}
</tbody>
        </table>
      )}
    </div>
  );
}
