// src/pages/asistente/Tareas.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaClipboardList, 
  FaRocket, 
  FaSync, 
  FaPaperPlane, 
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaUser,
  FaTag,
  FaComment,
  FaEye,
  FaSpinner,
  FaSearch,
  FaBuilding,
  FaUserTie,
  FaArrowRight
} from 'react-icons/fa';
import { MdPending } from 'react-icons/md';

export default function AsistenteTareas() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState('pendientes');
  const [actualizando, setActualizando] = useState(null);
  const [notaExpandida, setNotaExpandida] = useState({});
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (user?.id) {
      cargarTareas();
    }
  }, [user]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      // ✅ La Asistente ve SOLO sus tareas
      const response = await api.get(`/tareas/usuario/${user.id}/todas`);
      console.log('📋 Tareas recibidas:', response.data);
      
      if (response.data.success !== undefined) {
        setTareas(response.data.tareas || []);
      } else {
        setTareas(response.data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      setError(err.response?.data?.message || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  // ========== ACTUALIZAR ESTADO - ASISTENTE (SIN ORDEN) ==========
  const actualizarEstado = async (tareaId, nuevoEstatus) => {
    // ✅ Estados válidos para Asistente: Iniciar, Proceso, Revision
    const estatusValidos = ['Iniciar', 'Proceso', 'Revision'];
    if (!estatusValidos.includes(nuevoEstatus)) {
      alert('❌ Estado no válido para Asistente');
      return;
    }

    const tarea = tareas.find(t => t.tar_id === tareaId);
    if (!tarea) {
      alert('❌ Tarea no encontrada');
      return;
    }

    const estadoActual = tarea.tar_estatus;

    // ✅ Validar que no se pueda pasar a Revision si ya está en Revision o Finalizado
    if (nuevoEstatus === 'Revision' && ['Revision', 'Finalizado'].includes(estadoActual)) {
      alert(`❌ No puedes enviar a Revision una tarea que ya está en "${estadoActual}"`);
      return;
    }

    // ✅ Mensaje de confirmación personalizado
    let mensajeConfirmacion = '';
    if (nuevoEstatus === 'Revision') {
      mensajeConfirmacion = '¿Estás seguro de enviar esta tarea a Revisión?';
    } else if (nuevoEstatus === 'Proceso') {
      mensajeConfirmacion = '¿Estás seguro de poner esta tarea en Proceso?';
    } else {
      mensajeConfirmacion = `¿Estás seguro de cambiar el estado de esta tarea a "${nuevoEstatus}"?`;
    }

    if (!window.confirm(mensajeConfirmacion)) return;

    setActualizando(tareaId);

    try {
      await api.put(`/tareas/${tareaId}/estado`, {
        tar_estatus: nuevoEstatus
      });
      
      await cargarTareas();
      alert(`✅ Tarea actualizada correctamente a "${nuevoEstatus}"`);

    } catch (error) {
      console.error('Error al actualizar estado:', error);
      const mensajeError = error.response?.data?.message || 'Error al actualizar el estado';
      alert(`❌ Error: ${mensajeError}`);
    } finally {
      setActualizando(null);
    }
  };

  // ========== TOGGLE NOTA ==========
  const toggleNota = (tareaId) => {
    setNotaExpandida(prev => ({
      ...prev,
      [tareaId]: !prev[tareaId]
    }));
  };

  // ========== FILTRAR TAREAS ==========
  const tareasFiltradas = tareas.filter(tarea => {
    let estatusMatch = true;
    
    if (filtroEstatus === 'pendientes') {
      estatusMatch = ['Iniciar', 'Proceso', 'Prerevision'].includes(tarea.tar_estatus);
    } else if (filtroEstatus === 'revision') {
      estatusMatch = tarea.tar_estatus === 'Revision';
    } else if (filtroEstatus === 'finalizadas') {
      estatusMatch = tarea.tar_estatus === 'Finalizado';
    } else if (filtroEstatus === 'todas') {
      estatusMatch = true;
    }

    // Búsqueda
    if (busqueda.trim()) {
      const searchTerm = busqueda.toLowerCase().trim();
      const nombreMatch = tarea.tar_nombre?.toLowerCase().includes(searchTerm);
      const descMatch = tarea.tar_descripcion?.toLowerCase().includes(searchTerm);
      const usuarioMatch = `${tarea.usuario_nombre} ${tarea.usuario_apellido}`.toLowerCase().includes(searchTerm);
      return nombreMatch || descMatch || usuarioMatch;
    }

    return estatusMatch;
  });

  // ========== ESTADÍSTICAS ==========
  const estadisticas = {
    pendientes: tareas.filter(t => ['Iniciar', 'Proceso', 'Prerevision'].includes(t.tar_estatus)).length,
    revision: tareas.filter(t => t.tar_estatus === 'Revision').length,
    finalizadas: tareas.filter(t => t.tar_estatus === 'Finalizado').length,
    total: tareas.length
  };

  // ========== UTILIDADES ==========
  const getEstadoColor = (estatus) => {
    const colores = {
      'Iniciar': 'bg-orange-100 text-orange-800 border-orange-200',
      'Proceso': 'bg-blue-100 text-blue-800 border-blue-200',
      'Prerevision': 'bg-purple-100 text-purple-800 border-purple-200',
      'Revision': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Finalizado': 'bg-green-100 text-green-800 border-green-200'
    };
    return colores[estatus] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estatus) => {
    const iconos = {
      'Iniciar': <FaRocket className="inline mr-1" />,
      'Proceso': <FaSync className="inline mr-1" />,
      'Prerevision': <FaSearch className="inline mr-1" />,
      'Revision': <FaEye className="inline mr-1" />,
      'Finalizado': <FaCheckCircle className="inline mr-1" />
    };
    return iconos[estatus] || <FaClipboardList className="inline mr-1" />;
  };

  const getPrioridadIcon = (prioridad) => {
    const iconos = {
      'alta': <FaExclamationTriangle className="text-red-500" />,
      'media': <FaExclamationTriangle className="text-yellow-500" />,
      'baja': <FaExclamationTriangle className="text-green-500" />
    };
    return iconos[prioridad] || null;
  };

  const getPrioridadClase = (prioridad) => {
    const clases = {
      'alta': 'bg-red-100 text-red-800 border-red-200',
      'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baja': 'bg-green-100 text-green-800 border-green-200'
    };
    return clases[prioridad] || 'bg-gray-100 text-gray-800';
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

  const getTitulo = () => {
    switch(filtroEstatus) {
      case 'pendientes': return 'Mis Tareas Pendientes';
      case 'revision': return 'Mis Tareas en Revisión';
      case 'finalizadas': return 'Mis Tareas Finalizadas';
      case 'todas': return 'Todas mis Tareas';
      default: return 'Mis Tareas';
    }
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-gray-500">Cargando tus tareas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
          <h3 className="text-red-800 font-semibold text-lg mb-2">Error al cargar tareas</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={cargarTareas}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">

          {getTitulo()}
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2">
          <FaUserTie className="text-blue-500" />
          {user?.nombre} {user?.apellido} - Asistente
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div 
          className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${
            filtroEstatus === 'pendientes' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
          }`}
          onClick={() => setFiltroEstatus('pendientes')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <MdPending className="text-blue-500" /> Pendientes
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{estadisticas.pendientes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              <MdPending className="text-blue-600 text-3xl" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${
            filtroEstatus === 'revision' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'
          }`}
          onClick={() => setFiltroEstatus('revision')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <FaEye className="text-indigo-500" /> En Revisión
              </p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{estadisticas.revision}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
              <FaEye className="text-indigo-600 text-3xl" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${
            filtroEstatus === 'finalizadas' ? 'border-green-500 bg-green-50' : 'border-gray-100'
          }`}
          onClick={() => setFiltroEstatus('finalizadas')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <FaCheckCircle className="text-green-500" /> Finalizadas
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">{estadisticas.finalizadas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              <FaCheckCircle className="text-green-600 text-3xl" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${
            filtroEstatus === 'todas' ? 'border-gray-500 bg-gray-50' : 'border-gray-100'
          }`}
          onClick={() => setFiltroEstatus('todas')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <FaClipboardList className="text-gray-500" /> Todas
              </p>
              <p className="text-3xl font-bold text-gray-700 mt-1">{estadisticas.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
              <FaClipboardList className="text-gray-600 text-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <FaTag className="text-blue-500" /> Estatus:
            </label>
            <select
              value={filtroEstatus}
              onChange={(e) => setFiltroEstatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="pendientes">📌 Pendientes</option>
              <option value="revision">👁️ En Revisión</option>
              <option value="finalizadas">✅ Finalizadas</option>
              <option value="todas">📊 Todas</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400 text-right">
          Mostrando {tareasFiltradas.length} de {tareas.length} tareas
        </div>
      </div>

      {/* ===== TARJETAS DE TAREAS ===== */}
      {tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">
            {filtroEstatus === 'pendientes' ? '🎉' : 
             filtroEstatus === 'revision' ? '👁️' : 
             filtroEstatus === 'finalizadas' ? '📋' : '📊'}
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filtroEstatus === 'pendientes' ? '¡No hay tareas pendientes!' : 
             filtroEstatus === 'revision' ? 'No hay tareas en Revisión' : 
             filtroEstatus === 'finalizadas' ? 'No hay tareas finalizadas' : 
             'No hay tareas para mostrar'}
          </h3>
          <p className="text-gray-500">
            {tareas.length === 0 
              ? 'No tienes tareas asignadas actualmente' 
              : 'No se encontraron tareas con los filtros seleccionados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tareasFiltradas.map((tarea) => (
            <div
              key={tarea.tar_id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* ===== NOTA ===== */}
              {tarea.tar_nota && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                      <FaComment className="text-blue-600" size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-700 m-0 mb-0.5">📝 Nota</p>
                      <div className="text-sm text-gray-700">
                        <div className={`${!notaExpandida[tarea.tar_id] ? 'line-clamp-2' : ''}`}>
                          {tarea.tar_nota}
                        </div>
                        {tarea.tar_nota.length > 60 && (
                          <button
                            onClick={() => toggleNota(tarea.tar_id)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1 transition-colors"
                          >
                            {notaExpandida[tarea.tar_id] ? (
                              <><FaChevronUp className="text-xs" /> Ver menos</>
                            ) : (
                              <><FaChevronDown className="text-xs" /> Ver más</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== CONTENIDO ===== */}
              <div className="p-4 md:p-5">
                {/* Header */}
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base m-0 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {tarea.tar_nombre}
                    </h3>
                    {tarea.reunion_titulo && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <FaClipboardList size={12} />
                        <span className="truncate">{tarea.reunion_titulo}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getPrioridadClase(tarea.tar_prioridad)}`}>
                      {getPrioridadIcon(tarea.tar_prioridad)}
                      {tarea.tar_prioridad}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(tarea.tar_estatus)}`}>
                      {getEstadoIcon(tarea.tar_estatus)}
                      {tarea.tar_estatus}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                {tarea.tar_descripcion && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                    {tarea.tar_descripcion}
                  </p>
                )}

                {/* Información de usuario y fecha */}
                <div className="flex flex-wrap items-center gap-3 text-sm border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                      {tarea.usuario_nombre?.charAt(0)}{tarea.usuario_apellido?.charAt(0)}
                    </div>
                    <span className="truncate text-xs">
                      {tarea.usuario_nombre} {tarea.usuario_apellido}
                    </span>
                  </div>
                  
                  {tarea.usuario_puesto && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <FaBuilding size={12} />
                      <span className="truncate">{tarea.usuario_puesto}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs ml-auto">
                    <FaCalendarAlt size={12} />
                    <span>Vence: {formatearFecha(tarea.tar_fecha)}</span>
                  </div>
                </div>

                {/* ===== ACCIONES - ASISTENTE (SIN ORDEN) ===== */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {['Iniciar', 'Proceso', 'Prerevision'].includes(tarea.tar_estatus) ? (
                    <div className="relative">
                      <select
                        value={tarea.tar_estatus}
                        onChange={(e) => actualizarEstado(tarea.tar_id, e.target.value)}
                        disabled={actualizando === tarea.tar_id}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer ${
                          actualizando === tarea.tar_id 
                            ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                            : 'hover:border-blue-400'
                        } ${
                          tarea.tar_estatus === 'Iniciar' 
                            ? 'border-orange-200 bg-orange-50 text-orange-700' 
                            : tarea.tar_estatus === 'Proceso'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-purple-200 bg-purple-50 text-purple-700'
                        }`}
                      >
                        {/* ✅ Siempre disponibles: Iniciar, Proceso, Revision */}
                        <option value="Iniciar">🚀 Iniciar</option>
                        <option value="Proceso">🔄 En Proceso</option>
                        <option value="Revision">📤 Enviar a Revisión</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FaChevronDown className={`text-gray-400 ${actualizando === tarea.tar_id ? 'opacity-50' : ''}`} size={14} />
                      </div>
                      {actualizando === tarea.tar_id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
                          <FaSpinner className="animate-spin text-blue-600" size={20} />
                        </div>
                      )}
                    </div>
                  ) : tarea.tar_estatus === 'Revision' ? (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700">
                      <FaClock className="text-indigo-500" />
                      En espera de revisión final
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-green-50 text-green-700">
                      <FaCheckCircle className="text-green-500" />
                      Tarea completada ✅
                    </div>
                  )}
                </div>

                {/* ID de la tarea */}
                <div className="mt-2 text-[10px] text-gray-300 text-right font-mono">
                  #{String(tarea.tar_id).padStart(4, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}