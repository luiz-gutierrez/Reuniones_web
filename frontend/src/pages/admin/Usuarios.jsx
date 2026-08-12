// src/pages/admin/AdminUsuarios.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  FaPlus, 
  FaSave, 
  FaTrash, 
  FaEdit,
  FaUserPlus,
  FaSpinner,
  FaSearch,
  FaTimes,
  FaUserCircle
} from 'react-icons/fa';

// Paleta de colores (solo 3 colores)
const COLORS = {
  primary: '#2563EB',
  secondary: '#1E293B',
  accent: '#F8FAFC',
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    contrasena: '',
    pue_id: ''
  });

  // Cargar usuarios y puestos al inicio
  useEffect(() => {
    cargarUsuarios();
    cargarPuestos();
  }, []);

  // Obtener todos los usuarios
  async function cargarUsuarios() {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  }

  // Obtener todos los puestos
  async function cargarPuestos() {
    try {
      const { data } = await api.get('/puestos');
      setPuestos(data);
    } catch (err) {
      console.error('Error al cargar puestos:', err);
    }
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Abrir modal para crear usuario
  const abrirModalCrear = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      contrasena: '',
      pue_id: ''
    });
    setError('');
    setMostrarModal(true);
  };

  // Abrir modal para editar usuario
  const abrirModalEditar = (usuario) => {
    setEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      correo: usuario.correo,
      contrasena: '',
      pue_id: usuario.pue_id || ''
    });
    setError('');
    setMostrarModal(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setEditando(null);
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      contrasena: '',
      pue_id: ''
    });
    setError('');
  };

  // Crear o actualizar usuario
  // En tu componente AdminUsuarios.jsx, la parte del formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  setGuardando(true);
  setError('');

  try {
    const { nombre, apellido, telefono, correo, contrasena, pue_id } = formData;

    // Validaciones
    if (!nombre || !apellido || !telefono || !correo || !pue_id) {
      throw new Error('Todos los campos son obligatorios');
    }

    if (!editando && !contrasena) {
      throw new Error('La contrasena es obligatoria para nuevos usuarios');
    }

    const usuarioData = {
      nombre,
      apellido,
      telefono,
      correo,
      pue_id: parseInt(pue_id)
    };

    if (!editando) {
      usuarioData.contrasena = contrasena;
    }

    let response;
    if (editando) {
      response = await api.put(`/usuarios/${editando.id}`, usuarioData);
    } else {
      response = await api.post('/usuarios', usuarioData);
    }

    console.log('✅ Usuario guardado:', response.data);
    await cargarUsuarios();
    cerrarModal();

  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Error al guardar usuario';
    setError(msg);
    console.error('❌ Error:', err);
  } finally {
    setGuardando(false);
  }
};

  // Eliminar usuario
  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await api.delete(`/usuarios/${id}`);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.telefono.includes(busqueda)
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
            👥 Usuarios
          </h1>
          <p style={{ color: COLORS.secondary, opacity: 0.6, margin: '0.25rem 0 0 0' }}>
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          style={{
            backgroundColor: COLORS.primary,
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 500,
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(37,99,235,0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37,99,235,0.3)';
          }}
        >
          <FaUserPlus /> Nuevo Usuario
        </button>
      </div>

      {/* Buscador */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <FaSearch style={{ color: COLORS.secondary, opacity: 0.4 }} />
        <input
          type="text"
          placeholder="Buscar usuarios por nombre, correo o teléfono..."
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

      {/* Mensajes de carga y error */}
      {cargando && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: COLORS.secondary,
          opacity: 0.6
        }}>
          <FaSpinner style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.5rem' }}>Cargando usuarios...</p>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <FaTimes style={{ color: '#DC2626' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de usuarios */}
      {!cargando && !error && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '700px'
            }}>
              <thead style={{ backgroundColor: COLORS.accent }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: COLORS.secondary, opacity: 0.7, textTransform: 'uppercase' }}>
                    Usuario
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: COLORS.secondary, opacity: 0.7, textTransform: 'uppercase' }}>
                    Teléfono
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: COLORS.secondary, opacity: 0.7, textTransform: 'uppercase' }}>
                    Correo
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: COLORS.secondary, opacity: 0.7, textTransform: 'uppercase' }}>
                    Puesto
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: COLORS.secondary, opacity: 0.7, textTransform: 'uppercase' }}>
                    Estado
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: COLORS.secondary, opacity: 0.7, textTransform: 'uppercase' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: COLORS.secondary, opacity: 0.4 }}>
                      <FaUserCircle style={{ fontSize: '3rem', margin: '0 auto 0.5rem', display: 'block' }} />
                      <p>No hay usuarios registrados</p>
                      <p style={{ fontSize: '0.875rem' }}>Haz clic en "Nuevo Usuario" para crear uno</p>
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr 
                      key={u.id} 
                      style={{ borderTop: '1px solid #E5E7EB' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.accent}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div>
                          <div style={{ fontWeight: 500, color: COLORS.secondary }}>
                            {u.nombre} {u.apellido}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: COLORS.secondary, opacity: 0.5 }}>
                            ID: {u.id}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: COLORS.secondary, fontSize: '0.875rem' }}>
                        {u.telefono}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: COLORS.secondary, fontSize: '0.875rem' }}>
                        {u.correo}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          backgroundColor: '#DBEAFE',
                          color: '#1E40AF',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {u.puesto || 'Sin puesto'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          backgroundColor: u.activo ? '#D1FAE5' : '#FEE2E2',
                          color: u.activo ? '#065F46' : '#991B1B',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => abrirModalEditar(u)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: COLORS.primary,
                              cursor: 'pointer',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Editar usuario"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminar(u.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Eliminar usuario"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para crear/editar usuario */}
      {mostrarModal && (
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
        onClick={cerrarModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS.secondary, margin: 0 }}>
                {editando ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
              </h2>
              <button
                onClick={cerrarModal}
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: COLORS.secondary, marginBottom: '0.25rem' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el nombre"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${COLORS.accent}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
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
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el apellido"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${COLORS.accent}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
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
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 50000000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${COLORS.accent}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
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
                  Correo *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  placeholder="correo@ejemplo.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${COLORS.accent}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
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
                  {editando ? 'Nueva contrasena (opcional)' : 'contrasena *'}
                </label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required={!editando}
                  placeholder={editando ? 'Dejar vacío para mantener la actual' : 'Ingrese la contrasena'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${COLORS.accent}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
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
                  Puesto *
                </label>
                <select
                  name="pue_id"
                  value={formData.pue_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${COLORS.accent}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.accent;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Seleccione un puesto</option>
                  {puestos.map((p) => (
                    <option key={p.pue_id} value={p.pue_id}>
                      {p.pue_nombre}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem'
              }}>
                <button
                  type="button"
                  onClick={cerrarModal}
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
                  type="submit"
                  disabled={guardando}
                  style={{
                    padding: '0.75rem 1.5rem',
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
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave /> {editando ? 'Actualizar' : 'Crear'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}