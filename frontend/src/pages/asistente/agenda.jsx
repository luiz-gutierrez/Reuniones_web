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
  FaTimes
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

  useEffect(() => {
    cargarReuniones();
  }, []);

  async function cargarReuniones() {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/reuniones');
      console.log('📋 Reuniones cargadas:', data);
      
      data.forEach(r => {
        console.log(`📅 Reunión: ${r.reu_nombre}, Fecha: ${r.reu_fecha}, Tipo: ${typeof r.reu_fecha}`);
      });
      
      setReuniones(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reuniones');
    } finally {
      setCargando(false);
    }
  }

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
        <button
          onClick={cargarReuniones}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200"
        >
          Actualizar
        </button>
      </div>

      {/* Resumen de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setFiltroCategoria('todas')}
          className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 shadow-sm hover:scale-[1.02] ${
            filtroCategoria === 'todas'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="font-bold">Todas</div>
          <div className="text-sm opacity-70">{reuniones.length}</div>
        </div>

        <div
          onClick={() => setFiltroCategoria('hoy')}
          className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 shadow-sm hover:scale-[1.02] ${
            filtroCategoria === 'hoy'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="font-bold">Hoy</div>
          <div className="text-sm opacity-70">{clasificarReuniones().hoy.length}</div>
        </div>

        <div
          onClick={() => setFiltroCategoria('proximas')}
          className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 shadow-sm hover:scale-[1.02] ${
            filtroCategoria === 'proximas'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="font-bold">Próximas</div>
          <div className="text-sm opacity-70">{clasificarReuniones().proximas.length}</div>
        </div>

        <div
          onClick={() => setFiltroCategoria('pasadas')}
          className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-200 shadow-sm hover:scale-[1.02] ${
            filtroCategoria === 'pasadas'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="font-bold">Pasadas</div>
          <div className="text-sm opacity-70">{clasificarReuniones().pasadas.length}</div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl p-3 px-4 mb-6 shadow-sm flex items-center gap-3">
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
                                filtroCategoria === 'pasadas' ? 'pasadas' : 'programadas'}
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
                    const esHoy = esReunionHoy(fecha);
                    const esPasada = fecha < new Date().toISOString().split('T')[0];
                    
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}