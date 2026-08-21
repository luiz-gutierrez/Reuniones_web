// src/pages/gerente/Tareas.jsx
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
  FaEye
} from 'react-icons/fa';
import { MdPending, MdPublishedWithChanges } from 'react-icons/md';

export default function AsistenteTareas() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState('pendientes');
  const [actualizando, setActualizando] = useState(null);
  const [notaExpandida, setNotaExpandida] = useState({});

  useEffect(() => {
    if (user?.id) {
      cargarTareas();
    }
  }, [user]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tareas/usuario/${user.id}/todas`);
      console.log('📋 Tareas recibidas:', response.data);
      setTareas(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      setError(err.response?.data?.message || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (tareaId, nuevoEstatus) => {
    const estatusValidos = ['Iniciar', 'Proceso', 'Revision', 'Finalizado'];
    if (!estatusValidos.includes(nuevoEstatus)) {
      alert('Estatus no válido');
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de cambiar el estado esta tarea?`
    );
    if (!confirmar) return;

    setActualizando(tareaId);

    try {
      await api.put(`/tareas/${tareaId}/estado`, {
        tar_estatus: nuevoEstatus
      });
      
      await cargarTareas();
      alert(`✅ Tarea actualizada correctamente`);

    } catch (error) {
      console.error('Error al actualizar estado:', error);
      const mensajeError = error.response?.data?.message || 'Error al actualizar el estado';
      alert(`❌ Error: ${mensajeError}`);
    } finally {
      setActualizando(null);
    }
  };

  // Toggle nota expandida
  const toggleNota = (tareaId) => {
    setNotaExpandida(prev => ({
      ...prev,
      [tareaId]: !prev[tareaId]
    }));
  };

  // Filtrar tareas
  const tareasFiltradas = tareas.filter(tarea => {
    let estatusMatch = true;
    
    if (filtroEstatus === 'pendientes') {
      estatusMatch = tarea.tar_estatus === 'Iniciar' || tarea.tar_estatus === 'Proceso';
    } else if (filtroEstatus === 'revision') {
      estatusMatch = tarea.tar_estatus === 'Revision';
    } else if (filtroEstatus === 'finalizadas') {
      estatusMatch = tarea.tar_estatus === 'Finalizado';
    } else if (filtroEstatus === 'todas') {
      estatusMatch = true;
    }

    return estatusMatch;
  });

  // Contar tareas por estatus
  const contarPorEstatus = (estatus) => {
    return tareas.filter(t => t.tar_estatus === estatus).length;
  };

  // Obtener clase de color para estatus
  const getEstatusColor = (estatus) => {
    const colores = {
      'Iniciar': 'bg-orange-100 text-orange-800 border-orange-200',
      'Proceso': 'bg-blue-100 text-blue-800 border-blue-200',
      'Revision': 'bg-purple-100 text-purple-800 border-purple-200',
      'Finalizado': 'bg-green-100 text-green-800 border-green-200'
    };
    return colores[estatus] || 'bg-gray-100 text-gray-800';
  };

  // Obtener icono según estatus
  const getEstatusIcon = (estatus) => {
    const iconos = {
      'Iniciar': <FaRocket className="inline mr-1" />,
      'Proceso': <FaSync className="inline mr-1" />,
      'Revision': <FaPaperPlane className="inline mr-1" />,
      'Finalizado': <FaCheckCircle className="inline mr-1" />
    };
    return iconos[estatus] || <FaClipboardList className="inline mr-1" />;
  };

  // Obtener icono de prioridad
  const getPrioridadIcon = (prioridad) => {
    const iconos = {
      'alta': <FaExclamationTriangle className="text-red-500" />,
      'media': <FaExclamationTriangle className="text-yellow-500" />,
      'baja': <FaExclamationTriangle className="text-green-500" />
    };
    return iconos[prioridad] || null;
  };

  // Obtener clase de prioridad
  const getPrioridadClase = (prioridad) => {
    const clases = {
      'alta': 'bg-red-100 text-red-800 border-red-200',
      'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baja': 'bg-green-100 text-green-800 border-green-200'
    };
    return clases[prioridad] || 'bg-gray-100 text-gray-800';
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener el título según el filtro
  const getTitulo = () => {
    switch(filtroEstatus) {
      case 'pendientes':
        return 'Mis Tareas Pendientes';
      case 'revision':
        return 'Tareas en Revisión';
      case 'finalizadas':
        return 'Tareas Finalizadas';
      case 'todas':
        return 'Todas mis Tareas';
      default:
        return 'Mis Tareas';
    }
  };

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
          <FaClipboardList className="text-blue-600 text-4xl" />
          {getTitulo()}
        </h1>
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
                <MdPending className="text-blue-500" />Pendientes
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {tareas.filter(t => t.tar_estatus === 'Iniciar' || t.tar_estatus === 'Proceso').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              <MdPending className="text-blue-600 text-3xl" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all cursor-pointer hover:shadow-md ${
            filtroEstatus === 'revision' ? 'border-purple-500 bg-purple-50' : 'border-gray-100'
          }`}
          onClick={() => setFiltroEstatus('revision')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                <FaPaperPlane className="text-purple-500" /> En Revisión
              </p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{contarPorEstatus('Revision')}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              <FaPaperPlane className="text-purple-600 text-3xl" />
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
              <p className="text-3xl font-bold text-green-600 mt-1">{contarPorEstatus('Finalizado')}</p>
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
              <p className="text-3xl font-bold text-gray-700 mt-1">{tareas.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
              <FaClipboardList className="text-gray-600 text-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <FaTag className="text-blue-500" /> Estatus:
          </label>
          <select
            value={filtroEstatus}
            onChange={(e) => setFiltroEstatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="pendientes">📌 Pendientes</option>
            <option value="revision">📤 En Revisión</option>
            <option value="finalizadas">✅ Finalizadas</option>
            <option value="todas">📊 Todas</option>
          </select>
        </div>

        <span className="text-sm text-gray-500 ml-auto flex items-center gap-1">
          <FaInfoCircle className="text-blue-400" />
          Mostrando {tareasFiltradas.length} de {tareas.length} tareas
        </span>
      </div>

      {/* ===== TARJETAS DE TAREAS ===== */}
      {tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">
            {filtroEstatus === 'pendientes' ? '🎉' : 
             filtroEstatus === 'revision' ? '📭' : 
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tareasFiltradas.map((tarea) => (
            <div
              key={tarea.tar_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden"
            >
              {/* ===== NOTA EN LA PARTE SUPERIOR ===== */}
              {tarea.tar_nota && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <FaComment className="text-blue-600 mt-0.5 flex-shrink-0" size={14} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-700 m-0">📝 Nota:</p>
                      <div className="text-sm text-gray-700">
                        <div className={`${!notaExpandida[tarea.tar_id] ? 'line-clamp-2' : ''}`}>
                          {tarea.tar_nota}
                        </div>
                        {tarea.tar_nota.length > 60 && (
                          <button
                            onClick={() => toggleNota(tarea.tar_id)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
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

              {/* ===== CONTENIDO DE LA TAREA ===== */}
              <div className="p-5">
                {/* Header: Nombre y prioridad */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base m-0 truncate">
                      {tarea.tar_nombre}
                    </h3>
                    {tarea.reunion_titulo && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <FaClipboardList size={12} />
                        <span>Reunión: {tarea.reunion_titulo}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getPrioridadClase(tarea.tar_prioridad)}`}>
                      {getPrioridadIcon(tarea.tar_prioridad)}
                      {tarea.tar_prioridad}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getEstatusColor(tarea.tar_estatus)}`}>
                      {getEstatusIcon(tarea.tar_estatus)}
                      {tarea.tar_estatus}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                {tarea.tar_descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {tarea.tar_descripcion}
                  </p>
                )}

                {/* Información de usuario y fecha */}
                <div className="flex flex-wrap gap-3 text-sm border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <FaUser className="text-blue-500 text-xs" />
                    <span className="truncate">
                      {tarea.usuario_nombre} {tarea.usuario_apellido}
                    </span>
                  </div>
                  
                  {tarea.usuario_puesto && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <FaTag className="text-gray-400" size={12} />
                      <span>{tarea.usuario_puesto}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs ml-auto">
                    <FaCalendarAlt className="text-gray-400" size={12} />
                    <span>Límite: {formatearFecha(tarea.tar_fecha)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {tarea.tar_estatus === 'Iniciar' || tarea.tar_estatus === 'Proceso' ? (
                    <select
                      value={tarea.tar_estatus}
                      onChange={(e) => actualizarEstado(tarea.tar_id, e.target.value)}
                      disabled={actualizando === tarea.tar_id}
                      className={`w-full px-3 py-2 text-sm rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        actualizando === tarea.tar_id 
                          ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                          : 'hover:border-blue-400'
                      } ${
                        tarea.tar_estatus === 'Iniciar' 
                          ? 'border-orange-300 bg-orange-50 text-orange-700' 
                          : 'border-blue-300 bg-blue-50 text-blue-700'
                      }`}
                    >
                      <option value="Iniciar">🚀 Iniciar</option>
                      <option value="Proceso">🔄 Proceso</option>
                      <option value="Revision">📤 Revisión</option>
                    </select>
                  ) : (
                    <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                      <FaCheckCircle className="text-green-400" />
                      {tarea.tar_estatus === 'Revision' 
                        ? 'En espera de aprobación' 
                        : '✅ Tarea completada'}
                    </div>
                  )}
                </div>

                {/* ID de la tarea */}
                <div className="mt-2 text-xs text-gray-400 text-right">
                  ID: #{tarea.tar_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}