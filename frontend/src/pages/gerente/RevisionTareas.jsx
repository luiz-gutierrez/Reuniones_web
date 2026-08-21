// src/pages/gerente/Tareas.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaSpinner,
  FaSync,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaClipboardList,
  FaPlay,
  FaCheck,
  FaTimes,
  FaComment,
  FaSave,
  FaFilter,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaUsers,
  FaUserTie,
  FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function GerenteTareas() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ========== ESTADOS PRINCIPALES ==========
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('prerevision');
  const [busqueda, setBusqueda] = useState('');
  const [actualizando, setActualizando] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const [estadisticasDepartamento, setEstadisticasDepartamento] = useState({});

  // ========== ESTADOS DEL MODAL ==========
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // ========== CARGAR TAREAS ==========
  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    setCargando(true);
    setError('');

    try {
      const { data } = await api.get('/tareas');
      console.log('📋 Tareas recibidas:', data);

      if (data.success) {
        setTareas(data.tareas || []);
        
        // Extraer departamentos únicos
        const depts = {};
        data.tareas?.forEach(t => {
          if (t.departamento_nombre) {
            if (!depts[t.departamento_nombre]) {
              depts[t.departamento_nombre] = {
                nombre: t.departamento_nombre,
                id: t.departamento_id,
                count: 0
              };
            }
            depts[t.departamento_nombre].count++;
          }
        });
        setDepartamentos(Object.values(depts));

        // Calcular estadísticas por departamento
        const stats = {};
        data.tareas?.forEach(t => {
          if (t.departamento_nombre) {
            if (!stats[t.departamento_nombre]) {
              stats[t.departamento_nombre] = {
                total: 0,
                prerevision: 0,
                revision: 0
              };
            }
            stats[t.departamento_nombre].total++;
            if (t.tar_estatus === 'Prerevision') stats[t.departamento_nombre].prerevision++;
            if (t.tar_estatus === 'Revision') stats[t.departamento_nombre].revision++;
          }
        });
        setEstadisticasDepartamento(stats);
      } else {
        setError(data.message || 'Error al cargar tareas');
      }
    } catch (err) {
      console.error('❌ Error al cargar tareas:', err);
      setError(err.response?.data?.message || 'Error al cargar las tareas');
    } finally {
      setCargando(false);
    }
  };

  // ========== ABRIR MODAL ==========
  const abrirModal = (tarea, estado) => {
    setTareaSeleccionada(tarea);
    setNuevoEstado(estado);
    setComentario('');
    setErrorModal('');
    setMostrarModal(true);
  };

  // ========== CERRAR MODAL ==========
  const cerrarModal = () => {
    setMostrarModal(false);
    setTareaSeleccionada(null);
    setNuevoEstado('');
    setComentario('');
    setErrorModal('');
    setGuardando(false);
  };

  // ========== ACTUALIZAR ESTADO DE TAREA DESDE MODAL ==========
  const actualizarEstadoConComentario = async () => {
    if (!tareaSeleccionada || !nuevoEstado) return;
    // Validar que la nota sea obligatoria para ambos casos
    if (!comentario.trim() || comentario.trim().length < 4) {
      setErrorModal('⚠️ La nota es obligatoria');
      return;
    }
    setGuardando(true);
    setErrorModal('');

    try {
      const { data } = await api.put(`/tareas/${tareaSeleccionada.tar_id}/estado`, {
        tar_estatus: nuevoEstado,
        tar_nota: comentario.trim() || null
      });

      console.log('✅ Estado actualizado:', data);

      // Actualizar la lista de tareas
      setTareas(prevTareas =>
        prevTareas.map(tarea =>
          tarea.tar_id === tareaSeleccionada.tar_id
            ? { ...tarea, tar_estatus: nuevoEstado, tar_nota: comentario.trim() || tarea.tar_nota }
            : tarea
        )
      );

      cerrarModal();
      // Mostrar notificación de éxito
      const estadoLabel = nuevoEstado === 'Revision' ? 'Revisión' : 'Pre-revisión';
      alert(`✅ Tarea enviada a "${estadoLabel}" correctamente`);

    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      setErrorModal(err.response?.data?.message || 'Error al actualizar el estado de la tarea');
    } finally {
      setGuardando(false);
    }
  };

  // ========== FILTROS ==========
  const tareasFiltradas = tareas.filter(tarea => {
    // Filtro por estado
    if (filtro === 'prerevision' && tarea.tar_estatus !== 'Prerevision') return false;
    if (filtro === 'revisiones' && tarea.tar_estatus !== 'Revision') return false;
    if (filtro === 'pendientes' && !['Iniciar', 'Proceso'].includes(tarea.tar_estatus)) return false;
    if (filtro === 'finalizadas' && tarea.tar_estatus !== 'Finalizado') return false;

    // Filtro por departamento
    if (filtroDepartamento !== 'todos' && tarea.departamento_nombre !== filtroDepartamento) return false;

    // Búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      const nombreMatch = tarea.tar_nombre?.toLowerCase().includes(busquedaLower);
      const descripcionMatch = tarea.tar_descripcion?.toLowerCase().includes(busquedaLower);
      const usuarioMatch = `${tarea.usuario_nombre} ${tarea.usuario_apellido}`.toLowerCase().includes(busquedaLower);
      const reunionMatch = tarea.reunion_titulo?.toLowerCase().includes(busquedaLower);
      const deptoMatch = tarea.departamento_nombre?.toLowerCase().includes(busquedaLower);

      return nombreMatch || descripcionMatch || usuarioMatch || reunionMatch || deptoMatch;
    }

    return true;
  });

  // ========== ESTADÍSTICAS ==========
  const estadisticas = {
    total: tareas.length,
    prerevision: tareas.filter(t => t.tar_estatus === 'Prerevision').length,
    revisiones: tareas.filter(t => t.tar_estatus === 'Revision').length,
    pendientes: tareas.filter(t => ['Iniciar', 'Proceso'].includes(t.tar_estatus)).length,
    finalizadas: tareas.filter(t => t.tar_estatus === 'Finalizado').length
  };

  // ========== UTILIDADES ==========
  const getEstadoLabel = (estatus) => {
    const labels = {
      'Iniciar': 'Iniciar',
      'Proceso': 'En Proceso',
      'Prerevision': 'Pre-revisión',
      'Revision': 'Revisión',
      'Finalizado': 'Finalizado'
    };
    return labels[estatus] || estatus;
  };

  const getEstadoBadge = (estatus) => {
    const configs = {
      'Iniciar': {
        color: 'text-blue-700',
        bg: 'bg-blue-100',
        icon: FaClock,
        label: 'Iniciar'
      },
      'Proceso': {
        color: 'text-yellow-700',
        bg: 'bg-yellow-100',
        icon: FaSpinner,
        label: 'En Proceso'
      },
      'Prerevision': {
        color: 'text-purple-700',
        bg: 'bg-purple-100',
        icon: FaSearch,
        label: 'Pre-revisión'
      },
      'Revision': {
        color: 'text-indigo-700',
        bg: 'bg-indigo-100',
        icon: FaEye,
        label: 'Revisión'
      },
      'Finalizado': {
        color: 'text-green-700',
        bg: 'bg-green-100',
        icon: FaCheckCircle,
        label: 'Finalizado'
      }
    };

    const config = configs[estatus] || configs['Iniciar'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getPrioridadBadge = (prioridad) => {
    const configs = {
      'alta': { color: 'text-red-700', bg: 'bg-red-100', icon: FaExclamationTriangle, label: 'Alta' },
      'media': { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: FaInfoCircle, label: 'Media' },
      'baja': { color: 'text-green-700', bg: 'bg-green-100', icon: FaCheckCircle, label: 'Baja' }
    };

    const config = configs[prioridad?.toLowerCase()] || configs['media'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon size={10} />
        {config.label}
      </span>
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 m-0 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
                <FaTasks size={24} />
              </div>
              Gestión de Tareas
            </h1>
            <p className="text-slate-500 mt-1 ml-1 flex items-center gap-2">
              <FaUserTie className="text-blue-500" />
              {user?.nombre} {user?.apellido} - Gerente
            </p>
          </div>
          <button
            onClick={cargarTareas}
            className="px-5 py-2.5 bg-white text-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
          >
            <FaSync className={cargando ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* ===== ESTADÍSTICAS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{estadisticas.prerevision}</div>
                <div className="text-sm text-slate-500">Pendientes</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <FaSearch size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{estadisticas.revisiones}</div>
                <div className="text-sm text-slate-500">En Revisión con asistente</div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <FaEye size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== FILTROS Y BÚSQUEDA ===== */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, descripción, usuario, departamento..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50"
                />
              </div>

              {/* Filtro por departamento */}
              <div className="relative min-w-[200px]">
                <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={filtroDepartamento}
                  onChange={(e) => setFiltroDepartamento(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 appearance-none cursor-pointer"
                >
                  {departamentos.map((dept, index) => (
                    <option key={index} value={dept.nombre}>
                      🏢 {dept.nombre}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltro('prerevision')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === 'prerevision'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <FaSearch className="inline mr-1.5" size={12} />
                 Pendientes ({estadisticas.prerevision})
              </button>
              <button
                onClick={() => setFiltro('revisiones')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === 'revisiones'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <FaEye className="inline mr-1.5" size={12} />
                Revisión con asistente ({estadisticas.revisiones})
              </button>
              <button
                onClick={() => setFiltro('finalizadas')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === 'finalizadas'
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <FaCheckCircle className="inline mr-1.5" size={12} />
                Finalizadas ({estadisticas.finalizadas})
              </button>
            </div>
          </div>
        </div>

        {/* ===== LISTA DE TAREAS ===== */}
        {cargando ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <FaSpinner className="text-5xl animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-slate-500">Cargando tareas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
            {error}
          </div>
        ) : tareasFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="text-6xl mb-4 opacity-20">📋</div>
            <p className="text-xl text-slate-600 font-medium">No hay tareas</p>
            <p className="text-slate-400 mt-1">
              {filtroDepartamento !== 'todos' 
                ? `No se encontraron tareas para el departamento "${filtroDepartamento}" con los filtros seleccionados`
                : 'No se encontraron tareas que coincidan con los filtros'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tareasFiltradas.map((tarea) => (
              <div
                key={tarea.tar_id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-base m-0 truncate">
                      {tarea.tar_nombre}
                    </h3>
                    {tarea.reunion_titulo && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <FaClipboardList size={12} />
                        <span className="truncate">{tarea.reunion_titulo}</span>
                      </div>
                    )}
                    {/* Departamento */}
                    {tarea.departamento_nombre && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 mt-0.5">
                        <FaBuilding size={12} />
                        <span className="truncate font-medium">{tarea.departamento_nombre}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {getEstadoBadge(tarea.tar_estatus)}
                    {getPrioridadBadge(tarea.tar_prioridad)}
                  </div>
                </div>

                {/* Descripción */}
                {tarea.tar_descripcion && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2 flex-1">
                    {tarea.tar_descripcion}
                  </p>
                )}

                {/* Comentario */}
                {tarea.tar_nota && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-start gap-2">
                      <FaComment className="text-blue-500 mt-0.5" size={14} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-600 m-0">Comentario:</p>
                        <p className="text-sm text-slate-600 m-0 truncate">{tarea.tar_nota}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info de usuario */}
                <div className="flex flex-wrap items-center gap-3 text-xs border-t border-slate-100 pt-3 mt-auto">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-[8px] font-semibold flex-shrink-0">
                      {tarea.usuario_nombre?.charAt(0)}{tarea.usuario_apellido?.charAt(0)}
                    </div>
                    <span className="truncate max-w-[80px]">
                      {tarea.usuario_nombre} {tarea.usuario_apellido}
                    </span>
                  </div>
                  {tarea.usuario_puesto && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FaUser size={12} />
                      <span className="truncate max-w-[60px]">{tarea.usuario_puesto}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
                    <FaCalendarAlt size={12} />
                    <span>{formatearFecha(tarea.tar_fecha)}</span>
                  </div>
                </div>

                {/* ===== BOTONES DE ACCIÓN PARA GERENTE ===== */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {/* Solo mostrar si la tarea está en Prerevision o puede ser enviada a Prerevision */}
                  {tarea.tar_estatus === 'Prerevision' && (
                    <>
                      <button
                        onClick={() => abrirModal(tarea, 'Revision')}
                        className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FaEye size={12} />
                        Enviar a Revisión con asistente
                      </button>
                      <button
                        onClick={() => abrirModal(tarea, 'Iniciar')}
                        className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <FaPlay size={12} />
                        Rechazar
                      </button>
                    </>
                  )}

                  {tarea.tar_estatus === 'Revision' && (
                    <div className="w-full text-center py-2 bg-indigo-50 rounded-xl text-indigo-700 text-xs font-medium flex items-center justify-center gap-2">
                      <FaEye size={14} />
                      En espera de revisión final por Asistente
                    </div>
                  )}

                  {tarea.tar_estatus === 'Finalizado' && (
                    <div className="w-full text-center py-2 bg-green-50 rounded-xl text-green-700 text-xs font-medium flex items-center justify-center gap-2">
                      <FaCheckCircle size={14} />
                      Tarea completada
                    </div>
                  )}

                  {['Iniciar', 'Proceso'].includes(tarea.tar_estatus) && (
                    <button
                      onClick={() => abrirModal(tarea, 'Prerevision')}
                      className="w-full px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FaSearch size={12} />
                      Solicitar Pre-revisión
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== MODAL PARA CAMBIAR ESTADO ===== */}
        {mostrarModal && tareaSeleccionada && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={cerrarModal}
          >
            <div
              className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 m-0 flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
                      <FaSave size={16} />
                    </div>
                    {nuevoEstado === 'Revision' ? 'Enviar a Revisión' : 
                     nuevoEstado === 'Prerevision' ? 'Solicitar Pre-revisión' :
                     'Cambiar Estado'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {tareaSeleccionada.tar_nombre}
                  </p>
                  {tareaSeleccionada.departamento_nombre && (
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                      <FaBuilding size={10} />
                      {tareaSeleccionada.departamento_nombre}
                    </p>
                  )}
                </div>
                <button
                  onClick={cerrarModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Información de la tarea */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Estado actual:</span>
                  {getEstadoBadge(tareaSeleccionada.tar_estatus)}
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500">Nuevo estado:</span>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    {getEstadoLabel(nuevoEstado)}
                  </span>
                </div>
                {tareaSeleccionada.usuario_nombre && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-500">Responsable:</span>
                    <span className="text-sm text-slate-700">
                      {tareaSeleccionada.usuario_nombre} {tareaSeleccionada.usuario_apellido}
                    </span>
                  </div>
                )}
              </div>

              {/* Mensaje según el nuevo estado */}
              <div className={`p-3 rounded-xl mb-4 text-sm ${
                nuevoEstado === 'Revision' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : nuevoEstado === 'Prerevision'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {nuevoEstado === 'Revision' && (
                  <>
                    <FaEye className="inline mr-2" />
                    Al enviar a Revisión, la tarea pasará a la Secretaria para su revisión final.
                  </>
                )}
                {nuevoEstado === 'Prerevision' && (
                  <>
                    <FaSearch className="inline mr-2" />
                    Al solicitar Pre-revisión, la tarea pasará a revisión del Gerente.
                  </>
                )}
                {nuevoEstado === 'Iniciar' && (
                  <>
                    <FaPlay className="inline mr-2" />
                    La tarea volverá a estado Iniciar para que el Jefe de Departamento la retome.
                  </>
                )}
              </div>

              {/* Campo de comentario */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FaComment className="inline mr-2 text-red-500" />
                  Nota <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder={nuevoEstado === 'Revision' 
                    ? "Agrega observaciones para la Secretaria..."
                    : nuevoEstado === 'Prerevision'
                    ? "Agrega observaciones para el Gerente..."
                    : "Agrega un comentario sobre el cambio..."}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none bg-slate-50"
                />
              </div>

              {/* Error del modal */}
              {errorModal && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-4">
                  {errorModal}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={actualizarEstadoConComentario}
                  disabled={guardando}
                  className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 ${
                    guardando
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-blue-700 hover:scale-[1.02]'
                  }`}
                >
                  {guardando ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {nuevoEstado === 'Revision' ? 'Enviar a Revisión' : 
                       nuevoEstado === 'Prerevision' ? 'Solicitar Pre-revisión' :
                       'Actualizar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}