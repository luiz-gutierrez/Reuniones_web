// pages/asistente/ReunionDetalle.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generarPDFReunion } from '../../utils/generarPDFReunion';
import { logoBase64 } from '../../utils/logoBase64';
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
  FaClipboardList,
  FaTasks,
  FaPlus,
  FaSave,
  FaCheckCircle,
  FaPencilAlt,
  FaTimesCircle,
  FaFilePdf,
  FaSearch
} from 'react-icons/fa';

export default function ReunionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========== ESTADOS PRINCIPALES ==========
  const [reunion, setReunion] = useState(null);
  const [invitados, setInvitados] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]); // ✅ Para buscar todos los usuarios
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  // ========== ESTADOS PARA TAREAS ==========
  const [tareas, setTareas] = useState([]);
  const [tareasGuardadas, setTareasGuardadas] = useState([]);
  const [editandoTarea, setEditandoTarea] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardandoTareas, setGuardandoTareas] = useState(false);

  // ========== ESTADO PARA EDITAR REUNIÓN ==========
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [guardandoReunion, setGuardandoReunion] = useState(false);
  const [reunionEdit, setReunionEdit] = useState({
    reu_nombre: '',
    reu_descripcion: '',
    reu_lugar: '',
    reu_fecha: '',
    reu_hora: ''
  });

  // ========== ESTADO PARA ASISTENTES ==========
  const [mostrarModalAsistentes, setMostrarModalAsistentes] = useState(false);
  const [reunionSeleccionada, setReunionSeleccionada] = useState(null);
  const [asistentesSeleccionados, setAsistentesSeleccionados] = useState([]);
  const [asistentesGuardados, setAsistentesGuardados] = useState([]);
  const [busquedaAsistente, setBusquedaAsistente] = useState('');
  const [guardandoAsistentes, setGuardandoAsistentes] = useState(false);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (id) {
      cargarDatos(id);
      cargarTareasGuardadas(id);
      cargarTodosUsuarios(); // ✅ Cargar todos los usuarios
    }
  }, [id]);

  // ========== FUNCIONES DE CARGA ==========
  async function cargarDatos(reunionId) {
    setCargando(true);
    setError('');
    try {
      const reunionRes = await api.get(`/reuniones/${reunionId}`);
      console.log('📋 Reunión:', reunionRes.data);

      if (reunionRes.data.reunion) {
        setReunion(reunionRes.data.reunion);
        setInvitados(reunionRes.data.invitados || []);
      } else {
        setReunion(reunionRes.data);
        const invitadosRes = await api.get(`/reuniones/${reunionId}/invitados`);
        setInvitados(invitadosRes.data);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  }

  async function cargarTareasGuardadas(reunionId) {
    try {
      const response = await api.get(`/tareas/reunion/${reunionId}`);
      console.log('📋 Tareas guardadas:', response.data);
      setTareasGuardadas(response.data || []);
    } catch (err) {
      console.error('❌ Error al cargar tareas:', err);
      setTareasGuardadas([]);
    }
  }

  // ✅ Nueva función para cargar todos los usuarios
  async function cargarTodosUsuarios() {
    try {
      const { data } = await api.get('/usuarios');
      setTodosUsuarios(data);
      console.log('👥 Todos los usuarios cargados:', data.length);
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err);
      setTodosUsuarios([]);
    }
  }

  // ========== FUNCIONES PARA EDITAR REUNIÓN ==========
  const abrirModalEditar = () => {
    if (reunion) {
      setReunionEdit({
        reu_nombre: reunion.nombre || reunion.reu_nombre || '',
        reu_descripcion: reunion.descripcion || reunion.reu_descripcion || '',
        reu_lugar: reunion.lugar || reunion.reu_lugar || '',
        reu_fecha: reunion.fecha || reunion.reu_fecha || '',
        reu_hora: reunion.hora || reunion.reu_hora || ''
      });
      setMostrarModalEditar(true);
    }
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setReunionEdit({
      reu_nombre: '',
      reu_descripcion: '',
      reu_lugar: '',
      reu_fecha: '',
      reu_hora: ''
    });
    setError('');
  };

  const handleCambioReunion = (e) => {
    const { name, value } = e.target;
    setReunionEdit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarReunionEditada = async (e) => {
    e.preventDefault();
    setGuardandoReunion(true);
    setError('');

    if (!reunionEdit.reu_nombre.trim()) {
      setError('El nombre de la reunión es obligatorio');
      setGuardandoReunion(false);
      return;
    }

    if (!reunionEdit.reu_fecha) {
      setError('La fecha es obligatoria');
      setGuardandoReunion(false);
      return;
    }

    if (!reunionEdit.reu_hora) {
      setError('La hora es obligatoria');
      setGuardandoReunion(false);
      return;
    }

    try {
      const reunionId = reunion.id || reunion.reu_id;
      await api.put(`/reuniones/${reunionId}`, reunionEdit);

      setReunion({
        ...reunion,
        nombre: reunionEdit.reu_nombre,
        reu_nombre: reunionEdit.reu_nombre,
        descripcion: reunionEdit.reu_descripcion,
        reu_descripcion: reunionEdit.reu_descripcion,
        lugar: reunionEdit.reu_lugar,
        reu_lugar: reunionEdit.reu_lugar,
        fecha: reunionEdit.reu_fecha,
        reu_fecha: reunionEdit.reu_fecha,
        hora: reunionEdit.reu_hora,
        reu_hora: reunionEdit.reu_hora
      });

      setExito(true);
      cerrarModalEditar();
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      console.error('❌ Error al actualizar reunión:', err);
      setError(err.response?.data?.message || 'Error al actualizar la reunión');
    } finally {
      setGuardandoReunion(false);
    }
  };

  // ========== FUNCIONES PARA TAREAS ==========
  const agregarTarea = () => {
    setTareas([
      ...tareas,
      {
        tar_nombre: '',
        tar_descripcion: '',
        tar_fecha: '',
        use_id: '',
        es_nueva: true,
        tar_id: null
      }
    ]);
    setMostrarFormulario(true);
  };

  const eliminarTarea = (index) => {
    if (tareas.length === 1) {
      setError('Debe haber al menos una tarea');
      return;
    }
    setTareas(tareas.filter((_, i) => i !== index));
  };

  const actualizarTarea = (index, campo, valor) => {
    const nuevasTareas = [...tareas];
    nuevasTareas[index][campo] = valor;
    setTareas(nuevasTareas);
  };

  const guardarTareas = async (e) => {
    e.preventDefault();
    setGuardandoTareas(true);
    setError('');
    setExito(false);

    const tareasIncompletas = tareas.some(t =>
      !t.tar_nombre.trim() || !t.tar_descripcion.trim() || !t.tar_fecha || !t.use_id
    );

    if (tareasIncompletas) {
      setError('Todos los campos son obligatorios para cada tarea');
      setGuardandoTareas(false);
      return;
    }

    try {
      const tareasData = tareas.map(t => ({
        tar_nombre: t.tar_nombre,
        tar_descripcion: t.tar_descripcion,
        tar_fecha: t.tar_fecha,
        use_id: t.use_id,
        reu_id: parseInt(id)
      }));

      await api.post('/tareas', { tareas: tareasData });
      await cargarTareasGuardadas(id);

      setExito(true);
      setTareas([]);
      setMostrarFormulario(false);
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      console.error('❌ Error al guardar tareas:', err);
      setError(err.response?.data?.message || 'Error al guardar las tareas');
    } finally {
      setGuardandoTareas(false);
    }
  };

  const editarTareaGuardada = (tarea) => {
    setTareas([{
      tar_id: tarea.tar_id,
      tar_nombre: tarea.tar_nombre,
      tar_descripcion: tarea.tar_descripcion,
      tar_fecha: tarea.tar_fecha,
      use_id: tarea.use_id,
      es_nueva: false
    }]);
    setEditandoTarea(tarea.tar_id);
    setMostrarFormulario(true);
    document.getElementById('formulario-tareas')?.scrollIntoView({ behavior: 'smooth' });
  };

  const actualizarTareaGuardada = async (e) => {
    e.preventDefault();
    setGuardandoTareas(true);
    setError('');
    setExito(false);

    const tarea = tareas[0];
    if (!tarea.tar_nombre.trim() || !tarea.tar_descripcion.trim() || !tarea.tar_fecha || !tarea.use_id) {
      setError('Todos los campos son obligatorios');
      setGuardandoTareas(false);
      return;
    }

    try {
      await api.put(`/tareas/${tarea.tar_id}`, {
        tar_nombre: tarea.tar_nombre,
        tar_descripcion: tarea.tar_descripcion,
        tar_fecha: tarea.tar_fecha,
        use_id: tarea.use_id
      });

      await cargarTareasGuardadas(id);
      setExito(true);
      setTareas([]);
      setEditandoTarea(null);
      setMostrarFormulario(false);
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      console.error('❌ Error al actualizar tarea:', err);
      setError(err.response?.data?.message || 'Error al actualizar la tarea');
    } finally {
      setGuardandoTareas(false);
    }
  };

  const eliminarTareaGuardada = async (tarId) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    setGuardandoTareas(true);
    try {
      await api.delete(`/tareas/${tarId}`);
      await cargarTareasGuardadas(id);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      console.error('❌ Error al eliminar tarea:', err);
      setError('Error al eliminar la tarea');
    } finally {
      setGuardandoTareas(false);
    }
  };

  const cancelarEdicion = () => {
    setTareas([]);
    setEditandoTarea(null);
    setMostrarFormulario(false);
    setError('');
  };

  // ========== FUNCIONES PARA ASISTENTES ==========
  const abrirModalAsistentes = async () => {
    if (!reunion) {
      console.error('❌ No hay reunión seleccionada');
      return;
    }

    const reunionId = reunion.id || reunion.reu_id;
    console.log('🆔 ID de reunión:', reunionId);

    if (!reunionId) {
      console.error('❌ La reunión no tiene ID');
      setError('Error: No se pudo identificar la reunión');
      return;
    }

    setReunionSeleccionada(reunion);
    setAsistentesSeleccionados([]);
    setBusquedaAsistente('');

    try {
      // Cargar los invitados actuales
      const { data } = await api.get(`/reuniones/${reunionId}/invitados`);
      console.log('📋 Asistentes actuales:', data);
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

  const cerrarModalAsistentes = () => {
    setMostrarModalAsistentes(false);
    setReunionSeleccionada(null);
    setAsistentesSeleccionados([]);
    setAsistentesGuardados([]);
    setError('');
    setBusquedaAsistente('');
  };

  const toggleAsistente = (userId) => {
    setAsistentesSeleccionados(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const guardarAsistentes = async () => {
    if (!reunionSeleccionada) {
      setError('No hay reunión seleccionada');
      return;
    }

    const reunionId = reunionSeleccionada.id || reunionSeleccionada.reu_id;
    
    if (!reunionId) {
      setError('Error: No se pudo identificar la reunión');
      return;
    }

    console.log('🆔 Guardando asistentes para reunión ID:', reunionId);
    console.log('👥 Asistentes seleccionados:', asistentesSeleccionados);

    setGuardandoAsistentes(true);
    setError('');

    try {
      await api.put(`/reuniones/${reunionId}/invitados`, {
        invitados: asistentesSeleccionados
      });

      // Recargar los datos actualizados
      const { data } = await api.get(`/reuniones/${reunionId}/invitados`);
      setAsistentesGuardados(data);
      setInvitados(data); // Actualizar la lista de invitados en la vista principal

      alert('✅ Asistentes actualizados correctamente');
      cerrarModalAsistentes();
      
      // ✅ Recargar los datos de la reunión para actualizar la vista
      await cargarDatos(reunionId);
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al guardar asistentes';
      setError(mensaje);
      console.error('❌ Error al guardar asistentes:', err);
    } finally {
      setGuardandoAsistentes(false);
    }
  };

  // ========== FUNCIONES PARA ASISTENCIA ==========
  const actualizarEstadoAsistencia = async (asiId, nuevoEstado) => {
    setActualizando(true);
    try {
      await api.put(`/asistencias/${asiId}/estatus`, { asi_estatus: nuevoEstado });
      const reunionId = reunion.id || reunion.reu_id;
      const { data } = await api.get(`/reuniones/${reunionId}/invitados`);
      setInvitados(data);
    } catch (err) {
      alert('Error al actualizar el estado de asistencia');
      console.error('❌ Error:', err);
    } finally {
      setActualizando(false);
    }
  };

  // ========== UTILIDADES ==========
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatearFechaInput = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toISOString().split('T')[0];
  };

  const volver = () => {
    navigate('/asistente/agenda');
  };

  const handleDescargarPDF = () => {
    generarPDFReunion(reunion, invitados, tareasGuardadas, {
      nombre: 'DISTRIBUCIONES AUTOPARTES GARCIA JIMENEZ S.A. DE C.V.',
      logoBase64: logoBase64,
    });
  };

  // ========== RENDERIZADO DE BADGES ==========
  const getEstadoBadge = (estatus) => {
    const estado = estatus?.toLowerCase() || 'ausente';
    const configs = {
      'presente': {
        color: 'text-green-700',
        bg: 'bg-green-100',
        icon: FaCheck,
        text: 'Presente'
      },
      'ausente': {
        color: 'text-red-700',
        bg: 'bg-red-100',
        icon: FaTimes,
        text: 'Ausente'
      },
      'justificado': {
        color: 'text-yellow-700',
        bg: 'bg-yellow-100',
        icon: FaUserCheck,
        text: 'Justificado'
      }
    };
    const config = configs[estado] || configs['ausente'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const getEstadoTareaBadge = (status) => {
    const configs = {
      'Iniciar': { color: 'text-blue-700', bg: 'bg-blue-100' },
      'Proceso': { color: 'text-yellow-700', bg: 'bg-yellow-100' },
      'Revision': { color: 'text-purple-700', bg: 'bg-purple-100' },
      'Finalizado': { color: 'text-green-700', bg: 'bg-green-100' }
    };
    const config = configs[status] || { color: 'text-gray-700', bg: 'bg-gray-100' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        {status || 'Sin estado'}
      </span>
    );
  };

  const getIniciales = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  // ========== FILTRO DE ASISTENTES ==========
  const asistentesFiltrados = todosUsuarios.filter(u =>
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(busquedaAsistente.toLowerCase()) ||
    u.correo?.toLowerCase().includes(busquedaAsistente.toLowerCase())
  );

  // ========== RENDER ==========
  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        <p className="text-gray-500">Cargando detalles...</p>
      </div>
    );
  }

  if (error && !reunion) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={volver}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (!reunion) {
    return (
      <div className="text-center max-w-4xl mx-auto p-4">
        <h2 className="text-2xl text-gray-800">Reunión no encontrada</h2>
        <button
          onClick={volver}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto mt-4 transition-colors"
        >
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Botón volver */}
      <button
        onClick={volver}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 cursor-pointer text-sm mb-6 transition-all group"
      >
        <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
        <span>Volver a Agenda</span>
      </button>

      {/* Botón PDF */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleDescargarPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors"
        >
          <FaFilePdf size={14} /> Descargar PDF
        </button>
      </div>

      {/* ========== TARJETA PRINCIPAL ========== */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold m-0">
              {reunion.nombre || reunion.reu_nombre}
            </h2>
            <p className="text-gray-500 text-sm m-0 mt-1">
              ID: {reunion.id || reunion.reu_id}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={abrirModalEditar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors"
            >
              <FaEdit size={14} /> Editar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Fecha</div>
              <div className="font-medium text-gray-800">
                {formatearFecha(reunion.fecha || reunion.reu_fecha)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaClock className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Hora</div>
              <div className="font-medium text-gray-800">
                {reunion.hora || reunion.reu_hora}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Lugar</div>
              <div className="font-medium text-gray-800">
                {reunion.lugar || reunion.reu_lugar || 'Sin lugar definido'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaUser className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Creador</div>
              <div className="font-medium text-gray-800">
                {reunion.creador?.nombre || reunion.creado_por_nombre || 'Sin creador'}
              </div>
            </div>
          </div>
        </div>

        {(reunion.descripcion || reunion.reu_descripcion) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" />
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg m-0">
              {reunion.descripcion || reunion.reu_descripcion}
            </p>
          </div>
        )}
      </div>

      {/* ========== MODAL EDITAR REUNIÓN ========== */}
      {mostrarModalEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-blue-600" />
                Editar Reunión
              </h3>
              <button
                onClick={cerrarModalEditar}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>

            <form onSubmit={guardarReunionEditada} className="p-6 space-y-4">
              {/* Formulario de edición... (igual que antes) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <FaClipboardList className="inline mr-1.5 text-blue-500" />
                  Nombre de la reunión *
                </label>
                <input
                  type="text"
                  name="reu_nombre"
                  value={reunionEdit.reu_nombre}
                  onChange={handleCambioReunion}
                  placeholder="Ej: Reunión de equipo"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción
                </label>
                <textarea
                  name="reu_descripcion"
                  value={reunionEdit.reu_descripcion}
                  onChange={handleCambioReunion}
                  placeholder="Descripción de la reunión..."
                  rows="3"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-y text-gray-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <FaMapMarkerAlt className="inline mr-1.5 text-blue-500" />
                  Lugar
                </label>
                <input
                  type="text"
                  name="reu_lugar"
                  value={reunionEdit.reu_lugar}
                  onChange={handleCambioReunion}
                  placeholder="Ej: Sala de juntas 2"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FaCalendarAlt className="inline mr-1.5 text-blue-500" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="reu_fecha"
                    value={formatearFechaInput(reunionEdit.reu_fecha)}
                    onChange={handleCambioReunion}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FaClock className="inline mr-1.5 text-blue-500" />
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="reu_hora"
                    value={reunionEdit.reu_hora}
                    onChange={handleCambioReunion}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700 bg-white"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <FaTimes className="text-red-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalEditar}
                  className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoReunion}
                  className="flex-1 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {guardandoReunion ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== SECCIÓN DE TAREAS ========== */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaTasks className="text-green-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800 m-0">
            Tareas Asignadas
          </h3>
          <span className="text-sm text-gray-500 ml-2">
            ({tareasGuardadas.length} tarea{tareasGuardadas.length !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="space-y-3">
          {tareasGuardadas.map((tarea) => (
            <div
              key={tarea.tar_id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-800">
                      {tarea.tar_nombre}
                    </h4>
                    {getEstadoTareaBadge(tarea.tar_estatus)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {tarea.tar_descripcion}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt size={10} />
                      {formatearFechaCorta(tarea.tar_fecha)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUser size={10} />
                      {tarea.usuario_nombre} {tarea.usuario_apellido}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => editarTareaGuardada(tarea)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <FaPencilAlt size={10} /> Editar
                  </button>
                  <button
                    onClick={() => eliminarTareaGuardada(tarea.tar_id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <FaTrash size={10} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== FORMULARIO DE TAREAS ========== */}
<div id="formulario-tareas" className="bg-white rounded-lg p-6 shadow-sm mb-6">
  {mostrarFormulario ? (
    <form onSubmit={editandoTarea ? actualizarTareaGuardada : guardarTareas} className="space-y-4">
      {tareas.map((tarea, index) => (
        <div
          key={index}
          className="bg-gray-50 rounded-lg p-5 border border-gray-200 relative transition-all hover:shadow-md"
        >
          {!editandoTarea && tareas.length > 1 && (
            <button
              type="button"
              onClick={() => eliminarTarea(index)}
              className="absolute top-3 right-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <FaTrash size={12} /> Eliminar
            </button>
          )}

          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
              {editandoTarea ? '✏️' : (index + 1)}
            </span>
            {editandoTarea ? 'Editando tarea' : `Tarea #${index + 1}`}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaClipboardList className="inline mr-1.5 text-blue-500" />
                Nombre de la tarea *
              </label>
              <input
                type="text"
                placeholder="Ej: Revisar documentación"
                value={tarea.tar_nombre}
                onChange={(e) => actualizarTarea(index, 'tar_nombre', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700 bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descripción *
              </label>
              <textarea
                placeholder="Detalles de la tarea..."
                value={tarea.tar_descripcion}
                onChange={(e) => actualizarTarea(index, 'tar_descripcion', e.target.value)}
                required
                rows="2"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-y text-gray-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaCalendarAlt className="inline mr-1.5 text-blue-500" />
                Fecha de entrega *
              </label>
              <input
                type="date"
                value={tarea.tar_fecha}
                onChange={(e) => actualizarTarea(index, 'tar_fecha', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaUser className="inline mr-1.5 text-blue-500" />
                Asignar a *
              </label>
              <select
                value={tarea.use_id}
                onChange={(e) => actualizarTarea(index, 'use_id', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white text-gray-700"
              >
                <option value="">Seleccionar usuario</option>
                {invitados.map((invitado) => {
                  const usuario = invitado.usuario || invitado;
                  return (
                    <option key={usuario.id || usuario.use_id} value={usuario.id || usuario.use_id}>
                      {usuario.nombre} {usuario.apellido}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      ))}

      {!editandoTarea && (
        <button
          type="button"
          onClick={agregarTarea}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <FaPlus /> Agregar otra tarea
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <FaTimes className="text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {exito && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <FaCheckCircle className="text-green-500 flex-shrink-0" />
          <span>{editandoTarea ? 'Tarea actualizada correctamente' : 'Tareas guardadas correctamente'}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {editandoTarea ? (
          <>
            <button
              type="button"
              onClick={cancelarEdicion}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoTareas}
              className="flex-1 px-8 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardandoTareas ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <FaSave /> Actualizar Tarea
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={cancelarEdicion}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoTareas || tareas.length === 0}
              className="flex-1 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardandoTareas ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave /> Guardar Tareas ({tareas.length})
                </>
              )}
            </button>
          </>
        )}
      </div>
    </form>
  ) : (
    /* ✅ Botón visible SIEMPRE que no haya formulario */
    <button
      onClick={agregarTarea}
      className="w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
    >
      <FaPlus /> Agregar nueva tarea
    </button>
  )}
</div>

      {/* ========== LISTA DE INVITADOS ========== */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 m-0 flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            Invitados ({invitados.length})
          </h3>
          <button
            onClick={abrirModalAsistentes}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors"
          >
            <FaEdit size={14} /> Editar Asistentes
          </button>
        </div>

        {invitados.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaUsers className="text-4xl mx-auto mb-2 opacity-40" />
            <p>No hay invitados para esta reunión</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {invitados.map((invitado) => {
                const usuario = invitado.usuario || invitado;
                const estatus = invitado.estatus || invitado.asi_estatus || 'ausente';
                const asiId = invitado.asi_id || invitado.id;

                return (
                  <div
                    key={asiId}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 hover:scale-[1.02] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {getIniciales(usuario.nombre, usuario.apellido)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">
                          {usuario.nombre} {usuario.apellido}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                          <FaEnvelope size={10} />
                          <span className="truncate">{usuario.correo}</span>
                        </div>

                        {usuario.telefono && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FaPhone size={10} />
                            <span>{usuario.telefono}</span>
                          </div>
                        )}

                        {invitado.puesto && (
                          <div className="mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {invitado.puesto}
                            </span>
                          </div>
                        )}

                        <div className="mt-2">
                          {getEstadoBadge(estatus)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => actualizarEstadoAsistencia(asiId, 'presente')}
                        disabled={actualizando || estatus === 'presente'}
                        className={`px-3 py-0.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          estatus === 'presente'
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-700'
                        }`}
                      >
                        <FaCheck size={10} /> Presente
                      </button>
                      <button
                        onClick={() => actualizarEstadoAsistencia(asiId, 'ausente')}
                        disabled={actualizando || estatus === 'ausente'}
                        className={`px-3 py-0.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          estatus === 'ausente'
                            ? 'bg-red-100 text-red-700 cursor-default'
                            : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-700'
                        }`}
                      >
                        <FaTimes size={10} /> Ausente
                      </button>
                      <button
                        onClick={() => actualizarEstadoAsistencia(asiId, 'justificado')}
                        disabled={actualizando || estatus === 'justificado'}
                        className={`px-3 py-0.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          estatus === 'justificado'
                            ? 'bg-yellow-100 text-yellow-700 cursor-default'
                            : 'bg-gray-200 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
                        }`}
                      >
                        <FaUserCheck size={10} /> Justificado
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'presente').length}
                </div>
                <div className="text-xs text-green-700">Presentes</div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-700">
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'ausente').length}
                </div>
                <div className="text-xs text-red-700">Ausentes</div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'justificado').length}
                </div>
                <div className="text-xs text-yellow-700">Justificados</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========== MODAL EDITAR ASISTENTES ========== */}
      {mostrarModalAsistentes && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModalAsistentes}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">
                  <FaUsers className="inline mr-2" />
                  Editar Asistentes
                </h2>
                <p className="text-slate-800 opacity-60 text-sm mt-1">
                  {reunionSeleccionada?.reu_nombre || reunionSeleccionada?.nombre} - {formatearFecha(reunionSeleccionada?.reu_fecha || reunionSeleccionada?.fecha)}
                </p>
              </div>
              <button
                onClick={cerrarModalAsistentes}
                className="bg-none border-none text-2xl text-slate-800 opacity-40 cursor-pointer hover:opacity-60 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <FaSearch className="text-slate-800 opacity-40" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={busquedaAsistente}
                onChange={(e) => setBusquedaAsistente(e.target.value)}
                className="flex-1 border-none outline-none text-sm text-slate-800 bg-transparent"
              />
            </div>

            <div className="max-h-72 overflow-y-auto mb-4">
              {asistentesFiltrados.length === 0 ? (
                <p className="text-center text-slate-800 opacity-40 py-8">
                  No hay usuarios disponibles
                </p>
              ) : (
                asistentesFiltrados.map((u) => {
                  const seleccionado = asistentesSeleccionados.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleAsistente(u.id)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                        seleccionado
                          ? 'bg-blue-100 border border-blue-600'
                          : 'bg-transparent border border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        seleccionado ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">
                          {u.nombre} {u.apellido}
                        </div>
                        <div className="text-xs text-slate-800 opacity-50">
                          {u.correo} • {u.puesto || 'Sin puesto'}
                        </div>
                      </div>
                      {seleccionado && (
                        <FaCheck className="text-blue-600 text-xl" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-slate-800 m-0">
                <strong>{asistentesSeleccionados.length}</strong> usuarios seleccionados
                {asistentesGuardados.length > 0 && (
                  <span className="ml-2 opacity-60">
                    • {asistentesGuardados.length} actuales
                  </span>
                )}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarModalAsistentes}
                className="px-6 py-3 border border-slate-200 rounded-lg bg-white text-slate-800 cursor-pointer transition-all hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarAsistentes}
                disabled={guardandoAsistentes}
                className={`px-6 py-3 bg-blue-600 text-white border-none rounded-lg cursor-pointer flex items-center gap-2 font-medium transition-all hover:scale-105 ${
                  guardandoAsistentes ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {guardandoAsistentes ? (
                  <>
                    <FaSpinner className="animate-spin" />
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
    </div>
  );
}