import { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaCheck, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

function SolicitarRegistro({ onVolver }) {
    const [formData, setFormData] = useState({
        nombre_usuario: '',
        contrasena: '',
        confirmarContrasena: '',
        nombre: '',
        apellido: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        const { nombre_usuario, contrasena, confirmarContrasena, nombre, apellido, email } = formData;

        // Validaciones
        if (nombre_usuario.length < 3) {
            setError('El usuario debe tener al menos 3 caracteres');
            return;
        }

        if (contrasena.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        if (contrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (email && !email.includes('@')) {
            setError('El email no es válido');
            return;
        }

        setCargando(true);

        try {
            const response = await axios.post(`${API_URL}/usuarios`, {
                nombre_usuario,
                contrasena,
                rol: 'empleado',
                nombre: nombre || '',
                apellido: apellido || '',
                email: email || ''
            });

            if (response.data.success) {
                setExito('¡Registro exitoso! Espera la aprobación de un administrador.');
                setFormData({
                    nombre_usuario: '',
                    contrasena: '',
                    confirmarContrasena: '',
                    nombre: '',
                    apellido: '',
                    email: ''
                });
                setTimeout(() => { onVolver(); }, 5000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al registrarse');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="registro-container-valvic">
            <div className="registro-card-valvic">
                <button className="btn-volver-valvic" onClick={onVolver}>
                    <FaArrowLeft className="btn-icon" /> Volver al Login
                </button>

                <div className="registro-header-valvic">
                    <div className="registro-logo-container">
                        <div className="registro-logo-icon">📝</div>
                    </div>
                    <h2 className="registro-title-valvic">Crear Cuenta</h2>
                    <p className="registro-subtitle-valvic">
                        Completa el formulario para solicitar acceso al sistema
                    </p>
                    <div className="registro-info-box">
                        <p>
                            <FaCheck className="info-icon" /> Tu cuenta estará pendiente hasta que un administrador la active
                        </p>
                        <p style={{ fontSize: '12px', marginTop: '4px', color: '#888' }}>
                            Todos los usuarios se registran como <strong style={{ color: '#FFD700' }}>Empleado</strong>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="registro-form-valvic">
                    <div className="registro-form-grid">
                        <div className="input-group-valvic">
                            <label className="input-label-valvic">
                                <FaUser className="label-icon" /> Usuario *
                            </label>
                            <div className="input-wrapper-valvic">
                                <span className="input-icon-valvic">👤</span>
                                <input
                                    type="text"
                                    name="nombre_usuario"
                                    placeholder="Nombre de usuario (mínimo 3 caracteres)"
                                    className="input-field-valvic"
                                    value={formData.nombre_usuario}
                                    onChange={handleChange}
                                    required
                                    disabled={cargando}
                                    minLength="3"
                                />
                            </div>
                        </div>

                        <div className="input-group-valvic">
                            <label className="input-label-valvic">
                                <FaLock className="label-icon" /> Contraseña *
                            </label>
                            <div className="input-wrapper-valvic">
                                <input
                                    type="password"
                                    name="contrasena"
                                    placeholder="Mínimo 4 caracteres"
                                    className="input-field-valvic"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    required
                                    disabled={cargando}
                                    minLength="4"
                                />
                            </div>
                        </div>

                        <div className="input-group-valvic">
                            <label className="input-label-valvic">
                                <FaCheck className="label-icon" /> Confirmar Contraseña *
                            </label>
                            <div className="input-wrapper-valvic">
                                <input
                                    type="password"
                                    name="confirmarContrasena"
                                    placeholder="Repite tu contraseña"
                                    className="input-field-valvic"
                                    value={formData.confirmarContrasena}
                                    onChange={handleChange}
                                    required
                                    disabled={cargando}
                                />
                            </div>
                        </div>

                        <div className="input-group-valvic">
                            <label className="input-label-valvic">
                                <FaUser className="label-icon" /> Nombre
                            </label>
                            <div className="input-wrapper-valvic">
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Tu nombre"
                                    className="input-field-valvic"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </div>
                        </div>

                        <div className="input-group-valvic">
                            <label className="input-label-valvic">Apellido</label>
                            <div className="input-wrapper-valvic">
                                <input
                                    type="text"
                                    name="apellido"
                                    placeholder="Tu apellido"
                                    className="input-field-valvic"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </div>
                        </div>

                        <div className="input-group-valvic">
                            <label className="input-label-valvic">
                                <FaEnvelope className="label-icon" /> Email
                            </label>
                            <div className="input-wrapper-valvic">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="email@ejemplo.com"
                                    className="input-field-valvic"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message-valvic">
                            {error}
                        </div>
                    )}

                    {exito && (
                        <div className="exito-message-valvic">
                            {exito}
                        </div>
                    )}

                    <button type="submit" className="registro-button-valvic" disabled={cargando}>
                        {cargando ? (
                            <>
                                <FaSpinner className="spinner-icon spinning" />
                                Registrando...
                            </>
                        ) : (
                            'Solicitar Registro'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SolicitarRegistro;