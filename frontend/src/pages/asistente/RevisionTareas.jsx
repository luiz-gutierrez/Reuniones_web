// src/pages/asistente/Tareas.jsx
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
  FaSave
} from 'react-icons/fa';

export default function AsistenteRevisionTareas() {
  const navigate = useNavigate();
  
  // ========== ESTADOS PRINCIPALES ==========
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas');
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
        tar_nota: comentario.trim() || null // Si está vacío, enviar null
      });

      console.log('✅ Estado actualizado:', data);
      
      // Actualizar la tarea en el estado local
      setTareas(prevTareas => 
        prevTareas.map(tarea => 
          tarea.tar_id === tareaSeleccionada.tar_id 
            ? { ...tarea, tar_estatus: nuevoEstado, tar_nota: comentario.trim() || tarea.tar_nota }
            : tarea
        )
      );

      // Cerrar modal y mostrar éxito
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
    if (filtro === 'pendientes' && tarea.tar_estatus !== 'Iniciar') return false;
    if (filtro === 'proceso' && tarea.tar_estatus !== 'Proceso') return false;
    if (filtro === 'revision' && tarea.tar_estatus !== 'Revision') return false;
    if (filtro === 'finalizadas' && tarea.tar_estatus !== 'Finalizado') return false;
    
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
    pendientes: tareas.filter(t => t.tar_estatus === 'Iniciar').length,
    proceso: tareas.filter(t => t.tar_estatus === 'Proceso').length,
    revision: tareas.filter(t => t.tar_estatus === 'Revision').length,
    finalizadas: tareas.filter(t => t.tar_estatus === 'Finalizado').length
  };

  // ========== UTILIDADES ==========
  const getEstadoLabel = (estatus) => {
    const labels = {
      'Iniciar': 'Pendiente',
      'Proceso': 'En Proceso',
      'Revision': 'En Revisión',
      'Finalizado': 'Finalizado'
    };
    return labels[estatus] || estatus;
  };

  // ========== BADGE DE ESTADO ==========
  const getEstadoBadge = (estatus) => {
    const configs = {
      'Iniciar': { 
        color: 'text-blue-700', 
        bg: 'bg-blue-100', 
        icon: FaClock,
        label: 'Pendiente'
      },
      'Proceso': { 
        color: 'text-yellow-700', 
        bg: 'bg-yellow-100', 
        icon: FaSync,
        label: 'En Proceso'
      },
      'Revision': { 
        color: 'text-purple-700', 
        bg: 'bg-purple-100', 
        icon: FaSearch,
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

  // ========== BADGE DE PRIORIDAD ==========
  const getPrioridadBadge = (prioridad) => {
    const configs = {
      'Alta': { color: 'text-red-700', bg: 'bg-red-100' },
      'Media': { color: 'text-yellow-700', bg: 'bg-yellow-100' },
      'Baja': { color: 'text-green-700', bg: 'bg-green-100' }
    };
    
    const config = configs[prioridad] || configs['Media'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        {prioridad || 'Media'}
      </span>
    );
  };

  // ========== RENDER ==========
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 m-0 flex items-center gap-3">
            <FaTasks className="text-blue-600" />
            Todas las Tareas
          </h1>
          <p className="text-slate-800 opacity-60 mt-1">
            Gestiona y revisa todas las tareas asignadas
          </p>
        </div>
        <button
          onClick={cargarTareas}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaSync className={cargando ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* ===== ESTADÍSTICAS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-400">
          <div className="text-2xl font-bold text-blue-400">{estadisticas.pendientes}</div>
          <div className="text-sm text-slate-800 opacity-60">Pendientes</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-400">
          <div className="text-2xl font-bold text-yellow-400">{estadisticas.proceso}</div>
          <div className="text-sm text-slate-800 opacity-60">En Proceso</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-400">
          <div className="text-2xl font-bold text-purple-400">{estadisticas.revision}</div>
          <div className="text-sm text-slate-800 opacity-60">En Revisión</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-600">
          <div className="text-2xl font-bold text-green-600">{estadisticas.finalizadas}</div>
          <div className="text-sm text-slate-800 opacity-60">Finalizadas</div>
        </div>
      </div>

      {/* ===== FILTROS Y BÚSQUEDA ===== */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-800 opacity-40" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción, usuario o reunión..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltro('pendientes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === 'pendientes'
                  ? 'bg-blue-400 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltro('proceso')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === 'proceso'
                  ? 'bg-yellow-400 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              En Proceso
            </button>
            <button
              onClick={() => setFiltro('revision')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === 'revision'
                  ? 'bg-purple-400 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              En Revisión
            </button>
            <button
              onClick={() => setFiltro('finalizadas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === 'finalizadas'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              Finalizadas
            </button>
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === 'todas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
          </div>
        </div>
      </div>

      {/* ===== LISTA DE TAREAS ===== */}
      {cargando ? (
        <div className="text-center py-12 text-slate-800 opacity-60">
          <FaSpinner className="text-4xl animate-spin mx-auto" />
          <p className="mt-2">Cargando tareas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl">
          {error}
        </div>
      ) : tareasFiltradas.length === 0 ? (
        <div className="text-center py-12 text-slate-800 opacity-40">
          <FaTasks className="text-6xl mx-auto mb-4 opacity-20" />
          <p className="text-lg">No hay tareas que coincidan con los filtros</p>
          <p className="text-sm">Intenta ajustar los filtros o la búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tareasFiltradas.map((tarea) => (
            <div 
              key={tarea.tar_id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 m-0">
                    {tarea.tar_nombre}
                  </h3>
                  {tarea.reunion_titulo && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 opacity-60 mt-1">
                      <FaClipboardList size={12} />
                      <span>Reunión: {tarea.reunion_titulo}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-3">
                  {getEstadoBadge(tarea.tar_estatus)}
                  {getPrioridadBadge(tarea.tar_prioridad)}
                </div>
              </div>

              {tarea.tar_descripcion && (
                <p className="text-sm text-slate-800 opacity-70 mb-3 line-clamp-2">
                  {tarea.tar_descripcion}
                </p>
              )}

              {/* Mostrar comentario si existe */}
              {tarea.tar_nota && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FaComment className="text-blue-600 mt-0.5" size={14} />
                    <div>
                      <p className="text-xs font-medium text-blue-700 m-0">Comentario:</p>
                      <p className="text-sm text-slate-700 m-0">{tarea.tar_nota}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <FaUser className="text-blue-600" />
                  <span>
                    {tarea.usuario_nombre} {tarea.usuario_apellido}
                  </span>
                </div>
                
                {tarea.usuario_puesto && (
                  <div className="flex items-center gap-1.5 text-slate-800 opacity-60">
                    <FaBuilding size={14} />
                    <span>{tarea.usuario_puesto}</span>
                  </div>
                )}                
                <div className="flex items-center gap-1.5 text-slate-800 opacity-60">
                  <FaCalendarAlt size={14} />
                  <span>Fecha limite: {new Date(tarea.tar_fecha).toLocaleDateString('es-ES')}</span>
                </div>
              </div>

              {/* ===== BOTONES DE ACCIÓN ===== */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                {/* ✅ Botón para cambiar a Iniciar */}
                {tarea.tar_estatus !== 'Iniciar' && (
                  <button
                    onClick={() => abrirModal(tarea, 'Iniciar')}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FaPlay size={12} />
                    Iniciar
                  </button>
                )}

                {/* ✅ Botón para cambiar a Proceso */}
                {tarea.tar_estatus !== 'Proceso' && tarea.tar_estatus !== 'Finalizado' && (
                  <button
                    onClick={() => abrirModal(tarea, 'Proceso')}
                    className="px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FaClock size={12} />
                    En Proceso
                  </button>
                )}

                {/* ✅ Botón para cambiar a Revisión */}
                {tarea.tar_estatus !== 'Revision' && tarea.tar_estatus !== 'Finalizado' && (
                  <button
                    onClick={() => abrirModal(tarea, 'Revision')}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FaSearch size={12} />
                    En Revisión
                  </button>
                )}

                {/* ✅ Botón para cambiar a Finalizado */}
                {tarea.tar_estatus !== 'Finalizado' && (
                  <button
                    onClick={() => abrirModal(tarea, 'Finalizado')}
                    className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FaCheck size={12} />
                    Finalizado
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModal}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">
                  Cambiar Estado
                </h2>
                <p className="text-sm text-slate-800 opacity-60 mt-1">
                  {tareaSeleccionada.tar_nombre}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-slate-800 opacity-40 hover:opacity-60 transition-opacity"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Información de la tarea */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-800 opacity-60">Estado actual:</span>
                {getEstadoBadge(tareaSeleccionada.tar_estatus)}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-slate-800 opacity-60">Nuevo estado:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {getEstadoLabel(nuevoEstado)}
                </span>
              </div>
            </div>

            {/* Selector de estado (opcional, si quieres permitir cambiar) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-2">
                Seleccionar estado
              </label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
              >
                <option value="Iniciar">Iniciar</option>
                <option value="Proceso">En Proceso</option>
                <option value="Revision">En Revisión</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>

            {/* Campo de comentario */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-800 mb-2">
                <FaComment className="inline mr-2" />
                Comentario (opcional)
              </label>
              <textarea
                placeholder="Agrega un comentario sobre el cambio de estado..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
              />
            </div>

            {/* Error del modal */}
            {errorModal && (
              <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm mb-4">
                {errorModal}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={cerrarModal}
                className="flex-1 px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={actualizarEstadoConComentario}
                disabled={guardando}
                className={`flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  guardando 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:bg-blue-700 hover:scale-105'
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
                    Actualizar Estado
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