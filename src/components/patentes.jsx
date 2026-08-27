import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import DetallePatente from './detallePatente';
import '../styles/patentes.css';

const API_URL = import.meta.env.VITE_API_URL; 

function Patentes() {
    const [patentes, setPatentes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatente, setSelectedPatente] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showModalAlta, setShowModalAlta] = useState(false);
    const [nuevaPatente, setNuevaPatente] = useState('');
    const navigate = useNavigate();

    // ==========================================
    // Cargar datos al montar el componente
    // ==========================================
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError('');

            const responsePatentes = await axios.get(`${API_URL}/patentes`);
            const responseClientes = await axios.get(`${API_URL}/clientes`);

            if (responsePatentes.data.success) {
                setPatentes(responsePatentes.data.data);
            }

            if (responseClientes.data.success) {
                setClientes(responseClientes.data.data);
            }

        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los datos. Verifica que tu patente no esté creada.');
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Dar de alta una nueva patente
    // ==========================================
    const handleAltaPatente = async () => {
        if (!nuevaPatente.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, ingresá una patente',
                background: '#111',
                color: '#fff',
                confirmButtonColor: '#FFD700',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        try {
            const patenteUpper = nuevaPatente.toUpperCase().trim();
            
            const response = await axios.post(`${API_URL}/api/patentes`, {
                patente: patenteUpper
            });

            if (response.data.success) {
                setShowModalAlta(false);
                setNuevaPatente('');
                cargarDatos();
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `Patente ${patenteUpper} creada exitosamente`,
                    background: '#111',
                    color: '#fff',
                    confirmButtonColor: '#4CAF50',
                    confirmButtonText: 'OK',
                    timer: 2000,
                    timerProgressBar: true,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.error,
                    background: '#111',
                    color: '#fff',
                    confirmButtonColor: '#e74c3c',
                    confirmButtonText: 'Entendido',
                });
            }
        } catch (err) {
            console.error('Error al crear patente:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear la patente. Verifica que tu patente no esté creada.',
                background: '#111',
                color: '#fff',
                confirmButtonColor: '#e74c3c',
                confirmButtonText: 'Entendido',
            });
        }
    };

    // ==========================================
    // Filtrar patentes por búsqueda
    // ==========================================
    const patentesFiltradas = patentes.filter(p => 
        p.patente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ==========================================
    // Obtener datos del cliente para una patente
    // ==========================================
    const obtenerClientePorPatente = (patente) => {
        return clientes.find(c => c.patente === patente);
    };

    // ==========================================
    // Manejar click en una patente
    // ==========================================
    const handlePatenteClick = (patente) => {
        navigate(`/patentes/${patente}`);
    };

    // ==========================================
    // Volver a la lista
    // ==========================================
    const handleVolver = () => {
        setShowDetail(false);
        setSelectedPatente(null);
    };

    // ==========================================
    // Eliminar patente (callback desde DetallePatente)
    // ==========================================
    const handleEliminar = (patente) => {
        setShowDetail(false);
        setSelectedPatente(null);
        cargarDatos();
    };

    // ==========================================
    // Actualizar datos (callback desde DetallePatente)
    // ==========================================
    const handleActualizar = () => {
        cargarDatos();
    };

    // ==========================================
    // Renderizado
    // ==========================================
    if (loading) {
        return (
            <div className="patentes-container">
                <div className="patentes-loading">
                    <div className="spinner"></div>
                    <p>Cargando patentes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="patentes-container">
                <div className="patentes-error">
                    <p>{error}</p>
                    <button onClick={cargarDatos} className="patentes-btn-retry">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Si está en modo detalle, mostrar el componente DetallePatente
    if (showDetail && selectedPatente) {
        return (
            <DetallePatente 
                patente={selectedPatente}
                onVolver={handleVolver}
                onEliminar={handleEliminar}
                onActualizar={handleActualizar}
            />
        );
    }

    return (
        <div className="patentes-container">
            {/* HEADER - CONTADOR Y BOTÓN ALTA */}
            <div className="patentes-header">
                <div className="patentes-header-left">
                    <span className="patentes-count">
                        {patentesFiltradas.length} patentes encontradas
                    </span>
                </div>
                <div className="patentes-header-right">
                    <button 
                        className="patentes-btn-alta"
                        onClick={() => setShowModalAlta(true)}
                    >
                        Alta
                    </button>
                </div>
            </div>

            {/* BUSCADOR */}
            <div className="patentes-buscador">
                <input
                    type="text"
                    className="patentes-input-buscar"
                    placeholder="Buscar patente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && setSearchTerm(searchTerm)}
                />
                <button 
                    className="patentes-btn-buscar"
                    onClick={() => setSearchTerm(searchTerm)}
                >
                    BUSCAR
                </button>
            </div>

            {/* GRID DE PATENTES - SOLO MUESTRA LA PATENTE */}
            {patentesFiltradas.length === 0 ? (
                <div className="patentes-vacio">
                    <p>No hay patentes registradas</p>
                    {searchTerm && (
                        <p>No se encontraron resultados para "{searchTerm}"</p>
                    )}
                </div>
            ) : (
                <div className="patentes-grid">
                    {patentesFiltradas.map((p) => {
                        const cliente = obtenerClientePorPatente(p.patente);
                        const tieneDatos = cliente && (
                            cliente.modelo_auto || 
                            cliente.fecha || 
                            cliente.kilometraje
                        );

                        return (
                            <div 
                                key={p.patente}
                                className={`patentes-card ${tieneDatos ? 'con-datos' : 'sin-datos'}`}
                                onClick={() => handlePatenteClick(p.patente)}
                            >
                                <div className="patentes-card-patente">
                                    {p.patente}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE ALTA DE PATENTE */}
            {showModalAlta && (
                <div className="patentes-modal-overlay" onClick={() => setShowModalAlta(false)}>
                    <div className="patentes-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="patentes-modal-header">
                            <h3>Nueva Patente</h3>
                            <button 
                                className="patentes-modal-close"
                                onClick={() => setShowModalAlta(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="patentes-modal-body">
                            <div className="patentes-alta-form">
                                <label htmlFor="nuevaPatente">Ingresá la patente:</label>
                                <input
                                    type="text"
                                    id="nuevaPatente"
                                    className="patentes-input-alta"
                                    placeholder="Ej: ABC123"
                                    value={nuevaPatente}
                                    onChange={(e) => setNuevaPatente(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAltaPatente()}
                                    autoFocus
                                />
                                <div className="patentes-alta-actions">
                                    <button 
                                        className="patentes-btn-cancelar"
                                        onClick={() => setShowModalAlta(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="patentes-btn-confirmar"
                                        onClick={handleAltaPatente}
                                    >
                                        Crear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Patentes;