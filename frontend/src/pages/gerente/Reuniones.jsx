// src/pages/gerente/Reuniones.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaUser, 
  FaInfoCircle,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaRegClock,
  FaFilter,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarCheck,
  FaCalendar
} from 'react-icons/fa';

export default function Reuniones() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reuniones, setReuniones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('hoy'); // 'hoy' | 'proximas' | 'finalizadas' | 'todas'

  useEffect(() => {
    if (user?.id) {
      cargarReuniones();
    }
  }, [user]);

  const cargarReuniones = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reuniones/usuario/${user.id}`);
      console.log('📋 Datos de reuniones:', response.data);
      setReuniones(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar reuniones:', err);
      setError(err.response?.data?.message || 'Error al cargar las reuniones');
    } finally {
      setLoading(false);
    }
  };

  const verDetalleReunion = (reunionId) => {
    navigate(`/gerente/reunion/${reunionId}`);
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

  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };

  // Determinar si una reunión es hoy
  const esHoy = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaReunion = new Date(fecha);
    return fechaReunion.getDate() === hoy.getDate() &&
           fechaReunion.getMonth() === hoy.getMonth() &&
           fechaReunion.getFullYear() === hoy.getFullYear();
  };

  // Determinar si una reunión es próxima (fecha futura)
  const esProxima = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaReunion = new Date(fecha);
    // Comparar solo la fecha, sin hora
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const reunionInicio = new Date(fechaReunion.getFullYear(), fechaReunion.getMonth(), fechaReunion.getDate());
    return reunionInicio > hoyInicio;
  };

  // Determinar si una reunión es finalizada (fecha pasada)
  const esFinalizada = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaReunion = new Date(fecha);
    // Comparar solo la fecha, sin hora
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const reunionInicio = new Date(fechaReunion.getFullYear(), fechaReunion.getMonth(), fechaReunion.getDate());
    return reunionInicio < hoyInicio;
  };

  // Determinar el estatus de la reunión basado en la fecha
  const getEstatusReunion = (fecha, hora) => {
    if (!fecha) return 'sin_fecha';
    
    if (esHoy(fecha)) {
      return 'hoy';
    } else if (esProxima(fecha)) {
      return 'proxima';
    } else if (esFinalizada(fecha)) {
      return 'finalizada';
    }
    return 'sin_fecha';
  };

  // Mapeo de estatus para mostrar
  const getEstatusClase = (estatus) => {
    const clases = {
      'hoy': 'bg-blue-100 text-blue-800 border-blue-200',
      'proxima': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'finalizada': 'bg-green-100 text-green-800 border-green-200',
      'sin_fecha': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return clases[estatus] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEstatusIcon = (estatus) => {
    const iconos = {
      'hoy': <FaCalendarDay className="text-blue-500" />,
      'proxima': <FaCalendarWeek className="text-yellow-500" />,
      'finalizada': <FaCheckCircle className="text-green-500" />,
      'sin_fecha': <FaInfoCircle className="text-gray-500" />
    };
    return iconos[estatus] || <FaInfoCircle className="text-gray-500" />;
  };

  const getEstatusTexto = (estatus) => {
    const textos = {
      'hoy': 'Hoy',
      'proxima': 'Próxima',
      'finalizada': 'Finalizada',
      'sin_fecha': 'Sin fecha'
    };
    return textos[estatus] || 'Sin estatus';
  };

  // Contar reuniones por categoría
  const contarPorCategoria = (categoria) => {
    return reuniones.filter(r => {
      if (categoria === 'hoy') return esHoy(r.reu_fecha);
      if (categoria === 'proximas') return esProxima(r.reu_fecha);
      if (categoria === 'finalizadas') return esFinalizada(r.reu_fecha);
      return true;
    }).length;
  };

  // Filtrar reuniones según el filtro seleccionado
  const reunionesFiltradas = reuniones.filter(reunion => {
    // Filtro por búsqueda
    const searchMatch = reunion.reu_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        reunion.reu_descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;

    // Filtro por fecha
    if (filtroFecha === 'hoy') {
      return esHoy(reunion.reu_fecha);
    } else if (filtroFecha === 'proximas') {
      return esProxima(reunion.reu_fecha);
    } else if (filtroFecha === 'finalizadas') {
      return esFinalizada(reunion.reu_fecha);
    } else {
      return true; // 'todas'
    }
  });

  // Ordenar reuniones por fecha (más cercanas primero)
  const reunionesOrdenadas = [...reunionesFiltradas].sort((a, b) => {
    const fechaA = new Date(a.reu_fecha);
    const fechaB = new Date(b.reu_fecha);
    return fechaA - fechaB;
  });

  // Mi asistencia
  const getMiAsistenciaClase = (estatus) => {
    const clases = {
      'Presente': 'bg-green-100 text-green-800 border-green-200',
      'Ausente': 'bg-red-100 text-red-800 border-red-200'
    };
    return clases[estatus] || 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-gray-500">Cargando tus reuniones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
          <h3 className="text-red-800 font-semibold text-lg mb-2">Error al cargar reuniones</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={cargarReuniones}
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
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaCalendarAlt className="text-blue-600 text-4xl" />
              Mis Reuniones
            </h1>
          </div>
        </div>

        {/* Tarjetas de filtro rápido */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
              filtroFecha === 'hoy' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setFiltroFecha('hoy')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCalendarDay className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hoy</p>
                <p className="text-xl font-bold text-gray-800">{contarPorCategoria('hoy')}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
              filtroFecha === 'proximas' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
            }`}
            onClick={() => setFiltroFecha('proximas')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaCalendarWeek className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Próximas</p>
                <p className="text-xl font-bold text-gray-800">{contarPorCategoria('proximas')}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
              filtroFecha === 'finalizadas' ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
            onClick={() => setFiltroFecha('finalizadas')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCalendarCheck className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Finalizadas</p>
                <p className="text-xl font-bold text-gray-800">{contarPorCategoria('finalizadas')}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
              filtroFecha === 'todas' ? 'border-gray-500 bg-gray-50' : 'border-gray-200'
            }`}
            onClick={() => setFiltroFecha('todas')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaCalendar className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Todas</p>
                <p className="text-xl font-bold text-gray-800">{reuniones.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reuniones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="hoy">📅 Hoy</option>
            <option value="proximas">📆 Próximas</option>
            <option value="finalizadas">✅ Finalizadas</option>
            <option value="todas">📋 Todas</option>
          </select>
        </div>

        <span className="text-sm text-gray-500 ml-auto">
          Mostrando {reunionesOrdenadas.length} de {reuniones.length} reuniones
        </span>
      </div>

      {/* Lista de reuniones */}
      {reunionesOrdenadas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">
                  {filtroFecha === 'hoy' ? '📅' :
                    filtroFecha === 'proximas' ? '📆' :
                      filtroFecha === 'finalizadas' ? '✅' : '📋'}
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {filtroFecha === 'hoy' ? 'No hay reuniones para hoy' :
                    filtroFecha === 'proximas' ? 'No hay reuniones próximas' :
                      filtroFecha === 'finalizadas' ? 'No hay reuniones finalizadas' :
                        'No hay reuniones para mostrar'}
                </h3>
                <p className="text-gray-500">
                  {reuniones.length === 0
                    ? 'No estás invitado a ninguna reunión actualmente'
                    : 'No se encontraron reuniones con los filtros seleccionados'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                {reunionesOrdenadas.map((reunion) => {
                  const estatusReunion = getEstatusReunion(reunion.reu_fecha, reunion.reu_hora);
      
                  return (
                    <div
                      key={reunion.reu_id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                      onClick={() => verDetalleReunion(reunion.reu_id)}
                    >
                      <div className="p-3 sm:p-4 md:p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
                            {reunion.reu_nombre}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ml-2 flex-shrink-0 ${getEstatusClase(estatusReunion)}`}>
                            {getEstatusIcon(estatusReunion)}
                            <span className="ml-1 hidden sm:inline">{getEstatusTexto(estatusReunion)}</span>
                          </span>
                        </div>
      
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                          {reunion.reu_descripcion || 'Sin descripción'}
                        </p>
      
                        <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <FaCalendarAlt className="text-blue-500 text-[10px] sm:text-xs" />
                            <span className="truncate">{formatearFechaCompleta(reunion.reu_fecha)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <FaClock className="text-blue-500 text-[10px] sm:text-xs" />
                            <span>{formatearHora(reunion.reu_hora)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <FaMapMarkerAlt className="text-blue-500 text-[10px] sm:text-xs" />
                            <span className="truncate">{reunion.reu_lugar || 'No especificado'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <FaUsers className="text-blue-500 text-[10px] sm:text-xs" />
                            <span>{reunion.total_invitados || 0} participantes</span>
                          </div>
                        </div>
      
                        {/* Mi estado de asistencia */}
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                verDetalleReunion(reunion.reu_id);
                              }}
                              className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                              <FaInfoCircle className="text-[10px] sm:text-xs" />
                              <span className="hidden sm:inline">Ver Detalle</span>
                              <span className="sm:hidden">Detalle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
    </div>
  );
}