// pages/asistente/ReunionDetalle.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaSpinner,
  FaUsers,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaUserCheck,
  FaEnvelope,
  FaPhone,
  FaClipboardList
} from 'react-icons/fa';

export default function ReunionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reunion, setReunion] = useState(null);
  const [invitados, setInvitados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDetalles(id);
    }
  }, [id]);

  async function cargarDetalles(reunionId) {
    setCargando(true);
    setError('');
    try {
      console.log('📋 Cargando detalles de la reunión ID:', reunionId);
      
      const response = await api.get(`/reuniones/${reunionId}`);
      console.log('✅ Datos recibidos:', response.data);

      if (response.data.reunion && response.data.invitados) {
        setReunion(response.data.reunion);
        setInvitados(response.data.invitados);
      } else {
        setReunion(response.data);
        const invitadosRes = await api.get(`/reuniones/${reunionId}/invitados`);
        setInvitados(invitadosRes.data);
      }

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || 'Error al cargar los detalles');
    } finally {
      setCargando(false);
    }
  }

  const actualizarEstadoAsistencia = async (asiId, nuevoEstado) => {
    setActualizando(true);
    try {
      await api.put(`/asistencias/${asiId}/estatus`, { asi_estatus: nuevoEstado });
      const { data } = await api.get(`/reuniones/${id}/invitados`);
      setInvitados(data);
    } catch (err) {
      alert('Error al actualizar el estado de asistencia');
      console.error('❌ Error:', err);
    } finally {
      setActualizando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };

  const volver = () => {
    navigate('/asistente/agenda');
  };

  const getEstadoBadge = (estatus) => {
    const estado = estatus?.toLowerCase() || 'ausente';
    const configs = {
      'presente': { 
        color: '#10B981', 
        bg: '#D1FAE5', 
        icon: FaCheck, 
        text: 'Presente' 
      },
      'ausente': { 
        color: '#EF4444', 
        bg: '#FEE2E2', 
        icon: FaTimes, 
        text: 'Ausente' 
      },
      'justificado': { 
        color: '#F59E0B', 
        bg: '#FEF3C7', 
        icon: FaUserCheck, 
        text: 'Justificado' 
      }
    };
    const config = configs[estado] || configs['ausente'];
    const Icon = config.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        backgroundColor: config.bg,
        color: config.color,
        padding: '0.2rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500
      }}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const getIniciales = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  if (cargando) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <FaSpinner style={{ fontSize: '2rem', color: '#2563EB', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6B7280' }}>Cargando detalles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="error-text" style={{ backgroundColor: '#FEE2E2', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
        <button
          onClick={volver}
          style={{
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (!reunion) {
    return (
      <div className="page" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#1F2937' }}>Reunión no encontrada</h2>
        <button
          onClick={volver}
          style={{
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '1rem auto 0'
          }}
        >
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Botón volver */}
      <button
        onClick={volver}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#6B7280',
          cursor: 'pointer',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#2563EB';
          e.currentTarget.querySelector('svg').style.transform = 'translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#6B7280';
          e.currentTarget.querySelector('svg').style.transform = 'translateX(0)';
        }}
      >
        <FaArrowLeft style={{ transition: 'transform 0.2s' }} />
        <span>Volver a Agenda</span>
      </button>

      {/* Tarjeta principal */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem 2rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
              {reunion.nombre || reunion.reu_nombre}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              ID: {reunion.id || reunion.reu_id}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{
              backgroundColor: '#2563EB',
              color: 'white',
              border: 'none',
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <FaEdit size={14} /> Editar
            </button>
            <button 
  onClick={() => navigate(`/asistente/minutas/${reunion.reu_id || reunion.id}`)}
  style={{
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
>
  <FaEdit size={14} /> Minuta
</button>
            </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          backgroundColor: '#F9FAFB',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaCalendarAlt style={{ color: '#2563EB', fontSize: '1.25rem' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Fecha</div>
              <div style={{ fontWeight: 500, color: '#1F2937' }}>
                {formatearFecha(reunion.fecha || reunion.reu_fecha)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaClock style={{ color: '#2563EB', fontSize: '1.25rem' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Hora</div>
              <div style={{ fontWeight: 500, color: '#1F2937' }}>
                {reunion.hora || reunion.reu_hora}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaMapMarkerAlt style={{ color: '#2563EB', fontSize: '1.25rem' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Lugar</div>
              <div style={{ fontWeight: 500, color: '#1F2937' }}>
                {reunion.lugar || reunion.reu_lugar || 'Sin lugar definido'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaUser style={{ color: '#2563EB', fontSize: '1.25rem' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Creador</div>
              <div style={{ fontWeight: 500, color: '#1F2937' }}>
                {reunion.creador?.nombre || reunion.creado_por_nombre || 'Sin creador'}
              </div>
            </div>
          </div>
        </div>

        {(reunion.descripcion || reunion.reu_descripcion) && (
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaClipboardList style={{ color: '#2563EB' }} />
              Descripción
            </h3>
            <p style={{ color: '#4B5563', lineHeight: 1.6, backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px', margin: 0 }}>
              {reunion.descripcion || reunion.reu_descripcion}
            </p>
          </div>
        )}
      </div>

      {/* Lista de invitados */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem 2rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1F2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUsers style={{ color: '#2563EB' }} />
            Invitados ({invitados.length})
          </h3>
        </div>

        {invitados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
            <FaUsers style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.4 }} />
            <p>No hay invitados para esta reunión</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '0.75rem'
            }}>
              {invitados.map((invitado) => {
                const usuario = invitado.usuario || invitado;
                const estatus = invitado.estatus || invitado.asi_estatus || 'ausente';
                const asiId = invitado.asi_id || invitado.id;
                
                return (
                  <div
                    key={asiId}
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px',
                      padding: '1rem',
                      transition: 'all 0.2s',
                      border: '1px solid #F3F4F6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#2563EB',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {getIniciales(usuario.nombre, usuario.apellido)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <FaEnvelope size={10} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{usuario.correo}</span>
                        </div>
                        
                        {usuario.telefono && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6B7280' }}>
                            <FaPhone size={10} />
                            <span>{usuario.telefono}</span>
                          </div>
                        )}

                        {invitado.puesto && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              backgroundColor: '#DBEAFE',
                              color: '#1E40AF',
                              padding: '0.1rem 0.5rem',
                              borderRadius: '9999px'
                            }}>
                              {invitado.puesto}
                            </span>
                          </div>
                        )}

                        <div style={{ marginTop: '0.5rem' }}>
                          {getEstadoBadge(estatus)}
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #E5E7EB',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => actualizarEstadoAsistencia(asiId, 'presente')}
                        disabled={actualizando || estatus === 'presente'}
                        style={{
                          padding: '0.2rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: estatus === 'presente' ? 'default' : 'pointer',
                          backgroundColor: estatus === 'presente' ? '#D1FAE5' : '#E5E7EB',
                          color: estatus === 'presente' ? '#065F46' : '#4B5563',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (estatus !== 'presente') {
                            e.currentTarget.style.backgroundColor = '#D1FAE5';
                            e.currentTarget.style.color = '#065F46';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (estatus !== 'presente') {
                            e.currentTarget.style.backgroundColor = '#E5E7EB';
                            e.currentTarget.style.color = '#4B5563';
                          }
                        }}
                      >
                        <FaCheck size={10} /> Presente
                      </button>
                      <button
                        onClick={() => actualizarEstadoAsistencia(asiId, 'ausente')}
                        disabled={actualizando || estatus === 'ausente'}
                        style={{
                          padding: '0.2rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: estatus === 'ausente' ? 'default' : 'pointer',
                          backgroundColor: estatus === 'ausente' ? '#FEE2E2' : '#E5E7EB',
                          color: estatus === 'ausente' ? '#991B1B' : '#4B5563',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (estatus !== 'ausente') {
                            e.currentTarget.style.backgroundColor = '#FEE2E2';
                            e.currentTarget.style.color = '#991B1B';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (estatus !== 'ausente') {
                            e.currentTarget.style.backgroundColor = '#E5E7EB';
                            e.currentTarget.style.color = '#4B5563';
                          }
                        }}
                      >
                        <FaTimes size={10} /> Ausente
                      </button>
                      <button
                        onClick={() => actualizarEstadoAsistencia(asiId, 'justificado')}
                        disabled={actualizando || estatus === 'justificado'}
                        style={{
                          padding: '0.2rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: estatus === 'justificado' ? 'default' : 'pointer',
                          backgroundColor: estatus === 'justificado' ? '#FEF3C7' : '#E5E7EB',
                          color: estatus === 'justificado' ? '#92400E' : '#4B5563',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (estatus !== 'justificado') {
                            e.currentTarget.style.backgroundColor = '#FEF3C7';
                            e.currentTarget.style.color = '#92400E';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (estatus !== 'justificado') {
                            e.currentTarget.style.backgroundColor = '#E5E7EB';
                            e.currentTarget.style.color = '#4B5563';
                          }
                        }}
                      >
                        <FaUserCheck size={10} /> Justificado
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen de asistencias */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #E5E7EB',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ backgroundColor: '#D1FAE5', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065F46' }}>
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'presente').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#065F46' }}>Presentes</div>
              </div>
              <div style={{ backgroundColor: '#FEE2E2', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991B1B' }}>
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'ausente').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>Ausentes</div>
              </div>
              <div style={{ backgroundColor: '#FEF3C7', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400E' }}>
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'justificado').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400E' }}>Justificados</div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}