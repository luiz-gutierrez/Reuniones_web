// src/pages/Agenda.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaSpinner,
  FaUsers,
  FaChevronRight,
  FaSearch,
  FaTimes,
  FaPlus,
  FaSave,
  FaUserPlus,
  FaCheck
} from 'react-icons/fa';

const COLORS = {
  primary: '#2563EB',
  secondary: '#1E293B',
  accent: '#F8FAFC',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray: '#9CA3AF',
};

export default function Agenda() {
  const [reuniones, setReuniones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  // Datos de la reunión
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [invitados, setInvitados] = useState([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estado del modal
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);

  // Estados para el modal de edición de asistentes
  const [mostrarModalAsistentes, setMostrarModalAsistentes] = useState(false);
  const [reunionSeleccionada, setReunionSeleccionada] = useState(null);
  const [asistentesSeleccionados, setAsistentesSeleccionados] = useState([]);
  const [asistentesGuardados, setAsistentesGuardados] = useState([]);
  const [guardandoAsistentes, setGuardandoAsistentes] = useState(false);
  const [busquedaAsistente, setBusquedaAsistente] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    cargarReuniones();
    cargarUsuarios();
  }, []);

  async function cargarReuniones() {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/reuniones');
      console.log('📋 Reuniones cargadas:', data);
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

  // Abrir modal de creación
  const abrirModalCrear = () => {
    setNombre('');
    setDescripcion('');
    setLugar('');
    setFecha('');
    setHora('');
    setInvitados([]);
    setBusquedaUsuario('');
    setError('');
    setMostrarModalCrear(true);
  };

  // Cerrar modal de creación
  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setNombre('');
    setDescripcion('');
    setLugar('');
    setFecha('');
    setHora('');
    setInvitados([]);
    setBusquedaUsuario('');
    setError('');
  };

  // Toggle selección de invitado
  const toggleInvitado = (userId) => {
    setInvitados(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Crear reunión con invitados
  async function handleCrear(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');

    // Validar que haya al menos 2 invitados
    if (invitados.length < 2) {
      setError('Debes seleccionar al menos 2 invitados para la reunión');
      setGuardando(false);
      return;
    }

    try {
      const response = await api.post('/reuniones', {
        nombre,
        descripcion,
        lugar,
        fecha,
        hora,
        invitados: invitados
      });

      console.log('✅ Reunión creada:', response.data);

      // Limpiar y cerrar modal
      cerrarModalCrear();
      await cargarReuniones();

    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al crear reunión';
      setError(mensaje);
      console.error('❌ Error:', err);
    } finally {
      setGuardando(false);
    }
  }

  // Toggle selección de usuario en el modal
  const toggleAsistente = (userId) => {
    setAsistentesSeleccionados(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const cerrarModalAsistentes = () => {
    setMostrarModalAsistentes(false);
    setReunionSeleccionada(null);
    setAsistentesSeleccionados([]);
    setAsistentesGuardados([]);
    setError('');
  };

  const normalizarFecha = (fecha) => {
    if (!fecha) return '';
    if (typeof fecha === 'string' && fecha.includes('T')) {
      return fecha.split('T')[0];
    }
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return fecha;
    }
    try {
      const d = new Date(fecha);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Error al normalizar fecha:', fecha);
    }
    return fecha;
  };

  const clasificarReuniones = () => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];

    const pasadas = [];
    const hoyReuniones = [];
    const proximas = [];

    reuniones.forEach(r => {
      const fechaNormalizada = normalizarFecha(r.reu_fecha);

      if (fechaNormalizada < hoyStr) {
        pasadas.push(r);
      } else if (fechaNormalizada === hoyStr) {
        hoyReuniones.push(r);
      } else {
        proximas.push(r);
      }
    });

    pasadas.sort((a, b) => a.reu_fecha.localeCompare(b.reu_fecha));
    hoyReuniones.sort((a, b) => a.reu_hora.localeCompare(b.reu_hora));
    proximas.sort((a, b) => a.reu_fecha.localeCompare(b.reu_fecha));

    return { pasadas, hoy: hoyReuniones, proximas };
  };

  const filtrarPorCategoria = () => {
    const { pasadas, hoy, proximas } = clasificarReuniones();

    switch (filtroCategoria) {
      case 'pasadas':
        return pasadas;
      case 'hoy':
        return hoy;
      case 'proximas':
        return proximas;
      default:
        return [...pasadas, ...hoy, ...proximas];
    }
  };

  const formatearFechaRelativa = (fecha) => {
    const fechaNormalizada = normalizarFecha(fecha);
    if (!fechaNormalizada) return null;

    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const mananaStr = manana.toISOString().split('T')[0];
    const pasado = new Date(hoy);
    pasado.setDate(pasado.getDate() + 2);
    const pasadoStr = pasado.toISOString().split('T')[0];
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().split('T')[0];

    if (fechaNormalizada === hoyStr) return { label: 'Hoy', color: COLORS.success };
    if (fechaNormalizada === mananaStr) return { label: 'Mañana', color: COLORS.primary };
    if (fechaNormalizada === pasadoStr) return { label: 'Pasado mañana', color: COLORS.warning };
    if (fechaNormalizada === ayerStr) return { label: 'Ayer', color: COLORS.danger };
    if (fechaNormalizada < hoyStr) return { label: 'Pasada', color: COLORS.danger };
    return null;
  };

  const esReunionHoy = (fecha) => {
    const fechaNormalizada = normalizarFecha(fecha);
    if (!fechaNormalizada) return false;
    const hoy = new Date().toISOString().split('T')[0];
    return fechaNormalizada === hoy;
  };

  const esReunionPasada = (fecha, hora) => {
    const fechaNormalizada = normalizarFecha(fecha);
    if (!fechaNormalizada) return false;

    const hoy = new Date().toISOString().split('T')[0];

    if (fechaNormalizada < hoy) return true;

    if (fechaNormalizada === hoy) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      return hora < horaActual;
    }

    return false;
  };

  const filtrarPorBusqueda = (reunionesFiltradas) => {
    if (!busqueda.trim()) return reunionesFiltradas;

    const busquedaLower = busqueda.toLowerCase();
    return reunionesFiltradas.filter(r =>
      r.reu_nombre.toLowerCase().includes(busquedaLower) ||
      (r.reu_descripcion && r.reu_descripcion.toLowerCase().includes(busquedaLower)) ||
      (r.reu_lugar && r.reu_lugar.toLowerCase().includes(busquedaLower)) ||
      (r.creado_por_nombre && r.creado_por_nombre.toLowerCase().includes(busquedaLower))
    );
  };

  const reunionesFinales = filtrarPorBusqueda(filtrarPorCategoria());

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      const fechaNormalizada = normalizarFecha(fecha);
      if (!fechaNormalizada) return 'Fecha inválida';
      const [anio, mes, dia] = fechaNormalizada.split('-');
      const d = new Date(anio, mes - 1, dia);
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const verDetalles = (reunionId) => {
    navigate(`/asistente/reunion-detalle/${reunionId}`);
  };

  const agruparPorFecha = (reuniones) => {
    const grupos = {};
    reuniones.forEach(r => {
      const fechaNormalizada = normalizarFecha(r.reu_fecha);
      if (!grupos[fechaNormalizada]) {
        grupos[fechaNormalizada] = [];
      }
      grupos[fechaNormalizada].push(r);
    });
    return grupos;
  };

  const contarPorCategoria = () => {
    const { pasadas, hoy, proximas } = clasificarReuniones();
    return { pasadas: pasadas.length, hoy: hoy.length, proximas: proximas.length };
  };

  const conteos = contarPorCategoria();

  // Filtrar usuarios para el modal
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

  // Renderizar tarjeta de reunión
  const renderReunionCard = (reunion) => {
    const pasada = esReunionPasada(reunion.reu_fecha, reunion.reu_hora);
    const fechaRelativa = formatearFechaRelativa(reunion.reu_fecha);
    const esHoy = esReunionHoy(reunion.reu_fecha);

    const borderColor = pasada ? COLORS.danger : esHoy ? COLORS.success : COLORS.primary;

    return (
      <div
        key={reunion.reu_id}
        onClick={() => verDetalles(reunion.reu_id)}
        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer mb-4 relative"
        style={{ borderLeft: `4px solid ${borderColor}`, opacity: pasada ? 0.7 : 1 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {pasada && (
            <span className="bg-red-100 text-red-800 px-3 py-0.5 rounded-full text-xs font-semibold">
              Finalizada
            </span>
          )}
          {fechaRelativa && !pasada && (
            <span
              className="px-3 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: fechaRelativa.color + '20', color: fechaRelativa.color }}
            >
              {fechaRelativa.label}
            </span>
          )}
          {reunion.total_invitados > 0 && (
            <span className="bg-blue-100 text-blue-800 px-3 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <FaUsers size={10} />
              {reunion.total_invitados} invitados
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {reunion.reu_nombre}
        </h3>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <FaCalendarAlt className="text-blue-600 text-sm" />
            <span>{formatearFecha(reunion.reu_fecha)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <FaClock className="text-blue-600 text-sm" />
            <span>{reunion.reu_hora}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <FaMapMarkerAlt className="text-blue-600 text-sm" />
            <span>{reunion.reu_lugar || 'Sin lugar definido'}</span>
          </div>

          {reunion.reu_descripcion && (
            <p className="text-sm text-gray-600 opacity-60 mt-1 mb-0 line-clamp-2">
              {reunion.reu_descripcion}
            </p>
          )}

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-xs opacity-60">
              <FaUser className="text-blue-600" />
              <span>{reunion.creado_por_nombre || 'Sin creador'}</span>
            </div>
            <FaChevronRight className="text-blue-600 text-sm opacity-40" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 m-0">
            📅 Agenda
          </h1>
          <p className="text-gray-600 opacity-60 m-0 mt-1">
            Visualiza todas tus reuniones organizadas por fecha
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={abrirModalCrear}
            className="bg-blue-600 text-white border-none rounded-xl px-6 py-3 cursor-pointer flex items-center gap-2 font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/40 shadow-md shadow-blue-600/30"
          >
            <FaPlus /> Nueva Reunión
          </button>
          <button
            onClick={cargarReuniones}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros y buscador en una sola fila */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Select de filtros */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
          <span className="text-gray-500 text-sm font-medium">Filtrar por:</span>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border-none outline-none text-sm font-medium text-gray-700 bg-transparent cursor-pointer py-1 pr-8"
            style={{
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
              backgroundSize: '12px'
            }}
          >
            <option value="todas">📋 Todas ({reuniones.length})</option>
            <option value="hoy">📅 Hoy ({conteos.hoy})</option>
            <option value="proximas">🚀 Próximas ({conteos.proximas})</option>
            <option value="pasadas">⏪ Anteriores ({conteos.pasadas})</option>
          </select>
        </div>

        {/* Buscador */}
        <div className="flex-1 bg-white rounded-xl px-4 py-2 shadow-sm flex items-center gap-3 border border-gray-200">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reuniones por nombre, lugar, creador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border-none outline-none text-sm text-gray-800 bg-transparent"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="bg-none border-none text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div className="text-center py-12 text-gray-600 opacity-60">
          <FaSpinner className="text-4xl mx-auto animate-spin" />
          <p className="mt-2">Cargando reuniones...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Lista de reuniones */}
      {!cargando && !error && (
        <>
          {reunionesFinales.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl text-gray-800 m-0">
                No hay reuniones {filtroCategoria === 'hoy' ? 'para hoy' :
                  filtroCategoria === 'proximas' ? 'próximas' :
                    filtroCategoria === 'pasadas' ? 'anteriores' : 'programadas'}
              </h2>
              <p className="text-gray-600 opacity-60 mt-2">
                {busqueda ? 'No se encontraron reuniones que coincidan con tu búsqueda' :
                  filtroCategoria === 'hoy' ? 'Disfruta tu día sin reuniones' :
                    'Pronto se programarán nuevas reuniones'}
              </p>
            </div>
          ) : (
            <div>
              {filtroCategoria === 'todas' ? (
                Object.entries(agruparPorFecha(reunionesFinales))
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([fecha, reunionesDelDia]) => {
                    const fechaRelativa = formatearFechaRelativa(fecha);

                    return (
                      <div key={fecha} className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <h2 className="text-xl font-semibold text-gray-800 m-0">
                            {formatearFecha(fecha)}
                          </h2>
                          {fechaRelativa && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: fechaRelativa.color + '20', color: fechaRelativa.color }}
                            >
                              {fechaRelativa.label}
                            </span>
                          )}
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs opacity-60">
                            {reunionesDelDia.length} reuniones
                          </span>
                        </div>
                        {reunionesDelDia.map(r => renderReunionCard(r))}
                      </div>
                    );
                  })
              ) : (
                reunionesFinales.map(r => renderReunionCard(r))
              )}
            </div>
          )}
        </>
      )}

      {/* Modal para crear reunión */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={cerrarModalCrear}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 m-0">
                <FaUserPlus className="inline mr-2" />
                Nueva Reunión
              </h2>
              <button
                onClick={cerrarModalCrear}
                className="bg-none border-none text-2xl text-gray-800 opacity-40 cursor-pointer hover:opacity-60 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCrear}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre de la reunión"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Lugar *
                  </label>
                  <input
                    type="text"
                    placeholder="Lugar de la reunión"
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border transition-all"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Descripción de la reunión"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 box-border resize-y font-inherit transition-all"
                  />
                </div>

                {/* Sección de invitados */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    <FaUsers className="inline mr-2" />
                    Invitados * ({invitados.length} seleccionados)
                  </label>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center gap-3">
                    <FaSearch className="text-gray-800 opacity-40" />
                    <input
                      type="text"
                      placeholder="Buscar usuarios para invitar..."
                      value={busquedaUsuario}
                      onChange={(e) => setBusquedaUsuario(e.target.value)}
                      className="flex-1 border-none outline-none text-sm text-gray-800 bg-transparent"
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

                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {usuariosFiltrados.length === 0 ? (
                      <p className="text-center text-gray-800 opacity-40 py-4">
                        {busquedaUsuario ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                      </p>
                    ) : (
                      usuariosFiltrados.map((u) => {
                        const seleccionado = invitados.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => toggleInvitado(u.id)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${seleccionado
                                ? 'bg-blue-100 border border-blue-600'
                                : 'bg-transparent border border-transparent hover:bg-gray-50'
                              }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${seleccionado ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">
                                {u.nombre} {u.apellido}
                              </div>
                              <div className="text-xs text-gray-800 opacity-50">
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
                  className="px-6 py-3 border border-gray-200 rounded-lg bg-white text-gray-800 cursor-pointer transition-all hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className={`px-8 py-3 bg-blue-600 text-white border-none rounded-lg cursor-pointer flex items-center gap-2 font-medium transition-all hover:scale-105 ${guardando ? 'opacity-60 cursor-not-allowed' : ''
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
    </div>
  );
}