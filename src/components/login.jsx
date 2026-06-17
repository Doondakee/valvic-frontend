import { useState } from 'react';
import axios from 'axios';
import logoValvic from '../assets/valvic.png';
import SolicitarRegistro from './solicitarRegistro';

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mostrarRegistro, setMostrarRegistro] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
    
        try {
            const response = await axios.post(`${API_URL}/login`, {
                usuario,
                contrasena
            });
        
            if (response.data.success) {
                console.log('Rol recibido:', response.data.usuario.rol); 
                localStorage.setItem('usuario', response.data.usuario.nombre);
                localStorage.setItem('rol', response.data.usuario.rol); 
                onLogin(true);
            }

        } catch (error) {
            setError(error.response?.data?.error || 'Error al iniciar sesión');
            setContrasena('');
        } finally {
            setCargando(false);
        }
    };
    
    if (mostrarRegistro) {
        return <SolicitarRegistro onVolver={() => setMostrarRegistro(false)} />;
    }

    return (
        <div className="login-container-valvic">
            <div className="login-card-valvic">
                <div className="login-header-valvic">
                    <img src={logoValvic} alt="Valvic Logo" className="login-logo-valvic"/>
                    <h1 className="login-title-valvic">Gomería Valvic</h1>
                    <p className="login-subtitle-valvic">Sistema de Control de Inventario</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="login-form-valvic">
                    <div className="input-group-valvic">
                        <label className="input-label-valvic">Usuario</label>
                        <div className="input-wrapper-valvic">
                            <input
                                type="text" placeholder="Ingresa tu usuario" className="input-field-valvic"
                                value={usuario} onChange={(e) => setUsuario(e.target.value)}
                                required disabled={cargando}
                            />
                        </div>
                    </div>
            
                    <div className="input-group-valvic">
                        <label className="input-label-valvic">Contraseña</label>
                        <div className="input-wrapper-valvic">
                            <input
                                type="password" placeholder="Ingresa tu contraseña" className="input-field-valvic"
                                value={contrasena} onChange={(e) => setContrasena(e.target.value)} required
                                disabled={cargando}
                            />
                        </div>
                    </div>
            
                    {error && (
                        <div className="error-message-valvic">
                            <span>⚠️</span> {error}
                        </div>
                    )}
            
                    <button type="submit" className="login-button-valvic" disabled={cargando}>
                        {cargando ? (
                            <>
                                <span className="spinner-valvic"></span>
                                Ingresando...
                            </>
                        ) : (
                            '🔑 Ingresar al Sistema'
                        )}
                    </button>
                </form>

                <div className="login-divider-valvic">
                    <span className="login-divider-text">o</span>
                </div>

                <button className="registro-button-login-valvic" onClick={() => setMostrarRegistro(true)} disabled={cargando}>
                    Registrarse
                </button>

                <div className="login-footer-valvic">
                    <p className="login-footer-text">
                        Solo personal de Valvic
                    </p>
                    <p className="login-footer-version">
                        v1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;