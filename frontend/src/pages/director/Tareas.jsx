// src/pages/director/Tareas.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  FaClipboardList, 
  FaRocket, 
  FaSync, 
  FaPaperPlane, 
  FaCheckCircle,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUser,
  FaUsers,
  FaBuilding,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaTimes,
  FaUserCircle,
  FaCalendarDay,
  FaIndustry,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaCalendar,
  FaClock as FaClockIcon,
  FaEdit
} from 'react-icons/fa';
import { MdPending } from 'react-icons/md';

// Departamentos disponibles
const DEPARTAMENTOS = [
  { id: 1, nombre: 'Administración', color: 'bg-purple-100 text-purple-800' },
  { id: 2, nombre: 'Ventas', color: 'bg-blue-100 text-blue-800' },
  { id: 3, nombre: 'Marketing', color: 'bg-pink-100 text-pink-800' },
  { id: 4, nombre: 'Desarrollo', color: 'bg-green-100 text-green-800' },
  { id: 5, nombre: 'Recursos Humanos', color: 'bg-orange-100 text-orange-800' }
];

// Configuración de columnas (estatus)
const COLUMNAS = [
  { 
    id: 'Iniciar', 
    titulo: 'Iniciar', 
    icono: <FaRocket className="text-orange-500" />,
    color: 'border-orange-400 bg-orange-50',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-700'
  },
  { 
    id: 'Proceso', 
    titulo: 'Proceso', 
    icono: <FaSync className="text-blue-500" />,
    color: 'border-blue-400 bg-blue-50',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  { 
    id: 'Revision', 
    titulo: 'Revisión', 
    icono: <FaPaperPlane className="text-purple-500" />,
    color: 'border-purple-400 bg-purple-50',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  { 
    id: 'Finalizado', 
    titulo: 'Finalizado', 
    icono: <FaCheckCircle className="text-green-500" />,
    color: 'border-green-400 bg-green-50',
    bg: 'bg-green-50',
    border: 'border-green-200',
    textColor: 'text-green-700'
  }
];

export default function DirectorTareas() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await api.get('/tareas');
      console.log('📊 Respuesta completa:', response.data);
      
      // ✅ VALIDACIÓN: Verificar que los datos existan
      let tareasData = [];
      if (response.data && response.data.success) {
        tareasData = response.data.tareas || [];
      } else if (Array.isArray(response.data)) {
        tareasData = response.data;
      } else if (response.data && Array.isArray(response.data.tareas)) {
        tareasData = response.data.tareas;
      } else {
        tareasData = [];
      }
      
      // ✅ VALIDACIÓN: Asegurar que cada tarea tenga los campos necesarios
      const tareasValidadas = tareasData.map(tarea => ({
        ...tarea,
        use_id: tarea.use_id || null,
        reu_id: tarea.reu_id || null,
        usuario_nombre: tarea.usuario_nombre || null,
        usuario_apellido: tarea.usuario_apellido || null,
        usuario_telefono: tarea.usuario_telefono || null,
        usuario_correo: tarea.usuario_correo || null,
        usuario_puesto: tarea.usuario_puesto || null,
        reunion_titulo: tarea.reunion_titulo || null,
        reunion_descripcion: tarea.reunion_descripcion || null,
        reunion_fecha: tarea.reunion_fecha || null,
        departamento_id: tarea.departamento_id || null,
        departamento_nombre: tarea.departamento_nombre || null
      }));
      
      setTareas(tareasValidadas);
      console.log('✅ Tareas cargadas:', tareasValidadas.length);
    } catch (err) {
      console.error('❌ Error al cargar tareas:', err);
      setError(err.response?.data?.message || 'Error al cargar las tareas');
    } finally {
      setCargando(false);
    }
  };

  const getPrioridadColor = (prioridad) => {
    if (!prioridad) return 'bg-gray-100 text-gray-800 border-gray-200';
    const colores = {
      'alta': 'bg-red-100 text-red-800 border-red-200',
      'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baja': 'bg-green-100 text-green-800 border-green-200'
    };
    return colores[prioridad] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadIcon = (prioridad) => {
    if (!prioridad) return null;
    const iconos = {
      'alta': <FaExclamationTriangle className="text-red-500" />,
      'media': <FaExclamationTriangle className="text-yellow-500" />,
      'baja': <FaExclamationTriangle className="text-green-500" />
    };
    return iconos[prioridad] || null;
  };

  const getEstatusBadgeColor = (estatus) => {
    if (!estatus) return 'bg-gray-100 text-gray-800';
    const colores = {
      'Iniciar': 'bg-orange-100 text-orange-800',
      'Proceso': 'bg-blue-100 text-blue-800',
      'Revision': 'bg-purple-100 text-purple-800',
      'Finalizado': 'bg-green-100 text-green-800'
    };
    return colores[estatus] || 'bg-gray-100 text-gray-800';
  };

  const getEstatusIcon = (estatus) => {
    if (!estatus) return <FaClipboardList className="text-gray-500" />;
    const iconos = {
      'Iniciar': <FaRocket className="text-orange-500" />,
      'Proceso': <FaSync className="text-blue-500" />,
      'Revision': <FaPaperPlane className="text-purple-500" />,
      'Finalizado': <FaCheckCircle className="text-green-500" />
    };
    return iconos[estatus] || <FaClipboardList className="text-gray-500" />;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const getDepartamentoNombre = (id) => {
    if (!id) return 'Sin departamento';
    const dep = DEPARTAMENTOS.find(d => d.id === id);
    return dep ? dep.nombre : 'Sin departamento';
  };

  const getDepartamentoColor = (id) => {
    if (!id) return 'bg-gray-100 text-gray-800';
    const dep = DEPARTAMENTOS.find(d => d.id === id);
    return dep ? dep.color : 'bg-gray-100 text-gray-800';
  };

  // Filtrar tareas por departamento y búsqueda
  const tareasFiltradas = tareas.filter(tarea => {
    // ✅ VALIDACIÓN: Verificar que tarea existe
    if (!tarea) return false;
    
    const coincideDepartamento = filtroDepartamento === '' || tarea.departamento_id === parseInt(filtroDepartamento);
    const coincideBusqueda = 
      (tarea.tar_nombre?.toLowerCase() || '').includes(filtroBusqueda.toLowerCase()) ||
      (tarea.tar_descripcion?.toLowerCase() || '').includes(filtroBusqueda.toLowerCase()) ||
      (tarea.tar_id?.toString() || '').includes(filtroBusqueda);
    return coincideDepartamento && coincideBusqueda;
  });

  // Agrupar tareas por estatus
  const tareasPorColumna = COLUMNAS.map(columna => ({
    ...columna,
    tareas: tareasFiltradas.filter(t => t && t.tar_estatus === columna.id)
  }));

  // Contar tareas por estatus
  const contarPorEstatus = (estatus) => {
    return tareas.filter(t => t && t.tar_estatus === estatus).length;
  };

  // Obtener nombre completo del usuario
  const getNombreCompleto = (tarea) => {
    if (!tarea) return 'Sin asignar';
    if (tarea.usuario_nombre && tarea.usuario_apellido) {
      return `${tarea.usuario_nombre} ${tarea.usuario_apellido}`;
    }
    if (tarea.usuario_nombre) {
      return tarea.usuario_nombre;
    }
    return `ID: ${tarea.use_id || 'Sin asignar'}`;
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        <p className="text-gray-500">Cargando tareas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaClipboardList className="text-blue-600 text-4xl" />
              Tablero de Tareas
            </h1>
            <p className="text-gray-500 mt-1">
              Visualiza y organiza todas las tareas del sistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cargarTareas}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSync className={cargando ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-700">{tareas.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">
                {contarPorEstatus('Iniciar') + contarPorEstatus('Proceso')}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MdPending className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En Revisión</p>
              <p className="text-2xl font-bold text-purple-600">
                {contarPorEstatus('Revision')}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaPaperPlane className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Finalizadas</p>
              <p className="text-2xl font-bold text-green-600">
                {contarPorEstatus('Finalizado')}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] flex items-center gap-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="flex-1 border-none outline-none text-gray-700 bg-transparent placeholder-gray-400"
            />
            {filtroBusqueda && (
              <button
                onClick={() => setFiltroBusqueda('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <FaIndustry className="text-gray-400" />
            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[150px]"
            >
              <option value="">Todos los deptos.</option>
              {DEPARTAMENTOS.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {tareasFiltradas.length} de {tareas.length} tareas
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <FaTimes className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Tablero Kanban - Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tareasPorColumna.map((columna) => (
          <div key={columna.id} className="min-h-[400px]">
            {/* Header de la columna */}
            <div className={`${columna.bg} rounded-t-xl p-3 border ${columna.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {columna.icono}
                  <h3 className={`font-semibold ${columna.textColor}`}>
                    {columna.titulo}
                  </h3>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${columna.bg} ${columna.textColor} border ${columna.border}`}>
                  {columna.tareas.length}
                </span>
              </div>
            </div>

            {/* Contenido de la columna */}
            <div className={`${columna.bg} rounded-b-xl p-3 border-x border-b ${columna.border} min-h-[300px]`}>
              {columna.tareas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">Sin tareas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {columna.tareas.map((tarea) => (
                    <div
                      key={tarea.tar_id}
                      className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setTareaSeleccionada(tarea)}
                    >
                      {/* ID y Prioridad */}
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          #{tarea.tar_id || 'N/A'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(tarea.tar_prioridad)}`}>
                          {getPrioridadIcon(tarea.tar_prioridad)}
                          <span className="ml-1 capitalize">{tarea.tar_prioridad || 'Sin prioridad'}</span>
                        </span>
                      </div>

                      {/* Título */}
                      <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                        {tarea.tar_nombre || 'Sin nombre'}
                      </h4>

                      {/* Descripción */}
                      {tarea.tar_descripcion && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {tarea.tar_descripcion}
                        </p>
                      )}

                      {/* Usuario asignado - Mostrar nombre completo */}
                      {tarea.use_id && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <FaUser className="text-xs text-blue-400" />
                            {getNombreCompleto(tarea)}
                          </span>
                        </div>
                      )}

                      {/* Departamento */}
                      {tarea.departamento_id && (
                        <div className="mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getDepartamentoColor(tarea.departamento_id)}`}>
                            <FaBuilding className="text-xs" />
                            {getDepartamentoNombre(tarea.departamento_id)}
                          </span>
                        </div>
                      )}

                      {/* Footer de la tarjeta */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FaCalendarAlt className="text-blue-400" />
                          <span>{formatearFecha(tarea.tar_fecha)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {tarea.reu_id && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1 max-w-[80px]">
                              <FaUsers className="text-xs flex-shrink-0" />
                              <span className="truncate">
                                {tarea.reunion_titulo || `RE-${tarea.reu_id}`}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Solo mostrar si hay tarea seleccionada */}
      {tareaSeleccionada && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setTareaSeleccionada(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getEstatusBadgeColor(tareaSeleccionada.tar_estatus)}`}>
                  {getEstatusIcon(tareaSeleccionada.tar_estatus)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {tareaSeleccionada.tar_nombre || 'Sin nombre'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      #{tareaSeleccionada.tar_id || 'N/A'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(tareaSeleccionada.tar_prioridad)}`}>
                      {getPrioridadIcon(tareaSeleccionada.tar_prioridad)}
                      <span className="ml-1 capitalize">{tareaSeleccionada.tar_prioridad || 'Sin prioridad'}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstatusBadgeColor(tareaSeleccionada.tar_estatus)}`}>
                      {tareaSeleccionada.tar_estatus || 'Sin estatus'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTareaSeleccionada(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="space-y-4">
              {/* Descripción */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción</h3>
                <p className="text-gray-700">
                  {tareaSeleccionada.tar_descripcion || 'Sin descripción'}
                </p>
              </div>

              {/* Información de la Tarea */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500" />
                    Información de la Tarea
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-blue-100/50">
                      <span className="text-sm text-gray-500">Fecha límite</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatearFecha(tareaSeleccionada.tar_fecha)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-blue-100/50">
                      <span className="text-sm text-gray-500">Departamento</span>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getDepartamentoColor(tareaSeleccionada.departamento_id)}`}>
                        {getDepartamentoNombre(tareaSeleccionada.departamento_id)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del Usuario */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaUser className="text-green-500" />
                    Usuario Asignado
                  </h3>
                  {tareaSeleccionada.use_id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 py-1 border-b border-green-100/50">
                        <FaUserCircle className="text-2xl text-green-500" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {getNombreCompleto(tareaSeleccionada)}
                          </p>
                          <p className="text-xs text-gray-500">ID: {tareaSeleccionada.use_id}</p>
                        </div>
                      </div>
                      {tareaSeleccionada.usuario_telefono && (
                        <div className="flex items-center gap-2 py-1 border-b border-green-100/50">
                          <FaPhone className="text-green-400 text-xs" />
                          <span className="text-sm text-gray-700">{tareaSeleccionada.usuario_telefono}</span>
                        </div>
                      )}
                      {tareaSeleccionada.usuario_correo && (
                        <div className="flex items-center gap-2 py-1 border-b border-green-100/50">
                          <FaEnvelope className="text-green-400 text-xs" />
                          <span className="text-sm text-gray-700">{tareaSeleccionada.usuario_correo}</span>
                        </div>
                      )}
                      {tareaSeleccionada.usuario_puesto && (
                        <div className="flex items-center gap-2 py-1">
                          <FaUserTie className="text-green-400 text-xs" />
                          <span className="text-sm text-gray-700">{tareaSeleccionada.usuario_puesto}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No hay usuario asignado</p>
                  )}
                </div>
              </div>

              {/* Información de la Reunión */}
              {tareaSeleccionada.reu_id && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaUsers className="text-purple-500" />
                    Reunión Asociada
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-1 border-b border-purple-100/50">
                      <FaCalendarDay className="text-purple-400" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {tareaSeleccionada.reunion_titulo || 'Sin título'}
                        </p>
                        <p className="text-xs text-gray-500">ID: {tareaSeleccionada.reu_id}</p>
                      </div>
                    </div>
                    {tareaSeleccionada.reunion_descripcion && (
                      <div className="py-1 border-b border-purple-100/50">
                        <p className="text-sm text-gray-600">{tareaSeleccionada.reunion_descripcion}</p>
                      </div>
                    )}
                    {tareaSeleccionada.reunion_fecha && (
                      <div className="flex items-center gap-2 py-1">
                        <FaCalendar className="text-purple-400 text-xs" />
                        <span className="text-sm text-gray-700">{formatearFecha(tareaSeleccionada.reunion_fecha)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setTareaSeleccionada(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}