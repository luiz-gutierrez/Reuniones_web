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

      // ✅ Estructura correcta de los datos
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
      'presente': { color: 'bg-green-100 text-green-700', icon: FaCheck, text: 'Presente' },
      'ausente': { color: 'bg-red-100 text-red-700', icon: FaTimes, text: 'Ausente' },
      'justificado': { color: 'bg-yellow-100 text-yellow-700', icon: FaUserCheck, text: 'Justificado' }
    };
    const config = configs[estado] || configs['ausente'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
      <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        <p className="text-gray-500">Cargando detalles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
        <button
          onClick={volver}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (!reunion) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800">Reunión no encontrada</h2>
        <button
          onClick={volver}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mt-4 flex items-center gap-2 mx-auto"
        >
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Botón volver */}
      <button
        onClick={volver}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span>Volver a Agenda</span>
      </button>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {reunion.nombre || reunion.reu_nombre}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              ID: {reunion.id || reunion.reu_id}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <FaEdit /> Editar
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <FaTrash /> Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Fecha</div>
              <div className="font-medium text-gray-800">{formatearFecha(reunion.fecha || reunion.reu_fecha)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaClock className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Hora</div>
              <div className="font-medium text-gray-800">{reunion.hora || reunion.reu_hora}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Lugar</div>
              <div className="font-medium text-gray-800">{reunion.lugar || reunion.reu_lugar || 'Sin lugar definido'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaUser className="text-blue-600 text-xl" />
            <div>
              <div className="text-xs text-gray-500">Creador</div>
              <div className="font-medium text-gray-800">{reunion.creador?.nombre || reunion.creado_por_nombre || 'Sin creador'}</div>
            </div>
          </div>
        </div>

        {(reunion.descripcion || reunion.reu_descripcion) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" />
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
              {reunion.descripcion || reunion.reu_descripcion}
            </p>
          </div>
        )}
      </div>

      {/* Lista de invitados */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            Invitados ({invitados.length})
          </h2>
        </div>

        {invitados.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaUsers className="text-4xl mx-auto mb-2 opacity-40" />
            <p>No hay invitados para esta reunión</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {invitados.map((invitado) => {
              // ✅ Obtener los datos del usuario correctamente
              const usuario = invitado.usuario || invitado;
              const estatus = invitado.estatus || invitado.asi_estatus || 'ausente';
              const asiId = invitado.asi_id || invitado.id;
              
              return (
                <div
                  key={asiId}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all hover:scale-[1.02] border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
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

                      {/* Mostrar puesto y departamento */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {invitado.puesto && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            {invitado.puesto}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {getEstadoBadge(estatus)}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción para cambiar estado */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2 flex-wrap">
                    <button
                      onClick={() => actualizarEstadoAsistencia(asiId, 'presente')}
                      disabled={actualizando || estatus === 'presente'}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
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
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
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
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
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
        )}

        {/* Resumen de asistencias */}
        {invitados.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'presente').length}
                </div>
                <div className="text-xs text-gray-600">Presentes</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'ausente').length}
                </div>
                <div className="text-xs text-gray-600">Ausentes</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">
                  {invitados.filter(i => (i.estatus || i.asi_estatus || '').toLowerCase() === 'justificado').length}
                </div>
                <div className="text-xs text-gray-600">Justificados</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}