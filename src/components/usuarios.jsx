import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaUserPlus, FaClock, FaCheck, FaTimes, FaTrash, FaUserCheck, FaUserSlash, FaSync, FaEnvelope, FaUser } from 'react-icons/fa';
import { MdPending, MdVerified, MdPerson } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL;

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [pendientes, setPendientes] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarPendientes, setMostrarPendientes] = useState(false);
    const [nuevoUsuario, setNuevoUsuario] = useState({
        nombre_usuario: '',
        contrasena: '',
        rol: 'empleado',
        nombre: '',
        apellido: '',
        email: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            setCargando(true);
            try {
                const [usuariosRes, pendientesRes] = await Promise.all([
                    axios.get(`${API_URL}/usuarios`),
                    axios.get(`${API_URL}/usuarios/pendientes`)
                ]);
                setUsuarios(usuariosRes.data);
                setPendientes(pendientesRes.data);
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
                setMensaje({ tipo: 'error', texto: 'Error al cargar usuarios' });
            } finally {
                setCargando(false);
            }
        };
        
        cargarDatosIniciales();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await axios.get(`${API_URL}/usuarios`);
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const cargarPendientes = async () => {
        try {
            const response = await axios.get(`${API_URL}/usuarios/pendientes`);
            setPendientes(response.data);
        } catch (error) {
            console.error('Error al cargar pendientes:', error);
        }
    };

    const recargarTodos = async () => {
        setCargando(true);
        await Promise.all([cargarUsuarios(), cargarPendientes()]);
        setCargando(false);
    };

    const crearUsuario = async (e) => {
        e.preventDefault();
        setCargando(true);
        
        try {
            const response = await axios.post(`${API_URL}/usuarios`, nuevoUsuario);
            setMostrarFormulario(false);
            setNuevoUsuario({ 
                nombre_usuario: '', 
                contrasena: '', 
                rol: 'empleado',
                nombre: '',
                apellido: '',
                email: ''
            });
            setMensaje({ 
                tipo: 'success', 
                texto: `✅ Usuario "${response.data.usuario.nombre_usuario}" creado. Está pendiente de activación.` 
            });
            setTimeout(() => setMensaje(''), 4000);
            await recargarTodos();
        } catch (error) {
            console.error('Error al crear usuario:', error);
            setMensaje({ 
                tipo: 'error', 
                texto: error.response?.data?.error || 'Error al crear usuario' 
            });
            setTimeout(() => setMensaje(''), 4000);
        } finally {
            setCargando(false);
        }
    };

    const activarUsuario = async (usuario) => {
        try {
            await axios.put(`${API_URL}/usuarios/${usuario.id}`, {
                ...usuario,
                activo: true
            });
            setMensaje({ 
                tipo: 'success', 
                texto: `Usuario "${usuario.nombre_usuario}" activado exitosamente` 
            });
            setTimeout(() => setMensaje(''), 3000);
            await recargarTodos();
        } catch (error) {
            console.error('Error al activar usuario:', error);
            setMensaje({ tipo: 'error', texto: 'Error al activar usuario' });
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    const desactivarUsuario = async (usuario) => {
        if (!confirm(`¿Desactivar al usuario "${usuario.nombre_usuario}"?`)) return;
        
        try {
            await axios.put(`${API_URL}/usuarios/${usuario.id}`, {
                ...usuario,
                activo: false
            });
            setMensaje({ 
                tipo: 'info', 
                texto: `Usuario "${usuario.nombre_usuario}" desactivado` 
            });
            setTimeout(() => setMensaje(''), 3000);
            await recargarTodos();
        } catch (error) {
            console.error('Error al desactivar usuario:', error);
            setMensaje({ tipo: 'error', texto: 'Error al desactivar usuario' });
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    const eliminarUsuario = async (id, nombre) => {
        if (!confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
        
        try {
            await axios.delete(`${API_URL}/usuarios/${id}`);
            setMensaje({ 
                tipo: 'success', 
                texto: ` Usuario "${nombre}" eliminado` 
            });
            setTimeout(() => setMensaje(''), 3000);
            await recargarTodos();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            setMensaje({ tipo: 'error', texto: 'Error al eliminar usuario' });
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    const cambiarRol = async (usuario, nuevoRol) => {
        if (!confirm(`¿Cambiar rol de "${usuario.nombre_usuario}" a "${nuevoRol}"?`)) return;
        
        try {
            await axios.put(`${API_URL}/usuarios/${usuario.id}`, {
                ...usuario,
                rol: nuevoRol
            });
            setMensaje({ 
                tipo: 'success', 
                texto: `Rol de "${usuario.nombre_usuario}" cambiado a "${nuevoRol}"` 
            });
            setTimeout(() => setMensaje(''), 3000);
            await recargarTodos();
        } catch (error) {
            console.error('Error al cambiar rol:', error);
            setMensaje({ tipo: 'error', texto: 'Error al cambiar rol' });
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    return (
        <div className="usuarios-valvic-container">
            <div className="usuarios-valvic-header">
                <h2 className="usuarios-valvic-title">
                    <FaUsers className="title-icon" /> Gestión de Usuarios
                </h2>
                <p className="usuarios-valvic-subtitle">
                    Administra los usuarios del sistema y sus permisos
                </p>
            </div>

            {mensaje && (
                <div className={`usuarios-valvic-message ${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="usuarios-valvic-actions">
                <button 
                    className="usuarios-valvic-btn-primary"
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    <FaUserPlus className="btn-icon" /> 
                    {mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario'}
                </button>
                
                <button 
                    className="usuarios-valvic-btn-pendientes"
                    onClick={() => setMostrarPendientes(!mostrarPendientes)}
                >
                    <FaClock className="btn-icon" />
                    Solicitudes Pendientes
                    {pendientes.length > 0 && (
                        <span className="badge-pendientes">{pendientes.length}</span>
                    )}
                </button>

                <button 
                    className="usuarios-valvic-btn-refresh"
                    onClick={recargarTodos}
                    disabled={cargando}
                >
                    <FaSync className={`btn-icon ${cargando ? 'rotando' : ''}`} />
                    {cargando ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>

            {mostrarFormulario && (
                <div className="usuarios-valvic-form">
                    <h3 className="form-title">
                        <FaUserPlus className="form-icon" /> Crear Nuevo Usuario
                    </h3>
                    <form onSubmit={crearUsuario}>
                        <div className="usuarios-valvic-form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    <FaUser className="label-icon" /> Usuario *
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Nombre de usuario"
                                    className="form-input" 
                                    value={nuevoUsuario.nombre_usuario}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre_usuario: e.target.value})} 
                                    required
                                    minLength="3"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Contraseña *</label>
                                <input 
                                    type="password" 
                                    placeholder="Mínimo 4 caracteres"
                                    className="form-input" 
                                    value={nuevoUsuario.contrasena}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, contrasena: e.target.value})} 
                                    required
                                    minLength="4"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <MdPerson className="label-icon" /> Nombre
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Nombre del usuario"
                                    className="form-input" 
                                    value={nuevoUsuario.nombre}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} 
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Apellido</label>
                                <input 
                                    type="text" 
                                    placeholder="Apellido del usuario"
                                    className="form-input" 
                                    value={nuevoUsuario.apellido}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, apellido: e.target.value})} 
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <FaEnvelope className="label-icon" /> Email
                                </label>
                                <input 
                                    type="email" 
                                    placeholder="email@ejemplo.com"
                                    className="form-input" 
                                    value={nuevoUsuario.email}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Rol</label>
                                <select 
                                    className="form-select" 
                                    value={nuevoUsuario.rol}
                                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                                >
                                    <option value="empleado">Empleado</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={cargando}>
                                <FaUserPlus className="btn-icon" />
                                {cargando ? 'Creando...' : 'Crear Usuario'}
                            </button>
                            <button 
                                type="button" 
                                className="btn-cancel" 
                                onClick={() => setMostrarFormulario(false)}
                            >
                                <FaTimes className="btn-icon" /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {mostrarPendientes && (
                <div className="usuarios-valvic-pendientes">
                    <div className="pendientes-header">
                        <h3>
                            <FaClock className="header-icon" /> Solicitudes Pendientes
                            {pendientes.length > 0 && (
                                <span className="badge-pendientes-grande">{pendientes.length}</span>
                            )}
                        </h3>
                    </div>
                    
                    {pendientes.length === 0 ? (
                        <div className="empty-state">
                            <MdVerified className="empty-icon" />
                            <p>No hay solicitudes pendientes</p>
                            <span className="empty-hint">Todos los usuarios están activos</span>
                        </div>
                    ) : (
                        <table className="usuarios-valvic-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Nombre</th>
                                    <th>Rol</th>
                                    <th>Fecha Solicitud</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendientes.map(usuario => (
                                    <tr key={usuario.id} className="row-pendiente">
                                        <td>
                                            <div className="user-info">
                                                <MdPerson className="user-icon" />
                                                <strong>{usuario.nombre_usuario}</strong>
                                                <span className="badge-pendiente">PENDIENTE</span>
                                            </div>
                                        </td>
                                        <td>{usuario.nombre || '-'} {usuario.apellido || ''}</td>
                                        <td>
                                            <span className={`role-badge ${usuario.rol}`}>
                                                {usuario.rol}
                                            </span>
                                        </td>
                                        <td className="fecha-solicitud">
                                            {new Date(usuario.fecha_creacion).toLocaleString('es-AR')}
                                        </td>
                                        <td>
                                            <div className="acciones-botones">
                                                <button 
                                                    className="btn-activar" 
                                                    onClick={() => activarUsuario(usuario)}
                                                >
                                                    <FaCheck className="btn-icon" /> Activar
                                                </button>
                                                <button 
                                                    className="btn-eliminar" 
                                                    onClick={() => eliminarUsuario(usuario.id, usuario.nombre_usuario)}
                                                >
                                                    <FaTrash className="btn-icon" /> Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <div className="usuarios-valvic-activos">
                <div className="activos-header">
                    <h3>
                        <FaUsers className="header-icon" /> Usuarios Activos
                        <span className="badge-count">{usuarios.filter(u => u.activo).length}</span>
                    </h3>
                </div>

                <table className="usuarios-valvic-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.filter(u => u.activo).length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-row">
                                    <MdPerson className="empty-icon" />
                                    <p>No hay usuarios activos</p>
                                </td>
                            </tr>
                        ) : (
                            usuarios.filter(u => u.activo).map(usuario => (
                                <tr key={usuario.id}>
                                    <td className="id-cell">{usuario.id}</td>
                                    <td>
                                        <div className="user-info">
                                            <MdPerson className="user-icon" />
                                            <strong>{usuario.nombre_usuario}</strong>
                                        </div>
                                    </td>
                                    <td>{usuario.nombre || '-'} {usuario.apellido || ''}</td>
                                    <td>{usuario.email || '-'}</td>
                                    <td>
                                        <select 
                                            className="rol-select" 
                                            value={usuario.rol} 
                                            onChange={(e) => cambiarRol(usuario, e.target.value)}
                                        >
                                            <option value="empleado">Empleado</option>
                                            <option value="administrador">Administrador</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                                            {usuario.activo ? <FaCheck /> : <FaTimes />}
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones-botones">
                                            {usuario.nombre_usuario !== 'admin' && (
                                                <>
                                                    {usuario.activo ? (
                                                        <button 
                                                            className="btn-desactivar" 
                                                            onClick={() => desactivarUsuario(usuario)}
                                                        >
                                                            <FaUserSlash className="btn-icon" /> Desactivar
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="btn-activar" 
                                                            onClick={() => activarUsuario(usuario)}
                                                        >
                                                            <FaUserCheck className="btn-icon" /> Activar
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="btn-eliminar" 
                                                        onClick={() => eliminarUsuario(usuario.id, usuario.nombre_usuario)}
                                                    >
                                                        <FaTrash className="btn-icon" /> Eliminar
                                                    </button>
                                                </>
                                            )}
                                            {usuario.nombre_usuario === 'admin' && (
                                                <span className="admin-protected">Protegido</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Usuarios;