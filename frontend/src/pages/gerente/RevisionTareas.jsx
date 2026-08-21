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
  FaInfoCircle
} from 'react-icons/fa';

export default function GerenteRevisionTareas() {
  const navigate = useNavigate();

  // ========== ESTADOS PRINCIPALES ==========
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('prerevision');
  const [busqueda, setBusqueda] = useState('');
  const [actualizando, setActualizando] = useState(null);

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

    setGuardando(true);
    setErrorModal('');

    try {
      const { data } = await api.put(`/tareas/${tareaSeleccionada.tar_id}/estado`, {
        tar_estatus: nuevoEstado,
        tar_nota: comentario.trim() || null
      });

      console.log('✅ Estado actualizado:', data);

      setTareas(prevTareas =>
        prevTareas.map(tarea =>
          tarea.tar_id === tareaSeleccionada.tar_id
            ? { ...tarea, tar_estatus: nuevoEstado, tar_nota: comentario.trim() || tarea.tar_nota }
            : tarea
        )
      );

      cerrarModal();
      alert(`✅ Tarea actualizada a "${getEstadoLabel(nuevoEstado)}" correctamente`);
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      setErrorModal(err.response?.data?.message || 'Error al actualizar el estado de la tarea');
    } finally {
      setGuardando(false);
    }
  };

  // ========== FILTROS ==========
  const tareasFiltradas = tareas.filter(tarea => {
    if (filtro === 'prerevision' && tarea.tar_estatus !== 'Prerevision') return false;
    if (filtro === 'revisiones' && tarea.tar_estatus !== 'Revision') return false;

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      const nombreMatch = tarea.tar_nombre?.toLowerCase().includes(busquedaLower);
      const descripcionMatch = tarea.tar_descripcion?.toLowerCase().includes(busquedaLower);
      const usuarioMatch = `${tarea.usuario_nombre} ${tarea.usuario_apellido}`.toLowerCase().includes(busquedaLower);
      const reunionMatch = tarea.reunion_titulo?.toLowerCase().includes(busquedaLower);

      return nombreMatch || descripcionMatch || usuarioMatch || reunionMatch;
    }

    return true;
  });

  // ========== ESTADÍSTICAS ==========
  const estadisticas = {
    total: tareas.length,
    prerevision: tareas.filter(t => t.tar_estatus === 'Prerevision').length,
    revisiones: tareas.filter(t => t.tar_estatus === 'Revision').length
  };

  // ========== UTILIDADES ==========
  const getEstadoLabel = (estatus) => {
    const labels = {
      'Iniciar': 'Iniciar',
      'Proceso': 'En Proceso',
      'Prerevision': 'En Prerevision',
      'Revision': 'Revision'
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
        label: 'En Prerevision'
      },
      'Revision': {
        color: 'text-green-700',
        bg: 'bg-green-100',
        icon: FaCheckCircle,
        label: 'Revision'
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
      'Alta': { color: 'text-red-700', bg: 'bg-red-100', icon: FaExclamationTriangle },
      'Media': { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: FaInfoCircle },
      'Baja': { color: 'text-green-700', bg: 'bg-green-100', icon: FaCheckCircle }
    };

    const config = configs[prioridad] || configs['Media'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon size={10} />
        {prioridad || 'Media'}
      </span>
    );
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
              Mis Tareas
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              Gestiona y actualiza el estado de tus tareas asignadas
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
                <div className="text-sm text-slate-500">En Pre-revisión</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <FaSearch size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{estadisticas.revisiones}</div>
                <div className="text-sm text-slate-500">Reviones al asistente</div>
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
                placeholder="Buscar por nombre, descripción, usuario o reunión..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50"
              />
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
                En Pre-revisión
              </button>
              <button
                onClick={() => setFiltro('revisiones')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtro === 'revisiones'
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <FaCheckCircle className="inline mr-1.5" size={12} />
                Revisiones
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
            <p className="text-slate-400 mt-1">No se encontraron tareas que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {tareasFiltradas.map((tarea) => (
              <div
                key={tarea.tar_id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
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
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {getEstadoBadge(tarea.tar_estatus)}
                    {getPrioridadBadge(tarea.tar_prioridad)}
                  </div>
                </div>

                {/* Descripción */}
                {tarea.tar_descripcion && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">
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
                <div className="flex flex-wrap items-center gap-3 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FaUser className="text-blue-500" size={12} />
                    <span>{tarea.usuario_nombre} {tarea.usuario_apellido}</span>
                  </div>
                  {tarea.usuario_puesto && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FaBuilding size={12} />
                      <span>{tarea.usuario_puesto}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
                    <FaCalendarAlt size={12} />
                    <span>{new Date(tarea.tar_fecha).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                {/* ===== BOTONES DE ACCIÓN ===== */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {tarea.tar_estatus !== 'Iniciar' && (
                    <button
                      onClick={() => abrirModal(tarea, 'Iniciar')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <FaPlay size={12} />
                      Volver iniciar
                    </button>
                  )}

                  {tarea.tar_estatus !== 'Prerevision' && tarea.tar_estatus !== 'Revision' && (
                    <button
                      onClick={() => abrirModal(tarea, 'Prerevision')}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <FaSearch size={12} />
                      Pre-revisión
                    </button>
                  )}

                  {tarea.tar_estatus !== 'Revision' && (
                    <button
                      onClick={() => abrirModal(tarea, 'Revision')}
                      className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <FaCheck size={12} />
                      Revisar con asistente
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
                    Cambiar Estado
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {tareaSeleccionada.tar_nombre}
                  </p>
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
                   Por {getEstadoLabel(nuevoEstado)}
                  </span>
                </div>
              </div>

              {/* Campo de comentario */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FaComment className="inline mr-2" />
                  Comentario <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  placeholder="Agrega un comentario sobre el cambio de estado..."
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
                  className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 ${guardando
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
                      Actualizar
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