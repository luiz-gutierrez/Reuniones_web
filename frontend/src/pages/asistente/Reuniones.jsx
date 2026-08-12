import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  FaSave, 
  FaTrash, 
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaUsers,
  FaCheck,
  FaUserPlus
} from 'react-icons/fa';

const COLORS = {
  primary: '#2563EB',
  secondary: '#1E293B',
  accent: '#F8FAFC',
};

export default function SecretariaReuniones() {
  const [reuniones, setReuniones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Datos de la reunión
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [invitados, setInvitados] = useState([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estados para el modal de edición de asistentes
  const [mostrarModalAsistentes, setMostrarModalAsistentes] = useState(false);
  const [reunionSeleccionada, setReunionSeleccionada] = useState(null);
  const [asistentesSeleccionados, setAsistentesSeleccionados] = useState([]);
  const [asistentesGuardados, setAsistentesGuardados] = useState([]);
  const [guardandoAsistentes, setGuardandoAsistentes] = useState(false);
  const [busquedaAsistente, setBusquedaAsistente] = useState('');

  useEffect(() => {
    cargarReuniones();
    cargarUsuarios();
  }, []);

  async function cargarReuniones() {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/reuniones');
      setReuniones(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reuniones');
    } finally {
      setCargando(false);
    }
  }

  async function cargarUsuarios() {
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  }

  // Toggle selección de invitado
  const toggleInvitado = (userId) => {
    setInvitados(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Crear reunión con invitados
  async function handleCrear(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');

    // Validar que haya al menos un invitado
    if (invitados.length === 0) {
      setError('Debes seleccionar al menos un invitado para la reunión');
      setGuardando(false);
      return;
    }

    try {
      const response = await api.post('/reuniones', {
        nombre,
        descripcion,
        lugar,
        fecha,
        hora,
        invitados: invitados
      });

      console.log('✅ Reunión creada:', response.data);

      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setLugar('');
      setFecha('');
      setHora('');
      setInvitados([]);
      setBusquedaUsuario('');

      await cargarReuniones();

    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al crear reunión';
      setError(mensaje);
      console.error('❌ Error:', err);
    } finally {
      setGuardando(false);
    }
  }

  // Abrir modal para editar asistentes
  const abrirModalAsistentes = async (reunion) => {
    setReunionSeleccionada(reunion);
    setAsistentesSeleccionados([]);
    setBusquedaAsistente('');
    
    try {
      const { data } = await api.get(`/reuniones/${reunion.reu_id}/invitados`);
      setAsistentesGuardados(data);
      const idsGuardados = data.map(a => a.use_id);
      setAsistentesSeleccionados(idsGuardados);
    } catch (err) {
      console.error('Error al cargar asistentes:', err);
      setAsistentesGuardados([]);
      setAsistentesSeleccionados([]);
    }
    
    setMostrarModalAsistentes(true);
  };

  // Toggle selección de usuario en el modal
  const toggleAsistente = (userId) => {
    setAsistentesSeleccionados(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Guardar asistentes editados
  const guardarAsistentes = async () => {
    if (!reunionSeleccionada) return;
    
    setGuardandoAsistentes(true);
    setError('');

    try {
      await api.put(`/reuniones/${reunionSeleccionada.reu_id}/invitados`, {
        invitados: asistentesSeleccionados
      });

      const { data } = await api.get(`/reuniones/${reunionSeleccionada.reu_id}/invitados`);
      setAsistentesGuardados(data);

      alert('✅ Asistentes actualizados correctamente');
      await cargarReuniones();

    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar asistentes');
    } finally {
      setGuardandoAsistentes(false);
    }
  };

  const cerrarModalAsistentes = () => {
    setMostrarModalAsistentes(false);
    setReunionSeleccionada(null);
    setAsistentesSeleccionados([]);
    setAsistentesGuardados([]);
    setError('');
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.apellido.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.correo.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  const asistentesFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busquedaAsistente.toLowerCase()) ||
    u.apellido.toLowerCase().includes(busquedaAsistente.toLowerCase()) ||
    u.correo.toLowerCase().includes(busquedaAsistente.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
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
            📋 Reuniones
          </h1>
          <p style={{ color: COLORS.secondary, opacity: 0.6, margin: '0.25rem 0 0 0' }}>
            Crea reuniones y selecciona los invitados
          </p>
        </div>
      </div>

      {/* Formulario para crear reunión */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <form onSubmit={handleCrear}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: COLORS.secondary, marginBottom: '1rem' }}>
            <FaUserPlus style={{ marginRight: '0.5rem' }} />
            Nueva Reunión
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary, marginBottom: '0.25rem' }}>
                Nombre *
              </label>
              <input
                type="text"
                placeholder="Nombre de la reunión"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary, marginBottom: '0.25rem' }}>
                Lugar *
              </label>
              <input
                type="text"
                placeholder="Lugar de la reunión"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary, marginBottom: '0.25rem' }}>
                Fecha *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary, marginBottom: '0.25rem' }}>
                Hora *
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary, marginBottom: '0.25rem' }}>
                Descripción
              </label>
              <textarea
                placeholder="Descripción de la reunión"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows="2"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Sección de invitados */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary, marginBottom: '0.25rem' }}>
                <FaUsers style={{ marginRight: '0.5rem' }} />
                Invitados * ({invitados.length} seleccionados)
              </label>
              
              <div style={{
                backgroundColor: COLORS.accent,
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <FaSearch style={{ color: COLORS.secondary, opacity: 0.4 }} />
                <input
                  type="text"
                  placeholder="Buscar usuarios para invitar..."
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    color: COLORS.secondary,
                    background: 'transparent'
                  }}
                />
                {invitados.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setInvitados([])}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      borderRadius: '0.25rem',
                      color: '#991B1B',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FCA5A5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                  >
                    Limpiar todos
                  </button>
                )}
              </div>

              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: `1px solid ${COLORS.accent}`,
                borderRadius: '0.5rem',
                padding: '0.5rem'
              }}>
                {usuariosFiltrados.length === 0 ? (
                  <p style={{ textAlign: 'center', color: COLORS.secondary, opacity: 0.4, padding: '1rem' }}>
                    {busquedaUsuario ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                  </p>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const seleccionado = invitados.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleInvitado(u.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: seleccionado ? '#DBEAFE' : 'transparent',
                          border: seleccionado ? `1px solid ${COLORS.primary}` : '1px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!seleccionado) {
                            e.currentTarget.style.backgroundColor = COLORS.accent;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!seleccionado) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: seleccionado ? COLORS.primary : COLORS.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: seleccionado ? 'white' : COLORS.secondary,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary }}>
                            {u.nombre} {u.apellido}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: COLORS.secondary, opacity: 0.5 }}>
                            {u.correo}
                          </div>
                        </div>
                        {seleccionado && (
                          <FaCheck style={{ color: COLORS.primary }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              marginTop: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={guardando}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: guardando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                opacity: guardando ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!guardando) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {guardando ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Creando...
                </>
              ) : (
                <>
                  <FaSave /> Crear Reunión ({invitados.length} invitados)
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de reuniones */}
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

      {!cargando && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1rem'
        }}>
          {reuniones.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: COLORS.secondary,
              opacity: 0.4
            }}>
              <p style={{ fontSize: '1.125rem' }}>No hay reuniones programadas</p>
            </div>
          ) : (
            reuniones.map((r) => (
              <div
                key={r.reu_id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${COLORS.primary}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: COLORS.secondary, margin: 0 }}>
                    {r.reu_nombre}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{
                      backgroundColor: '#DBEAFE',
                      color: '#1E40AF',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <FaUsers size={12} />
                      {r.total_invitados || 0}
                    </span>
                    <button
                      onClick={() => abrirModalAsistentes(r)}
                      style={{
                        backgroundColor: COLORS.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Editar
                    </button>
                  </div>
                </div>

                {r.reu_descripcion && (
                  <p style={{
                    fontSize: '0.875rem',
                    color: COLORS.secondary,
                    opacity: 0.7,
                    margin: '0.5rem 0 1rem 0'
                  }}>
                    {r.reu_descripcion}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderTop: `1px solid ${COLORS.accent}`,
                  paddingTop: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: COLORS.secondary, fontSize: '0.875rem' }}>
                    <FaCalendarAlt style={{ color: COLORS.primary }} />
                    <span>{formatearFecha(r.reu_fecha)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: COLORS.secondary, fontSize: '0.875rem' }}>
                    <FaClock style={{ color: COLORS.primary }} />
                    <span>{r.reu_hora}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: COLORS.secondary, fontSize: '0.875rem', opacity: 0.6 }}>
                    <FaUser style={{ color: COLORS.primary }} />
                    <span>Creada por: {r.creado_por_nombre}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal para editar asistentes */}
      {mostrarModalAsistentes && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}
        onClick={cerrarModalAsistentes}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS.secondary, margin: 0 }}>
                  <FaUsers style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Editar Asistentes
                </h2>
                <p style={{ color: COLORS.secondary, opacity: 0.6, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                  {reunionSeleccionada?.reu_nombre} - {formatearFecha(reunionSeleccionada?.reu_fecha)}
                </p>
              </div>
              <button
                onClick={cerrarModalAsistentes}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: COLORS.secondary,
                  opacity: 0.4,
                  cursor: 'pointer'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{
              backgroundColor: COLORS.accent,
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FaSearch style={{ color: COLORS.secondary, opacity: 0.4 }} />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={busquedaAsistente}
                onChange={(e) => setBusquedaAsistente(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.875rem',
                  color: COLORS.secondary,
                  background: 'transparent'
                }}
              />
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {asistentesFiltrados.length === 0 ? (
                <p style={{ textAlign: 'center', color: COLORS.secondary, opacity: 0.4, padding: '2rem' }}>
                  No hay usuarios disponibles
                </p>
              ) : (
                asistentesFiltrados.map((u) => {
                  const seleccionado = asistentesSeleccionados.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleAsistente(u.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: seleccionado ? '#DBEAFE' : 'transparent',
                        border: seleccionado ? `1px solid ${COLORS.primary}` : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!seleccionado) {
                          e.currentTarget.style.backgroundColor = COLORS.accent;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!seleccionado) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: seleccionado ? COLORS.primary : COLORS.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: seleccionado ? 'white' : COLORS.secondary,
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>
                        {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: COLORS.secondary }}>
                          {u.nombre} {u.apellido}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: COLORS.secondary, opacity: 0.5 }}>
                          {u.correo} • {u.puesto || 'Sin puesto'}
                        </div>
                      </div>
                      {seleccionado && (
                        <FaCheck style={{ color: COLORS.primary, fontSize: '1.25rem' }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{
              backgroundColor: COLORS.accent,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: COLORS.secondary, margin: 0 }}>
                <strong>{asistentesSeleccionados.length}</strong> usuarios seleccionados
                {asistentesGuardados.length > 0 && (
                  <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>
                    • {asistentesGuardados.length} actuales
                  </span>
                )}
              </p>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                type="button"
                onClick={cerrarModalAsistentes}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  color: COLORS.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.accent}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarAsistentes}
                disabled={guardandoAsistentes}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: COLORS.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: guardandoAsistentes ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  opacity: guardandoAsistentes ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!guardandoAsistentes) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {guardandoAsistentes ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave /> Actualizar Asistentes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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