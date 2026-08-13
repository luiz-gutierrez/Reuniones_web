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
      
      // Mostrar las fechas para depuración
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

  // ✅ Función para normalizar fecha (obtener solo YYYY-MM-DD)
  const normalizarFecha = (fecha) => {
    if (!fecha) return '';
    // Si es un string ISO (2026-08-13T06:00:00.000Z)
    if (typeof fecha === 'string' && fecha.includes('T')) {
      return fecha.split('T')[0];
    }
    // Si es un objeto Date
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    // Si ya es YYYY-MM-DD
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return fecha;
    }
    // Si es otro formato, intentar convertirlo
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

  // Clasificar reuniones por categoría
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

  // Filtrar por categoría
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

  // ✅ Formatear fecha relativa (CORREGIDO)
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

  // ✅ Verificar si una reunión es hoy (CORREGIDO)
  const esReunionHoy = (fecha) => {
    const fechaNormalizada = normalizarFecha(fecha);
    if (!fechaNormalizada) return false;
    const hoy = new Date().toISOString().split('T')[0];
    return fechaNormalizada === hoy;
  };

  // ✅ Verificar si una reunión ya pasó (CORREGIDO)
  const esReunionPasada = (fecha, hora) => {
    const fechaNormalizada = normalizarFecha(fecha);
    if (!fechaNormalizada) return false;
    
    const hoy = new Date().toISOString().split('T')[0];
    
    // Si la fecha es menor que hoy, ya pasó
    if (fechaNormalizada < hoy) return true;
    
    // Si es hoy, verificar la hora
    if (fechaNormalizada === hoy) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      return hora < horaActual;
    }
    
    return false;
  };

  // Filtrar por búsqueda
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

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      const d = new Date(fecha);
      if (isNaN(d.getTime())) return 'Fecha inválida';
      const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return d.toLocaleDateString('es-ES', opciones);
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

    return (
      <div
        key={reunion.reu_id}
        onClick={() => verDetalles(reunion.reu_id)}
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
          borderLeft: `4px solid ${pasada ? COLORS.danger : esHoy ? COLORS.success : COLORS.primary}`,
          cursor: 'pointer',
          opacity: pasada ? 0.7 : 1,
          position: 'relative',
          marginBottom: '1rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          {pasada && (
            <span style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '0.2rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.65rem',
              fontWeight: 600
            }}>
              Finalizada
            </span>
          )}
          {fechaRelativa && !pasada && (
            <span style={{
              backgroundColor: fechaRelativa.color + '20',
              color: fechaRelativa.color,
              padding: '0.2rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.65rem',
              fontWeight: 600
            }}>
              {fechaRelativa.label}
            </span>
          )}
          {reunion.total_invitados > 0 && (
            <span style={{
              backgroundColor: '#DBEAFE',
              color: '#1E40AF',
              padding: '0.2rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.65rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <FaUsers size={10} />
              {reunion.total_invitados} invitados
            </span>
          )}
        </div>

        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: COLORS.secondary,
          margin: '0 0 0.5rem 0'
        }}>
          {reunion.reu_nombre}
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: COLORS.secondary,
            fontSize: '0.875rem'
          }}>
            <FaCalendarAlt style={{ color: COLORS.primary, fontSize: '0.875rem' }} />
            <span>{formatearFecha(reunion.reu_fecha)}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: COLORS.secondary,
            fontSize: '0.875rem'
          }}>
            <FaClock style={{ color: COLORS.primary, fontSize: '0.875rem' }} />
            <span>{reunion.reu_hora}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: COLORS.secondary,
            fontSize: '0.875rem'
          }}>
            <FaMapMarkerAlt style={{ color: COLORS.primary, fontSize: '0.875rem' }} />
            <span>{reunion.reu_lugar || 'Sin lugar definido'}</span>
          </div>

          {reunion.reu_descripcion && (
            <p style={{
              fontSize: '0.875rem',
              color: COLORS.secondary,
              opacity: 0.6,
              margin: '0.25rem 0 0 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {reunion.reu_descripcion}
            </p>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: `1px solid ${COLORS.accent}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: COLORS.secondary,
              fontSize: '0.75rem',
              opacity: 0.6
            }}>
              <FaUser style={{ color: COLORS.primary }} />
              <span>{reunion.creado_por_nombre || 'Sin creador'}</span>
            </div>
            <FaChevronRight style={{ fontSize: '0.875rem', color: COLORS.primary, opacity: 0.4 }} />
          </div>
        </div>
      </div>
    );
  };

  // ... resto del componente (return y el resto del código)

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: COLORS.secondary, margin: 0 }}>
            📅 Agenda
          </h1>
          <p style={{ color: COLORS.secondary, opacity: 0.6, margin: '0.25rem 0 0 0' }}>
            Visualiza todas tus reuniones organizadas por fecha
          </p>
        </div>
        <button
          onClick={cargarReuniones}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: COLORS.primary,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Actualizar
        </button>
      </div>

      {/* Resumen de categorías */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div
          onClick={() => setFiltroCategoria('todas')}
          style={{
            backgroundColor: filtroCategoria === 'todas' ? COLORS.primary : 'white',
            color: filtroCategoria === 'todas' ? 'white' : COLORS.secondary,
            padding: '1rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (filtroCategoria !== 'todas') {
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >

          <div style={{ fontWeight: 'bold' }}>Todas</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{reuniones.length}</div>
        </div>

        <div
          onClick={() => setFiltroCategoria('hoy')}
          style={{
            backgroundColor: filtroCategoria === 'hoy' ? COLORS.success : 'white',
            color: filtroCategoria === 'hoy' ? 'white' : COLORS.secondary,
            padding: '1rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (filtroCategoria !== 'hoy') {
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          
          <div style={{ fontWeight: 'bold' }}>Hoy</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{clasificarReuniones().hoy.length}</div>
        </div>

        <div
          onClick={() => setFiltroCategoria('proximas')}
          style={{
            backgroundColor: filtroCategoria === 'proximas' ? COLORS.primary : 'white',
            color: filtroCategoria === 'proximas' ? 'white' : COLORS.secondary,
            padding: '1rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (filtroCategoria !== 'proximas') {
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >

          <div style={{ fontWeight: 'bold' }}>Próximas</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{clasificarReuniones().proximas.length}</div>
        </div>

        <div
          onClick={() => setFiltroCategoria('pasadas')}
          style={{
            backgroundColor: filtroCategoria === 'pasadas' ? COLORS.danger : 'white',
            color: filtroCategoria === 'pasadas' ? 'white' : COLORS.secondary,
            padding: '1rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (filtroCategoria !== 'pasadas') {
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >

          <div style={{ fontWeight: 'bold' }}>Pasadas</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{clasificarReuniones().pasadas.length}</div>
        </div>
      </div>

      {/* Buscador */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <FaSearch style={{ color: COLORS.secondary, opacity: 0.4 }} />
        <input
          type="text"
          placeholder="Buscar reuniones por nombre, lugar, creador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            color: COLORS.secondary,
            background: 'transparent'
          }}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.secondary,
              opacity: 0.4,
              cursor: 'pointer'
            }}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: COLORS.secondary,
          opacity: 0.6
        }}>
          <FaSpinner style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.5rem' }}>Cargando reuniones...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* Lista de reuniones */}
      {!cargando && !error && (
        <>
          {reunionesFinales.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
              <h2 style={{ fontSize: '1.5rem', color: COLORS.secondary, margin: 0 }}>
                No hay reuniones {filtroCategoria === 'hoy' ? 'para hoy' : 
                                filtroCategoria === 'proximas' ? 'próximas' : 
                                filtroCategoria === 'pasadas' ? 'pasadas' : 'programadas'}
              </h2>
              <p style={{ color: COLORS.secondary, opacity: 0.6, marginTop: '0.5rem' }}>
                {busqueda ? 'No se encontraron reuniones que coincidan con tu búsqueda' : 
                 filtroCategoria === 'hoy' ? 'Disfruta tu día sin reuniones' : 
                 'Pronto se programarán nuevas reuniones'}
              </p>
            </div>
          ) : (
            <div>
              {filtroCategoria === 'todas' ? (
                // Mostrar agrupado por fecha cuando están todas
                Object.entries(agruparPorFecha(reunionesFinales))
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([fecha, reunionesDelDia]) => {
                    const fechaRelativa = formatearFechaRelativa(fecha);
                    const esHoy = esReunionHoy(fecha);
                    const esPasada = fecha < new Date().toISOString().split('T')[0];
                    
                    return (
                      <div key={fecha} style={{ marginBottom: '2rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '1rem'
                        }}>
                          <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: COLORS.secondary,
                            margin: 0
                          }}>
                            {formatearFecha(fecha)}
                          </h2>
                          {fechaRelativa && (
                            <span style={{
                              backgroundColor: fechaRelativa.color + '20',
                              color: fechaRelativa.color,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}>
                              {fechaRelativa.label}
                            </span>
                          )}
                          <span style={{
                            backgroundColor: COLORS.accent,
                            color: COLORS.secondary,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            opacity: 0.6
                          }}>
                            {reunionesDelDia.length} reuniones
                          </span>
                        </div>
                        {reunionesDelDia.map(r => renderReunionCard(r))}
                      </div>
                    );
                  })
              ) : (
                // Mostrar sin agrupar cuando hay filtro
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