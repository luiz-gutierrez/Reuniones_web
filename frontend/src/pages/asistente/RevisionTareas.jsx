// src/pages/asistente/Tareas.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
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
  FaEye,
  FaPaperPlane,
  FaUserTie,
  FaChevronDown,
  FaChevronUp,
  FaTag,
  FaArrowRight,
  FaUndo
} from 'react-icons/fa';
import { MdPending } from 'react-icons/md';

export default function AsistenteTareas() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ========== ESTADOS PRINCIPALES ==========
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('revision');
  const [busqueda, setBusqueda] = useState('');
  const [actualizando, setActualizando] = useState(null);
  const [notaExpandida, setNotaExpandida] = useState({});

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
      // ✅ Usar la ruta que devuelve TODAS las tareas en Revision
      const { data } = await api.get('/tareas');
      console.log('📋 Tareas recibidas:', data);

      if (data.success) {
        setTareas(data.tareas || []);
      } else {
        setTareas(data || []);
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

    //Validar que la nota sea obligatoria para ambos casos
    if (!comentario.trim() || comentario.trim().length < 4) {
      setErrorModal('⚠️ La nota es obligatoria ');
      return;
    }

    setGuardando(true);
    setErrorModal('');

    try {
      const { data } = await api.put(`/tareas/${tareaSeleccionada.tar_id}/estado`, {
        tar_estatus: nuevoEstado,
        tar_nota: comentario.trim()
      });

      console.log('✅ Estado actualizado:', data);

      setTareas(prevTareas =>
        prevTareas.map(tarea =>
          tarea.tar_id === tareaSeleccionada.tar_id
            ? { ...tarea, tar_estatus: nuevoEstado, tar_nota: comentario.trim() }
            : tarea
        )
      );

      cerrarModal();
      const mensaje = nuevoEstado === 'Finalizado' 
        ? '✅ Tarea finalizada correctamente' 
        : '✅ Tarea enviada a Pre-revisión correctamente';
      alert(mensaje);
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      setErrorModal(err.response?.data?.message || 'Error al actualizar el estado de la tarea');
    } finally {
      setGuardando(false);
    }
  };

  // ========== ACTUALIZAR ESTADO DIRECTO (sin modal) ==========
  const actualizarEstadoDirecto = async (tareaId, nuevoEstatus) => {
    // ✅ Estados válidos para Secretaria: Prerevision o Finalizado
    const estatusValidos = ['Prerevision', 'Finalizado'];
    if (!estatusValidos.includes(nuevoEstatus)) {
      alert('❌ Estado no válido para Secretaria');
      return;
    }

    // Buscar la tarea para verificar el estado actual
    const tarea = tareas.find(t => t.tar_id === tareaId);
    if (!tarea) {
      alert('❌ Tarea no encontrada');
      return;
    }

    // ✅ Siempre abrir modal para ambos casos (Prerevision y Finalizado)
    abrirModal(tarea, nuevoEstatus);
  };

  // ========== TOGGLE NOTA ==========
  const toggleNota = (tareaId) => {
    setNotaExpandida(prev => ({
      ...prev,
      [tareaId]: !prev[tareaId]
    }));
  };

  // ========== FILTROS ==========
  const tareasFiltradas = tareas.filter(tarea => {
    // ✅ Por defecto muestra solo tareas en Revision
    if (filtro === 'revision' && tarea.tar_estatus !== 'Revision') return false;
    if (filtro === 'prerevision' && tarea.tar_estatus !== 'Prerevision') return false;
    if (filtro === 'finalizadas' && tarea.tar_estatus !== 'Finalizado') return false;
    if (filtro === 'revision') return true;

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
    revision: tareas.filter(t => t.tar_estatus === 'Revision').length,
    finalizadas: tareas.filter(t => t.tar_estatus === 'Finalizado').length
  };

  // ========== UTILIDADES ==========
  const getEstadoLabel = (estatus) => {
    const labels = {
      'Iniciar': 'Iniciar',
      'Proceso': 'En Proceso',
      'Prerevision': 'Pre-revisión',
      'Revision': 'En Revisión',
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
        icon: FaPaperPlane,
        label: 'Pre-revisión'
      },
      'Revision': {
        color: 'text-indigo-700',
        bg: 'bg-indigo-100',
        icon: FaEye,
        label: 'En Revisión'
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
              Revisión de Tareas
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <FaUserTie className="text-indigo-500" />
              {user?.nombre} {user?.apellido} - Asistente
            </p>
          </div>
          <button
            onClick={cargarTareas}
            className="px-5 py-2.5 bg-white text-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
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
                <div className="text-2xl font-bold text-indigo-600">{estadisticas.revision}</div>
                <div className="text-sm text-slate-500">En Revisión</div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <FaEye size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{estadisticas.finalizadas}</div>
                <div className="text-sm text-slate-500">Finalizadas</div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl text-green-600">
                <FaCheckCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== FILTROS Y BÚSQUEDA ===== */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción, usuario, departamento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltro('revision')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === 'revision'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <FaEye className="inline mr-1.5" size={12} />
                En Revisión
              </button>
              <button
                onClick={() => setFiltro('finalizadas')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === 'finalizadas'
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <FaCheckCircle className="inline mr-1.5" size={12} />
                Finalizadas
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 text-right">
            Mostrando {tareasFiltradas.length} de {tareas.length} tareas
          </div>
        </div>

        {/* ===== LISTA DE TAREAS ===== */}
        {cargando ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <FaSpinner className="text-5xl animate-spin text-indigo-600 mx-auto" />
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
            <p className="text-slate-400 mt-1">No se encontraron tareas que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tareasFiltradas.map((tarea) => (
              <div
                key={tarea.tar_id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* ===== NOTA ===== */}
                {tarea.tar_nota && (
                  <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <FaComment className="text-indigo-600 mt-0.5 flex-shrink-0" size={14} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-indigo-700 m-0">📝 Nota:</p>
                        <div className="text-sm text-slate-700">
                          <div className={`${!notaExpandida[tarea.tar_id] ? 'line-clamp-2' : ''}`}>
                            {tarea.tar_nota}
                          </div>
                          {tarea.tar_nota.length > 60 && (
                            <button
                              onClick={() => toggleNota(tarea.tar_id)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 flex items-center gap-1"
                            >
                              {notaExpandida[tarea.tar_id] ? (
                                <>
                                  <FaChevronUp className="text-xs" /> Ver menos
                                </>
                              ) : (
                                <>
                                  <FaChevronDown className="text-xs" /> Ver más
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== CONTENIDO ===== */}
                <div className="p-5 flex-1 flex flex-col">
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
                      {tarea.departamento_nombre && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 mt-0.5">
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

                  {/* Info de usuario */}
                  <div className="flex flex-wrap items-center gap-3 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                        {tarea.usuario_nombre?.charAt(0)}{tarea.usuario_apellido?.charAt(0)}
                      </div>
                      <span className="truncate max-w-[80px]">
                        {tarea.usuario_nombre} {tarea.usuario_apellido}
                      </span>
                    </div>
                    {tarea.usuario_puesto && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FaTag size={12} />
                        <span className="truncate max-w-[60px]">{tarea.usuario_puesto}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
                      <FaCalendarAlt size={12} />
                      <span>{formatearFecha(tarea.tar_fecha)}</span>
                    </div>
                  </div>

                  {/* ===== BOTONES DE ACCIÓN PARA SECRETARIA ===== */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {tarea.tar_estatus === 'Revision' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => actualizarEstadoDirecto(tarea.tar_id, 'Finalizado')}
                          disabled={actualizando === tarea.tar_id}
                          className={`flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            actualizando === tarea.tar_id 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-green-700 hover:shadow-lg'
                          }`}
                        >
                          {actualizando === tarea.tar_id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <>
                              <FaCheck size={14} />
                              Finalizar Tarea
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => actualizarEstadoDirecto(tarea.tar_id, 'Prerevision')}
                          disabled={actualizando === tarea.tar_id}
                          className={`px-4 py-2.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-all ${
                            actualizando === tarea.tar_id 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-purple-100'
                          }`}
                        >
                          <FaPaperPlane className="inline" size={14} /> Devolver
                        </button>
                      </div>
                    )}

                    {tarea.tar_estatus === 'Prerevision' && (
                      <button
                        onClick={() => actualizarEstadoDirecto(tarea.tar_id, 'Revision')}
                        disabled={actualizando === tarea.tar_id}
                        className={`w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          actualizando === tarea.tar_id 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-indigo-700 hover:shadow-lg'
                        }`}
                      >
                        {actualizando === tarea.tar_id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaEye size={14} />
                            Tomar para Revisión
                          </>
                        )}
                      </button>
                    )}

                    {tarea.tar_estatus === 'Finalizado' && (
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-green-50 rounded-lg text-green-700 text-sm font-medium">
                        <FaCheckCircle size={16} />
                        Tarea finalizada ✅
                      </div>
                    )}

                    {['Iniciar', 'Proceso'].includes(tarea.tar_estatus) && (
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 rounded-lg text-slate-500 text-sm">
                        <FaClock size={14} />
                        Esperando revisión del Gerente
                      </div>
                    )}
                  </div>

                  {/* ID de la tarea */}
                  <div className="mt-2 text-xs text-slate-400 text-right font-mono">
                    #{String(tarea.tar_id).padStart(4, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== MODAL PARA PREREVISION O FINALIZADO ===== */}
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
                    <div className={`p-2 rounded-xl text-white shadow-lg ${
                      nuevoEstado === 'Finalizado' 
                        ? 'bg-green-600 shadow-green-600/30' 
                        : 'bg-purple-600 shadow-purple-600/30'
                    }`}>
                      {nuevoEstado === 'Finalizado' ? <FaCheck size={16} /> : <FaPaperPlane size={16} />}
                    </div>
                    {nuevoEstado === 'Finalizado' ? 'Finalizar Tarea' : 'Regresar al gerente'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {tareaSeleccionada.tar_nombre}
                  </p>
                  {tareaSeleccionada.departamento_nombre && (
                    <p className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5">
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
                  <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                    nuevoEstado === 'Finalizado' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-purple-600 bg-purple-50'
                  }`}>
                    {nuevoEstado === 'Finalizado' ? 'Finalizado' : 'Pre-revisión'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500">Responsable:</span>
                  <span className="text-sm text-slate-700">
                    {tareaSeleccionada.usuario_nombre} {tareaSeleccionada.usuario_apellido}
                  </span>
                </div>
              </div>

              {/* Mensaje informativo */}
              <div className={`border rounded-xl p-3 mb-4 text-sm flex items-start gap-2 ${
                nuevoEstado === 'Finalizado' 
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                  : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                <FaInfoCircle className={`mt-0.5 flex-shrink-0 ${
                  nuevoEstado === 'Finalizado' ? 'text-yellow-500' : 'text-purple-500'
                }`} />
                <span>
                  {nuevoEstado === 'Finalizado' 
                    ? '⚠️ La nota es <strong>obligatoria</strong> al finalizar una tarea (mínimo 3 caracteres)'
                    : '📝 Agrega una nota explicando el motivo del cambio a Pre-revisión (mínimo 3 caracteres)'
                  }
                </span>
              </div>

              {/* Campo de comentario - OBLIGATORIO */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FaComment className="inline mr-2 text-red-500" />
                  Nota <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder={nuevoEstado === 'Finalizado' 
                    ? "Describe las observaciones finales de la tarea (obligatorio)..." 
                    : "Describe el motivo del cambio a Pre-revisión (obligatorio)..."
                  }
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 transition-all resize-none ${
                    errorModal && comentario.trim().length < 3
                      ? 'border-red-400 focus:border-red-500 bg-red-50'
                      : `border-slate-200 focus:border-${
                          nuevoEstado === 'Finalizado' ? 'green' : 'purple'
                        }-500 bg-slate-50`
                  }`}
                />
                {errorModal && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <FaExclamationTriangle size={12} />
                    {errorModal}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {comentario.trim().length}/3 caracteres mínimos
                </p>
              </div>

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
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md ${
                    guardando
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:scale-[1.02]'
                  } ${
                    nuevoEstado === 'Finalizado' 
                      ? 'bg-green-600 hover:bg-green-700 shadow-green-600/30' 
                      : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                  }`}
                >
                  {guardando ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      {nuevoEstado === 'Finalizado' ? <FaCheck /> : <FaPaperPlane />}
                      {nuevoEstado === 'Finalizado' ? 'Finalizar Tarea' : 'Regresar al gerente'}
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