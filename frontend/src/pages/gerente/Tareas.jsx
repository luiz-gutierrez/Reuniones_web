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
  FaPlusCircle,
  FaMinusCircle
} from 'react-icons/fa';
import { MdPending, MdPublishedWithChanges } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';

export default function GerenteTareas() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState('pendientes');
  const [actualizando, setActualizando] = useState(null);
  const [descripcionExpandida, setDescripcionExpandida] = useState({});

  useEffect(() => {
    if (user?.id) {
      cargarTareas();
    }
  }, [user]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tareas/usuario/${user.id}/todas`);
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
      `¿Estás seguro de cambiar esta tarea a "${nuevoEstatus}"?`
    );
    if (!confirmar) return;

    setActualizando(tareaId);

    try {
      await api.put(`/tareas/${tareaId}/estado`, {
        tar_estatus: nuevoEstatus
      });
      
      await cargarTareas();
      alert(`✅ Tarea actualizada a "${nuevoEstatus}" correctamente`);

    } catch (error) {
      console.error('Error al actualizar estado:', error);
      const mensajeError = error.response?.data?.message || 'Error al actualizar el estado';
      alert(`❌ Error: ${mensajeError}`);
    } finally {
      setActualizando(null);
    }
  };

  // Toggle descripción expandida
  const toggleDescripcion = (tareaId) => {
    setDescripcionExpandida(prev => ({
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
      'Revisión': 'bg-purple-100 text-purple-800 border-purple-200',
      'Finalizado': 'bg-green-100 text-green-800 border-green-200'
    };
    return colores[estatus] || 'bg-gray-100 text-gray-800';
  };

  // Obtener icono según estatus
  const getEstatusIcon = (estatus) => {
    const iconos = {
      'Iniciar': <FaRocket className="inline mr-1" />,
      'Proceso': <FaSync className="inline mr-1" />,
      'Revisión': <FaPaperPlane className="inline mr-1" />,
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

  // Formatear fecha con hora
  const formatearFechaHora = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Obtener la descripción según el filtro
  const getDescripcion = () => {
    switch(filtroEstatus) {
      case 'pendientes':
        return 'Tareas que necesitan tu atención';
      case 'revision':
        return 'Tareas enviadas para revisión';
      case 'finalizadas':
        return 'Tareas completadas exitosamente';
      case 'todas':
        return 'Todas tus tareas';
      default:
        return '';
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaClipboardList className="text-blue-600 text-4xl" />
            {getTitulo()}
          </h1>
        </div>
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

      {/* Tabla de tareas */}
      {tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">
            {filtroEstatus === 'pendientes' ? '🎉' : 
             filtroEstatus === 'revision' ? '📭' : 
             filtroEstatus === 'finalizadas' ? '📋' : '📊'}
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filtroEstatus === 'pendientes' ? '¡No hay tareas pendientes!' : 
             filtroEstatus === 'revision' ? 'No hay tareas en revisión' : 
             filtroEstatus === 'finalizadas' ? 'No hay tareas finalizadas' : 
             'No hay tareas para mostrar'}
          </h3>
          <p className="text-gray-500">
            {tareas.length === 0 
              ? 'No tienes tareas asignadas actualmente' 
              : 'No se encontraron tareas con los filtros seleccionados'}
          </p>
          {filtroEstatus !== 'pendientes' && tareas.some(t => t.tar_estatus === 'Iniciar' || t.tar_estatus === 'Proceso') && (
            <button
              onClick={() => setFiltroEstatus('pendientes')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FaRocket /> Ver tareas pendientes
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Límite</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tareasFiltradas.map((tarea) => (
                  <tr key={tarea.tar_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      #{tarea.tar_id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {tarea.tar_nombre}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="text-sm text-gray-600">
                        {tarea.tar_descripcion ? (
                          <div>
                            <div className={`${!descripcionExpandida[tarea.tar_id] ? 'line-clamp-2' : ''}`}>
                              {tarea.tar_descripcion}
                            </div>
                            {tarea.tar_descripcion.length > 60 && (
                              <button
                                onClick={() => toggleDescripcion(tarea.tar_id)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                              >
                                {descripcionExpandida[tarea.tar_id] ? (
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
                        ) : (
                          <span className="text-gray-400 italic">Sin descripción</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaCalendarAlt className="text-blue-400 text-xs" />
                        {formatearFecha(tarea.tar_fecha)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getPrioridadClase(tarea.tar_prioridad)}`}>
                        {getPrioridadIcon(tarea.tar_prioridad)}
                        {tarea.tar_prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getEstatusColor(tarea.tar_estatus)}`}>
                        {getEstatusIcon(tarea.tar_estatus)}
                        {tarea.tar_estatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {tarea.tar_estatus === 'Iniciar' || tarea.tar_estatus === 'Proceso' ? (
                        <select
                          value={tarea.tar_estatus}
                          onChange={(e) => actualizarEstado(tarea.tar_id, e.target.value)}
                          disabled={actualizando === tarea.tar_id}
                          className={`px-3 py-1.5 text-xs rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
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
                          <option value="Revisión">📤 Revisión</option>
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400 italic flex items-center gap-1">
                          <FaCheckCircle className="text-green-400" />
                          {tarea.tar_estatus === 'Revisión' ? 'En espera de aprobación' : 'Completada'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pie de tabla */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaClipboardList className="text-blue-400" />
              Mostrando <span className="font-medium">{tareasFiltradas.length}</span> de{' '}
              <span className="font-medium">{tareas.length}</span> tareas
            </p>
            
          </div>
        </div>
      )}
    </div>
  );
}