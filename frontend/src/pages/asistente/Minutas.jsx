// pages/asistente/Minutas.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaSpinner,
  FaUser,
  FaCalendarAlt,
  FaClipboardList,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';

export default function Minutas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reunion, setReunion] = useState(null);
  const [invitados, setInvitados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Estado para las tareas
  const [tareas, setTareas] = useState([
    { tar_nombre: '', tar_descripcion: '', tar_fecha: '', use_id: '' }
  ]);

  useEffect(() => {
    if (id) {
      cargarDatos(id);
    }
  }, [id]);

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

  const agregarTarea = () => {
    setTareas([
      ...tareas,
      { tar_nombre: '', tar_descripcion: '', tar_fecha: '', use_id: '' }
    ]);
  };

  const eliminarTarea = (index) => {
    if (tareas.length === 1) {
      setError('Debe haber al menos una tarea');
      return;
    }
    const nuevasTareas = tareas.filter((_, i) => i !== index);
    setTareas(nuevasTareas);
  };

  const actualizarTarea = (index, campo, valor) => {
    const nuevasTareas = [...tareas];
    nuevasTareas[index][campo] = valor;
    setTareas(nuevasTareas);
  };

  const guardarTareas = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setExito(false);

    const tareasIncompletas = tareas.some(t => 
      !t.tar_nombre.trim() || !t.tar_fecha || !t.use_id
    );

    if (tareasIncompletas) {
      setError('Todos los campos son obligatorios para cada tarea');
      setGuardando(false);
      return;
    }

    try {
      const tareasData = tareas.map(t => ({
        ...t,
        reu_id: parseInt(id)
      }));

      await api.post('/tareas', { tareas: tareasData });
      
      setExito(true);
      setError('');
      
      setTimeout(() => {
        setTareas([
          { tar_nombre: '', tar_descripcion: '', tar_fecha: '', use_id: '' }
        ]);
        setExito(false);
      }, 3000);

    } catch (err) {
      console.error('❌ Error al guardar tareas:', err);
      setError(err.response?.data?.message || 'Error al guardar las tareas');
    } finally {
      setGuardando(false);
    }
  };

  const volver = () => {
    navigate(`/asistente/reunion-detalle/${id}`);
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

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Botón volver */}
      <button
        onClick={volver}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span>Volver a la reunión</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
          📝 Minuta de Reunión
        </h2>
        <p className="text-gray-600">
          Tema: {reunion?.nombre || reunion?.reu_nombre} 
        </p>
        <p className="text-gray-600">
           Tipo de reunion: { reunion?.lugar || reunion?.reu_lugar} 
        </p>
        <p className="text-gray-600">
           Fecha: {formatearFecha(reunion?.fecha || reunion?.reu_fecha)}
        </p>
        <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
          <FaUser className="text-blue-500" />
          Asignar tareas a los participantes de la reunión
        </p>
      </div>

      {/* Formulario de tareas */}
      <form onSubmit={guardarTareas} className="space-y-4">
        {tareas.map((tarea, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 relative transition-all hover:shadow-md"
          >
            {/* Botón eliminar */}
            {tareas.length > 1 && (
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
                {index + 1}
              </span>
              Tarea #{index + 1}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre de la tarea */}
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700"
                />
              </div>

              {/* Descripción de la tarea */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Detalles de la tarea..."
                  value={tarea.tar_descripcion}
                  onChange={(e) => actualizarTarea(index, 'tar_descripcion', e.target.value)}
                  rows="2"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-y text-gray-700"
                />
              </div>

              {/* Fecha de entrega */}
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-700"
                />
              </div>

              {/* Asignar a usuario */}
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
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Botón Agregar Tarea */}
        <button
          type="button"
          onClick={agregarTarea}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <FaPlus /> Agregar otra tarea
        </button>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaTimes className="text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {exito && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaCheckCircle className="text-green-500 flex-shrink-0" />
            <span>Tareas guardadas correctamente</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={volver}
            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 md:flex-none px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {guardando ? (
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
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}