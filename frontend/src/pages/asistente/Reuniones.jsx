import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  FaSave,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaUsers,
  FaCheck,
  FaUserPlus,
  FaPlus
} from 'react-icons/fa';

export default function SecretariaReuniones() {
  // ========== ESTADOS PRINCIPALES ==========
  const [reuniones, setReuniones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // ========== ESTADO PARA CREAR REUNIÓN ==========
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formReunion, setFormReunion] = useState({
    nombre: '',
    descripcion: '',
    lugar: '',
    fecha: '',
    hora: ''
  });
  const [invitados, setInvitados] = useState([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  // ========== ESTADO PARA EDITAR ASISTENTES ==========
  const [mostrarModalAsistentes, setMostrarModalAsistentes] = useState(false);
  const [reunionSeleccionada, setReunionSeleccionada] = useState(null);
  const [asistentesSeleccionados, setAsistentesSeleccionados] = useState([]);
  const [asistentesGuardados, setAsistentesGuardados] = useState([]);
  const [guardandoAsistentes, setGuardandoAsistentes] = useState(false);
  const [busquedaAsistente, setBusquedaAsistente] = useState('');

  // ========== EFFECTS ==========
  useEffect(() => {
    cargarReuniones();
    cargarUsuarios();
  }, []);

  // ========== FUNCIONES DE CARGA ==========
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

  async function cargarUsuarios() {
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  }

  // ========== FUNCIONES PARA CREAR REUNIÓN ==========
  const abrirModalCrear = () => {
    setFormReunion({
      nombre: '',
      descripcion: '',
      lugar: '',
      fecha: '',
      hora: ''
    });
    setInvitados([]);
    setBusquedaUsuario('');
    setError('');
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormReunion({
      nombre: '',
      descripcion: '',
      lugar: '',
      fecha: '',
      hora: ''
    });
    setInvitados([]);
    setBusquedaUsuario('');
    setError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormReunion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleInvitado = (userId) => {
    setInvitados(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');

    if (invitados.length < 2) {
      setError('Debes seleccionar al menos 2 invitados para la reunión');
      setGuardando(false);
      return;
    }

    try {
      await api.post('/reuniones', {
        ...formReunion,
        invitados
      });

      cerrarModalCrear();
      await cargarReuniones();
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al crear reunión';
      setError(mensaje);
      console.error('❌ Error:', err);
    } finally {
      setGuardando(false);
    }
  };

  // ========== FUNCIONES PARA EDITAR ASISTENTES ==========
  const abrirModalAsistentes = async (reunion) => {
    setReunionSeleccionada(reunion);
    setAsistentesSeleccionados([]);
    setBusquedaAsistente('');

    try {
      const { data } = await api.get(`/reuniones/${reunion.reu_id}/invitados`);
      setAsistentesGuardados(data);
      const idsGuardados = data.map(a => a.use_id);
      setAsistentesSeleccionados(idsGuardados);
    } catch (err) {
      console.error('Error al cargar asistentes:', err);
      setAsistentesGuardados([]);
      setAsistentesSeleccionados([]);
    }

    setMostrarModalAsistentes(true);
  };

  const cerrarModalAsistentes = () => {
    setMostrarModalAsistentes(false);
    setReunionSeleccionada(null);
    setAsistentesSeleccionados([]);
    setAsistentesGuardados([]);
    setError('');
    setBusquedaAsistente('');
  };

  const toggleAsistente = (userId) => {
    setAsistentesSeleccionados(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const guardarAsistentes = async () => {
    if (!reunionSeleccionada) return;

    setGuardandoAsistentes(true);
    setError('');

    try {
      await api.put(`/reuniones/${reunionSeleccionada.reu_id}/invitados`, {
        invitados: asistentesSeleccionados
      });

      const { data } = await api.get(`/reuniones/${reunionSeleccionada.reu_id}/invitados`);
      setAsistentesGuardados(data);

      alert('✅ Asistentes actualizados correctamente');
      cerrarModalAsistentes();
      await cargarReuniones();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar asistentes');
      console.error('❌ Error al guardar asistentes:', err);
    } finally {
      setGuardandoAsistentes(false);
    }
  };

  // ========== FUNCIONES DE UTILIDAD ==========
  const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };

  // ========== FILTROS ==========
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.apellido.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.correo.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  const asistentesFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busquedaAsistente.toLowerCase()) ||
    u.apellido.toLowerCase().includes(busquedaAsistente.toLowerCase()) ||
    u.correo.toLowerCase().includes(busquedaAsistente.toLowerCase())
  );

  // ========== RENDER ==========
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 m-0">
            📋 Reuniones
          </h1>
          <p className="text-slate-800 opacity-60 mt-1">
            Gestiona todas las reuniones programadas
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-blue-600 text-white border-none rounded-xl px-6 py-3 cursor-pointer flex items-center gap-2 font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/40 shadow-md shadow-blue-600/30"
        >
          <FaPlus /> Nueva Reunión
        </button>
      </div>

      {/* ===== ESTADOS DE CARGA ===== */}
      {cargando && (
        <div className="text-center py-12 text-slate-800 opacity-60">
          <FaSpinner className="text-4xl animate-spin mx-auto" />
          <p className="mt-2">Cargando reuniones...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* ===== LISTA DE REUNIONES ===== */}
      {!cargando && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reuniones.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-800 opacity-40">
              <p className="text-lg">No hay reuniones programadas</p>
              <p className="text-sm">Haz clic en "Nueva Reunión" para crear una</p>
            </div>
          ) : (
            reuniones.map((r) => (
              <div
                key={r.reu_id}
                className="bg-white rounded-2xl p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg border-l-4 border-l-blue-600"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-slate-800 m-0">
                    {r.reu_nombre}
                  </h3>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <FaUsers size={12} />
                      {r.total_invitados || 0}
                    </span>
                    <button
                      onClick={() => abrirModalAsistentes(r)}
                      className="bg-blue-600 text-white border-none rounded-lg px-3 py-1 cursor-pointer text-xs transition-all hover:opacity-80"
                    >
                      Editar
                    </button>
                  </div>
                </div>

                {r.reu_descripcion && (
                  <p className="text-sm text-slate-800 opacity-70 my-2">
                    {r.reu_descripcion}
                  </p>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-slate-800 text-sm">
                    <FaCalendarAlt className="text-blue-600" />
                    <span>{formatearFecha(r.reu_fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 text-sm">
                    <FaClock className="text-blue-600" />
                    <span>{r.reu_hora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 text-sm opacity-60">
                    <FaUser className="text-blue-600" />
                    <span>Creada por: {r.creado_por_nombre}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== MODAL CREAR REUNIÓN ===== */}
      {mostrarModalCrear && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModalCrear}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 m-0">
                <FaUserPlus className="inline mr-2" />
                Nueva Reunión
              </h2>
              <button
                onClick={cerrarModalCrear}
                className="bg-none border-none text-2xl text-slate-800 opacity-40 cursor-pointer hover:opacity-60 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCrear}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre de la reunión"
                    value={formReunion.nombre}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                {/* Lugar */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Lugar *
                  </label>
                  <input
                    type="text"
                    name="lugar"
                    placeholder="Lugar de la reunión"
                    value={formReunion.lugar}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formReunion.fecha}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="hora"
                    value={formReunion.hora}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                {/* Descripción */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    placeholder="Descripción de la reunión"
                    value={formReunion.descripcion}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border resize-y font-inherit transition-all"
                  />
                </div>

                {/* Invitados */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    <FaUsers className="inline mr-2" />
                    Invitados * ({invitados.length} seleccionados)
                  </label>

                  <div className="bg-slate-50 rounded-lg p-3 mb-3 flex items-center gap-3">
                    <FaSearch className="text-slate-800 opacity-40" />
                    <input
                      type="text"
                      placeholder="Buscar usuarios para invitar..."
                      value={busquedaUsuario}
                      onChange={(e) => setBusquedaUsuario(e.target.value)}
                      className="flex-1 border-none outline-none text-sm text-slate-800 bg-transparent"
                    />
                    {invitados.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setInvitados([])}
                        className="px-3 py-1 bg-red-100 border-none rounded text-red-800 cursor-pointer text-xs transition-all hover:bg-red-200"
                      >
                        Limpiar todos
                      </button>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                    {usuariosFiltrados.length === 0 ? (
                      <p className="text-center text-slate-800 opacity-40 py-4">
                        {busquedaUsuario ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                      </p>
                    ) : (
                      usuariosFiltrados.map((u) => {
                        const seleccionado = invitados.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => toggleInvitado(u.id)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                              seleccionado
                                ? 'bg-blue-100 border border-blue-600'
                                : 'bg-transparent border border-transparent hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${
                              seleccionado ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">
                                {u.nombre} {u.apellido}
                              </div>
                              <div className="text-xs text-slate-800 opacity-50">
                                {u.correo}
                              </div>
                            </div>
                            {seleccionado && (
                              <FaCheck className="text-blue-600" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm mt-4">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={cerrarModalCrear}
                  className="px-6 py-3 border border-slate-200 rounded-lg bg-white text-slate-800 cursor-pointer transition-all hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className={`px-8 py-3 bg-blue-600 text-white border-none rounded-lg cursor-pointer flex items-center gap-2 font-medium transition-all hover:scale-105 ${
                    guardando ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {guardando ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <FaSave /> Crear Reunión ({invitados.length} invitados)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL EDITAR ASISTENTES ===== */}
      {mostrarModalAsistentes && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModalAsistentes}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">
                  <FaUsers className="inline mr-2" />
                  Editar Asistentes
                </h2>
                <p className="text-slate-800 opacity-60 text-sm mt-1">
                  {reunionSeleccionada?.reu_nombre} - {formatearFecha(reunionSeleccionada?.reu_fecha)}
                </p>
              </div>
              <button
                onClick={cerrarModalAsistentes}
                className="bg-none border-none text-2xl text-slate-800 opacity-40 cursor-pointer hover:opacity-60 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <FaSearch className="text-slate-800 opacity-40" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={busquedaAsistente}
                onChange={(e) => setBusquedaAsistente(e.target.value)}
                className="flex-1 border-none outline-none text-sm text-slate-800 bg-transparent"
              />
            </div>

            <div className="max-h-72 overflow-y-auto mb-4">
              {asistentesFiltrados.length === 0 ? (
                <p className="text-center text-slate-800 opacity-40 py-8">
                  No hay usuarios disponibles
                </p>
              ) : (
                asistentesFiltrados.map((u) => {
                  const seleccionado = asistentesSeleccionados.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleAsistente(u.id)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                        seleccionado
                          ? 'bg-blue-100 border border-blue-600'
                          : 'bg-transparent border border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        seleccionado ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">
                          {u.nombre} {u.apellido}
                        </div>
                        <div className="text-xs text-slate-800 opacity-50">
                          {u.correo} • {u.puesto || 'Sin puesto'}
                        </div>
                      </div>
                      {seleccionado && (
                        <FaCheck className="text-blue-600 text-xl" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-slate-800 m-0">
                <strong>{asistentesSeleccionados.length}</strong> usuarios seleccionados
                {asistentesGuardados.length > 0 && (
                  <span className="ml-2 opacity-60">
                    • {asistentesGuardados.length} actuales
                  </span>
                )}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModalAsistentes}
                className="px-6 py-3 border border-slate-200 rounded-lg bg-white text-slate-800 cursor-pointer transition-all hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarAsistentes}
                disabled={guardandoAsistentes}
                className={`px-6 py-3 bg-blue-600 text-white border-none rounded-lg cursor-pointer flex items-center gap-2 font-medium transition-all hover:scale-105 ${
                  guardandoAsistentes ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {guardandoAsistentes ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave /> Actualizar Asistentes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}