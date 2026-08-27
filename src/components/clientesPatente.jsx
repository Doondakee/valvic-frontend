import { useState } from 'react';
import axios from 'axios';
import logoValvic from '../assets/valvic.png';
import logoWhatsapp from '../assets/whatsapp.png';
import logoInstagram from '../assets/instagram.png';

const API_URL = import.meta.env.VITE_API_URL;

function ClientesPatentes() {
    const [patente, setPatente] = useState('');
    const [loading, setLoading] = useState(false);
    const [cliente, setCliente] = useState(null);
    const [error, setError] = useState('');
    const [logueado, setLogueado] = useState(false);

    // ==========================================
    // Buscar cliente por patente ("login") Gomería
    // ==========================================
    const handleLogin = async (e) => {
        e.preventDefault();
        
        const patenteTrim = patente.trim().toUpperCase();
        if (!patenteTrim) {
            setError('Por favor, ingresá tu patente');
            return;
        }

        if (patenteTrim.length < 5) {
            setError('La patente debe tener al menos 5 caracteres');
            return;
        }

        setLoading(true);
        setError('');
        setCliente(null);

        try {
            const response = await axios.get(`${API_URL}/clientes/${patenteTrim}`);

            if (response.data.success && response.data.data) {
                setCliente(response.data.data);
                setLogueado(true);
            } else {
                setError(`No se encontró información para la patente "${patenteTrim}"`);
            }
        } catch (err) {
            console.error('Error al buscar patente:', err);
            if (err.response?.status === 404) {
                setError(`No se encontró información para la patente "${patenteTrim}"`);
            } else {
                setError('Error al conectar con el servidor. Intentá más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Cerrar sesión (volver al login)
    // ==========================================
    const handleLogout = () => {
        setLogueado(false);
        setCliente(null);
        setPatente('');
        setError('');
    };

    // ==========================================
    // Lista de servicios que se muestran al cliente (SOLO CHECKS)
    // ==========================================
    const serviciosMostrados = [
        { key: 'filtro_aceite', label: 'Filtro Aceite' },
        { key: 'filtro_aire', label: 'Filtro Aire' },
        { key: 'filtro_nafta', label: 'Filtro Nafta' },
        { key: 'filtro_gasoil', label: 'Filtro Gasoil' },
        { key: 'filtro_habitaculo', label: 'Filtro Habitáculo' },
        { key: 'diferencial', label: 'Diferencial' },
        { key: 'caja', label: 'Caja' }
    ];

    // ==========================================
    // Otros servicios (MUESTRA EL TEXTO Y EL CHECK)
    // ==========================================
    const otrosServicios = [
        { key: 'otros1', label: 'Otro 1' },
        { key: 'otros2', label: 'Otro 2' },
        { key: 'otros3', label: 'Otro 3' }
    ];

    // ==========================================
    // Número de WhatsApp
    // ==========================================
    const numeroWhatsapp = '5491155808864';
    const urlWhatsapp = `https://wa.me/${numeroWhatsapp}`;
    const urlInstagram = 'https://www.instagram.com/gomeria.valvic/';

    // ==========================================
    // PANTALLA DE LOGIN (falso)
    // ==========================================
    if (!logueado) {
        return (
            <div className="clientes-patentes-container">
                <div className="clientes-patentes-login">
                    <div className="clientes-patentes-login-header">
                        <img src={logoValvic} alt="Valvic" className="clientes-patentes-logo" />
                        <p className="clientes-patentes-login-subtitle">Consultá la información de tu vehículo</p>
                    </div>

                    <form className="clientes-patentes-login-form" onSubmit={handleLogin}>
                        <div className="clientes-patentes-login-input-group">
                            <label htmlFor="patente">Patente</label>
                            <input
                                id="patente"
                                type="text"
                                className="clientes-patentes-login-input"
                                placeholder="Ej: ABC123"
                                value={patente}
                                onChange={(e) => setPatente(e.target.value.toUpperCase())}
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="clientes-patentes-login-error">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="clientes-patentes-login-btn"
                            disabled={loading || !patente.trim()}
                        >
                            {loading ? 'Consultando...' : 'Consultar'}
                        </button>
                    </form>

                    <div className="clientes-patentes-login-footer">
                        <span>Ante cualquier duda, consultá con el taller</span>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // PANTALLA DE RESULTADOS (logueado)
    // ==========================================
    // Filtrar otros que tengan check en true Y texto no vacío
    const otrosConDatos = otrosServicios.filter(s => {
        const checkKey = `${s.key}_check`;
        const texto = cliente[s.key] || '';
        return cliente[checkKey] === true && texto.trim() !== '';
    });

    return (
        <div className="clientes-patentes-container">
            <div className="clientes-patentes-resultado-wrapper">
                {/* HEADER DEL RESULTADO - Ahora con Salir en la misma línea */}
                <div className="clientes-patentes-resultado-header">
                    <div className="clientes-patentes-resultado-brand">
                        <img src={logoValvic} alt="Valvic" className="clientes-patentes-resultado-logo" />
                        <h1 className="clientes-patentes-resultado-title">VALVIC</h1>
                    </div>
                    <button 
                        className="clientes-patentes-resultado-logout"
                        onClick={handleLogout}
                    >
                        Salir
                    </button>
                </div>

                {/* CONTENIDO SCROLLABLE */}
                <div className="clientes-patentes-resultado-body">
                    {/* DATOS DEL CLIENTE */}
                    <div className="clientes-patentes-resultado-patente">
                        {cliente.patente}
                    </div>

                    {/* DATOS: Fecha, Kilometraje y Aceite usado */}
                    <div className="clientes-patentes-resultado-grid">
                        <div className="clientes-patentes-resultado-campo">
                            <label>Fecha de visita</label>
                            <span>{cliente.fecha ? new Date(cliente.fecha + 'T00:00:00Z').toLocaleDateString('es-AR', { timeZone: 'UTC' }) : '—'}</span>
                        </div>
                        <div className="clientes-patentes-resultado-campo">
                            <label>Kilometraje</label>
                            <span>{cliente.kilometraje ? cliente.kilometraje.toLocaleString() + ' KM' : '—'}</span>
                        </div>
                        <div className="clientes-patentes-resultado-campo">
                            <label>Aceite </label>
                            <span>{cliente.aceite || '—'}</span>
                        </div>
                    </div>

                    {/* PRÓXIMA VISITA - Ahora antes de Servicios */}
                    {cliente.proxima_visita_km && (
                        <div className="clientes-patentes-proxima-visita">
                            <span className="proxima-visita-label">Próxima visita recomendada a los</span>
                            <span className="proxima-visita-valor">{cliente.proxima_visita_km.toLocaleString()} KM</span>
                        </div>
                    )}

                    {/* SERVICIOS REALIZADOS (SOLO CHECKS) */}
                    <div className="clientes-patentes-resultado-servicios">
                        <h3>Servicios realizados</h3>
                        <div className="clientes-patentes-resultado-servicios-grid">
                            {serviciosMostrados.map((s) => {
                                const checkKey = `check_${s.key}`;
                                const check = cliente[checkKey] || false;
                                return (
                                    <div key={s.key} className="clientes-patentes-resultado-servicio">
                                        <span className="servicio-label">{s.label}</span>
                                        <span className="servicio-check">{check ? '✅' : '❌'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* OTROS - SOLO SI HAY ALGUNO CON CHECK EN TRUE Y TEXTO NO VACÍO */}
                    {otrosConDatos.length > 0 && (
                        <div className="clientes-patentes-resultado-otros">
                            <h3>Otros</h3>
                            <div className="clientes-patentes-resultado-otros-grid">
                                {otrosConDatos.map((s) => {
                                    const texto = cliente[s.key] || '';
                                    return (
                                        <div key={s.key} className="clientes-patentes-resultado-otro">
                                            <span className="otro-label">{texto}</span>
                                            <span className="otro-check">✅</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER CON WHATSAPP E INSTAGRAM - FIJO EN LA PARTE INFERIOR */}
                <div className="clientes-patentes-resultado-footer-fijo">
                    <a 
                        href={urlWhatsapp} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="clientes-patentes-whatsapp-link"
                    >
                        <img 
                            src={logoWhatsapp} 
                            alt="WhatsApp" 
                            className="clientes-patentes-whatsapp-icon" 
                        />
                        <span>Consultá con el taller</span>
                    </a>
                    <a 
                        href={urlInstagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="clientes-patentes-instagram-link"
                    >
                        <img 
                            src={logoInstagram} 
                            alt="Instagram" 
                            className="clientes-patentes-instagram-icon" 
                        />
                        <span>Mirá nuestras ofertas</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ClientesPatentes;