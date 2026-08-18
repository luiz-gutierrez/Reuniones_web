// src/pages/jefe_depto/ReunionDetalleJD.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaUsers,
    FaUser,
    FaInfoCircle,
    FaCheckCircle,
    FaEnvelope,
    FaPhone,
    FaExclamationTriangle,
    FaUserTimes,
    FaCalendarDay,
    FaCalendarWeek,
    FaCalendarCheck
} from 'react-icons/fa';

export default function ReunionDetalleJD() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reunion, setReunion] = useState(null);
    const [invitados, setInvitados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actualizando, setActualizando] = useState(false);

    useEffect(() => {
        if (id) {
            cargarDetalleReunion();
        }
    }, [id]);

    const cargarDetalleReunion = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/reuniones/${id}`);
            console.log('📋 Datos de la reunión:', response.data);

            setReunion(response.data.reunion);
            setInvitados(response.data.invitados || []);

            setError(null);
        } catch (err) {
            console.error('Error al cargar reunión:', err);
            setError(err.response?.data?.message || 'Error al cargar la reunión');
        } finally {
            setLoading(false);
        }
    };


    const volver = () => {
        navigate('/jefe_depto/reuniones');
    };

    const formatearFecha = (fecha) => {
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

    // Determinar el estatus de la reunión
    const getEstatusReunion = (fecha) => {
        if (!fecha) return 'sin_fecha';
        const hoy = new Date();
        const fechaReunion = new Date(fecha);
        const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const reunionInicio = new Date(fechaReunion.getFullYear(), fechaReunion.getMonth(), fechaReunion.getDate());

        if (reunionInicio.getTime() === hoyInicio.getTime()) return 'hoy';
        if (reunionInicio > hoyInicio) return 'proxima';
        return 'finalizada';
    };

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

    const getAsistenciaColor = (estatus) => {
        const colores = {
            'Presente': 'bg-green-100 text-green-800 border-green-200',
            'Ausente': 'bg-red-100 text-red-800 border-red-200'
        };
        return colores[estatus] || 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-500">Cargando detalles de la reunión...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4 p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
                    <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
                    <h3 className="text-red-800 font-semibold text-lg mb-2">Error al cargar reunión</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={cargarDetalleReunion}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!reunion) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-gray-500">Reunión no encontrada</p>
            </div>
        );
    }

    const estatusReunion = getEstatusReunion(reunion.fecha);
    const esCreador = reunion.creador?.id === user?.id;
    const totalInvitados = invitados.length;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Botón volver */}
            <button
                onClick={volver}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver a mis reuniones</span>
            </button>

            {/* Contenedor principal - Todo en un solo div */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header de la reunión */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b border-gray-200">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                {reunion.nombre}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstatusClase(estatusReunion)}`}>
                                    {getEstatusIcon(estatusReunion)}
                                    <span className="ml-1">{getEstatusTexto(estatusReunion)}</span>
                                </span>
                            </h1>
                            <p className="text-gray-600 mt-2">{reunion.descripcion || 'Sin descripción'}</p>
                        </div>
                    </div>
                </div>

                {/* Detalles de la reunión */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaCalendarAlt className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Fecha</p>
                                <p className="text-sm font-medium">{formatearFecha(reunion.fecha)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaClock className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Hora</p>
                                <p className="text-sm font-medium">{formatearHora(reunion.hora)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaMapMarkerAlt className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Lugar</p>
                                <p className="text-sm font-medium">{reunion.lugar || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaUser className="text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Organizador</p>
                                <p className="text-sm font-medium">{reunion.creador?.nombre} {reunion.creador?.apellido}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participantes */}
                <div className="px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaUsers className="text-blue-500" />
                            Participantes
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({totalInvitados} invitados)
                            </span>
                        </h2>
                    </div>

                    {invitados.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FaUsers className="text-4xl text-gray-300 mx-auto mb-3" />
                            <p>No hay participantes en esta reunión</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {invitados.map((invitado) => (
                                <div
                                    key={invitado.asi_id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${
                                        invitado.usuario?.id === user?.id
                                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                                        invitado.usuario?.id === user?.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {invitado.usuario?.nombre?.[0]}{invitado.usuario?.apellido?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {invitado.usuario?.nombre} {invitado.usuario?.apellido}
                                            </p>
                                            {invitado.usuario?.id === user?.id && (
                                                <span className="text-xs text-blue-600 font-medium flex-shrink-0">(Tú)</span>
                                            )}
                                            {invitado.usuario?.id === reunion.creador?.id && (
                                                <span className="text-xs text-yellow-600 font-medium flex-shrink-0">⭐</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                                <FaEnvelope className="text-gray-400 flex-shrink-0" size={10} />
                                                <span className="truncate">{invitado.usuario?.puesto || 'Sin puesto'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                                <FaEnvelope className="text-gray-400 flex-shrink-0" size={10} />
                                                <span className="truncate">{invitado.usuario?.correo || 'Sin correo'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <FaPhone className="text-gray-400 flex-shrink-0" size={10} />
                                                <span>{invitado.usuario?.telefono || 'Sin teléfono'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer con estadísticas */}

            </div>
        </div>
    );
}