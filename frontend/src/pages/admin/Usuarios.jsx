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
  FaUserCircle,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaUserCheck,
  FaUserSlash,
  FaIdCard,
  FaKey,
  FaUserTag,
  FaFilter,
  FaUserShield,
  FaBuilding,
  FaUndo
} from 'react-icons/fa';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [puestosDisponibles, setPuestosDisponibles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    contrasena: '',
    pue_id: ''
  });

  // Cargar usuarios, puestos y roles al inicio
  useEffect(() => {
    cargarUsuarios();
    cargarPuestos();
    cargarRoles();
  }, []);

  // Obtener todos los usuarios
  async function cargarUsuarios() {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/usuarios');
      // ✅ FILTRO: Excluir usuarios con rol 'Admin'
      const usuariosFiltrados = data.filter(u => u.rol !== 'Admin');
      setUsuarios(usuariosFiltrados);
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

  // Obtener todos los roles
  async function cargarRoles() {
    try {
      const { data } = await api.get('/usuarios/roles');
      // ✅ FILTRO: Excluir el rol 'Admin' del selector
      const rolesFiltrados = data.filter(r => r.rol_nombre !== 'Admin');
      setRoles(rolesFiltrados);
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  }

  // Obtener puestos sin usuarios asignados
  async function cargarPuestosSinUsuarios() {
    try {
      const { data } = await api.get('/usuarios/puestos-sin-usuarios');
      setPuestosDisponibles(data);
      return data;
    } catch (err) {
      console.error('Error al cargar puestos sin usuarios:', err);
      return [];
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
  const abrirModalCrear = async () => {
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
    
    // Cargar puestos sin usuarios para el selector
    await cargarPuestosSinUsuarios();
  };

  // Abrir modal para editar usuario
  const abrirModalEditar = async (usuario) => {
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
    
    // Cargar todos los puestos para edición (incluyendo el actual)
    await cargarPuestos();
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
    // Recargar puestos completos al cerrar
    cargarPuestos();
  };

  // Crear o actualizar usuario
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
        throw new Error('La contraseña es obligatoria para nuevos usuarios');
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
        response = await editarUsuario(editando.id, usuarioData);
      } else {
        response = await api.post('/usuarios', usuarioData);
      }

      console.log('✅ Usuario guardado:', response);
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

  // Editar usuario
  const editarUsuario = async (id, data) => {
    try {
      const response = await api.put(`/usuarios/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al editar usuario:', error);
      throw error;
    }
  };

  // Eliminar usuario (desactivar)
  const eliminarUsuario = async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  };

  // Reactivar usuario
  const reactivarUsuario = async (id) => {
    try {
      const response = await api.put(`/usuarios/${id}/reactivar`);
      return response.data;
    } catch (error) {
      console.error('Error al reactivar usuario:', error);
      throw error;
    }
  };

  // Manejar eliminación de usuario
  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await eliminarUsuario(id);
      await cargarUsuarios();
      alert('✅ Usuario desactivado exitosamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar usuario';
      setError(msg);
      alert(`❌ ${msg}`);
    }
  };

  // Manejar reactivación de usuario
  const handleReactivar = async (id) => {
    if (!confirm('¿Estás seguro de reactivar este usuario?')) return;
    
    try {
      await reactivarUsuario(id);
      await cargarUsuarios();
      alert('✅ Usuario reactivado exitosamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al reactivar usuario';
      setError(msg);
      alert(`❌ ${msg}`);
    }
  };

  // Filtrar usuarios por búsqueda y rol
  const usuariosFiltrados = usuarios.filter(u => {
    // Filtro por búsqueda
    const coincideBusqueda = 
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.telefono?.includes(busqueda);
    
    // Filtro por rol
    const coincideRol = filtroRol === '' || u.rol === filtroRol;
    
    return coincideBusqueda && coincideRol;
  });

  // Obtener colores para roles
  const getRolColor = (rol) => {
    const colores = {
      'Administrador': 'bg-purple-100 text-purple-700 border-purple-200',
      'Gerente': 'bg-blue-100 text-blue-700 border-blue-200',
      'Empleado': 'bg-green-100 text-green-700 border-green-200'
    };
    return colores[rol] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Obtener icono para roles
  const getRolIcon = (rol) => {
    const iconos = {
      'Administrador': <FaUserShield className="text-xs" />,
      'Gerente': <MdOutlineAdminPanelSettings className="text-xs" />,
      'Empleado': <FaUserCheck className="text-xs" />
    };
    return iconos[rol] || <FaUserCircle className="text-xs" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-blue-600" />
            Usuarios
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl 
                   flex items-center gap-2 font-medium transition-all duration-200 
                   shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 
                   hover:scale-105 active:scale-95"
        >
          <FaUserPlus className="text-lg" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros y Buscador */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Buscador */}
          <div className="flex-1 min-w-[200px] flex items-center gap-3">
            <FaSearch className="text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border-none outline-none text-gray-700 bg-transparent 
                         placeholder-gray-400 min-w-[150px]"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

          {/* Filtro por Rol */}
          <div className="flex items-center gap-3">
            <FaFilter className="text-gray-400" />
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       outline-none transition-all bg-white min-w-[150px]"
            >
              <option value="">Todos los roles</option>
              {roles.map((rol) => (
                <option key={rol.rol_id} value={rol.rol_nombre}>
                  {rol.rol_nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Contador de resultados */}
          <span className="text-sm text-gray-500 ml-auto flex items-center gap-2">
            <FaUsers className="text-blue-400" />
            {usuariosFiltrados.length} de {usuarios.length} usuarios
          </span>
        </div>
      </div>

      {/* Mensajes de carga y error */}
      {cargando && (
        <div className="text-center py-12">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-500 mt-3">Cargando usuarios...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl 
                        flex items-center gap-3 mb-6">
          <FaTimes className="text-red-500 text-lg" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de usuarios */}
      {!cargando && !error && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaUserCircle className="text-gray-400" />
                      Usuario
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      Teléfono
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      Correo
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaBriefcase className="text-gray-400" />
                      Puesto
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaUserShield className="text-gray-400" />
                      Rol
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MdOutlineAdminPanelSettings className="text-gray-400" />
                      Estado
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400">
                      <FaUserCircle className="text-5xl mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No hay usuarios registrados</p>
                      <p className="text-sm">
                        {filtroRol ? `No hay usuarios con el rol "${filtroRol}"` : 'Haz clic en "Nuevo Usuario" para crear uno'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr 
                      key={u.id} 
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            <FaUserCircle className="text-blue-500" />
                            {u.nombre} {u.apellido}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <FaIdCard className="text-xs" />
                            ID: {u.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400 text-xs" />
                          {u.telefono}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400 text-xs" />
                          {u.correo}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full 
                                         text-xs font-medium inline-flex items-center gap-1">
                          <FaBuilding className="text-xs" />
                          {u.puesto || 'Sin puesto'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                          inline-flex items-center gap-1 border
                                          ${getRolColor(u.rol)}`}>
                          {getRolIcon(u.rol)}
                          {u.rol || 'Sin rol'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                          inline-flex items-center gap-1 ${
                          u.activo 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {u.activo ? (
                            <>
                              <FaUserCheck className="text-xs" />
                              Activo
                            </>
                          ) : (
                            <>
                              <FaUserSlash className="text-xs" />
                              Inactivo
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          {u.activo ? (
                            <>
                              <button
                                onClick={() => abrirModalEditar(u)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg 
                                         transition-all duration-200 hover:scale-110"
                                title="Editar usuario"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleEliminar(u.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg 
                                         transition-all duration-200 hover:scale-110"
                                title="Desactivar usuario"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleReactivar(u.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg 
                                       transition-all duration-200 hover:scale-110"
                              title="Reactivar usuario"
                            >
                              <FaUndo className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pie de tabla */}
          {usuariosFiltrados.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <FaUsers className="text-blue-400" />
                Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
              </span>
              {filtroRol && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <FaFilter className="text-blue-400" />
                  Filtrado por: <strong>{filtroRol}</strong>
                  <button
                    onClick={() => setFiltroRol('')}
                    className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
                  >
                    (Limpiar filtro)
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar usuario */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={cerrarModal}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto
                          shadow-2xl transform transition-all"
                 onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                {editando ? (
                  <>
                    <FaEdit className="text-blue-600" />
                    Editar Usuario
                  </>
                ) : (
                  <>
                    <FaUserPlus className="text-blue-600" />
                    Nuevo Usuario
                  </>
                )}
              </h2>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors 
                           hover:bg-gray-100 p-2 rounded-lg"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="text-blue-500" />
                    Nombre *
                  </div>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el nombre"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FaUserTag className="text-blue-500" />
                    Apellido *
                  </div>
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el apellido"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-blue-500" />
                    Teléfono *
                  </div>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 50000000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" />
                    Correo *
                  </div>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FaKey className="text-blue-500" />
                    {editando ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
                  </div>
                </label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required={!editando}
                  placeholder={editando ? 'Dejar vacío para mantener la actual' : 'Ingrese la contraseña'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FaBriefcase className="text-blue-500" />
                    Puesto *
                  </div>
                  {!editando && (
                    <span className="text-xs text-gray-400 ml-2">
                      (Solo puestos sin usuario asignado)
                    </span>
                  )}
                </label>
                <select
                  name="pue_id"
                  value={formData.pue_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none transition-all bg-white"
                >
                  <option value="">Seleccione un puesto</option>
                  {(editando ? puestos : puestosDisponibles).map((p) => (
                    <option key={p.pue_id} value={p.pue_id}>
                      {p.pue_nombre} 
                      {!editando && p.usuarios_asignados > 0 && ' (Asignado)'}
                      {editando && p.pue_id === formData.pue_id && ' (Actual)'}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 
                           hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium 
                           hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 
                           disabled:opacity-60 disabled:cursor-not-allowed 
                           flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  {guardando ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {editando ? 'Actualizar' : 'Crear'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}