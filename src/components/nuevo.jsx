import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaFolderPlus, FaTags, FaDollarSign, FaBarcode, FaSave, FaTimes, FaBox, FaList, FaFolderOpen } from 'react-icons/fa';
import { MdCategory, MdInventory } from 'react-icons/md';
import { FiPackage } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Nuevo({ onProductoCreado, onCategoriaCreada }) {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [tipoModal, setTipoModal] = useState(''); // 'categoria' o 'producto'
    
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: ''
    });

    const [nuevoProducto, setNuevoProducto] = useState({
        categoria: '',
        producto: '',
        contenido: '',
        precio: 0,
        stock: 0,
        codigo: '',
        tieneCodigo: false,
        tieneContenido: false
    });

    useEffect(() => {
        cargarCategorias();
    }, []);

    const cargarCategorias = async () => {
        try {
            const response = await axios.get(`${API_URL}/categorias`);
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const abrirModalCategoria = () => {
        setTipoModal('categoria');
        setNuevaCategoria({ nombre: '' });
        setModalAbierto(true);
    };

    const abrirModalProducto = () => {
        setTipoModal('producto');
        setNuevoProducto({
            categoria: '',
            producto: '',
            contenido: '',
            precio: 0,
            stock: 0,
            codigo: '',
            tieneCodigo: false,
            tieneContenido: false
        });
        setModalAbierto(true);
    };

    // Cerrar modal
    const cerrarModal = () => {
        setModalAbierto(false);
        setTipoModal('');
    };

    // Guardar nueva categoría
    const guardarCategoria = async (e) => {
        e.preventDefault();
        if (!nuevaCategoria.nombre.trim()) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        try {
            setCargando(true);
            await axios.post(`${API_URL}/categorias`, { nombre: nuevaCategoria.nombre });
            await cargarCategorias();
            cerrarModal();
            
            if (onCategoriaCreada) {
                onCategoriaCreada();
            }
            
            alert('Categoría creada exitosamente');
        } catch (error) {
            console.error('Error al crear categoría:', error);
            alert('Error al crear la categoría');
        } finally {
            setCargando(false);
        }
    };

    // Guardar nuevo producto
    const guardarProducto = async (e) => {
        e.preventDefault();
        
        if (!nuevoProducto.categoria) {
            alert('Debes seleccionar una categoría');
            return;
        }
        
        if (!nuevoProducto.producto.trim()) {
            alert('El nombre del producto es obligatorio');
            return;
        }

        // Preparar datos para enviar
        const datosProducto = {
            categoria: nuevoProducto.categoria,
            producto: nuevoProducto.producto,
            contenido: nuevoProducto.tieneContenido ? nuevoProducto.contenido : '',
            precio: nuevoProducto.precio || 0,
            stock: nuevoProducto.stock || 0,
            codigo: nuevoProducto.tieneCodigo ? nuevoProducto.codigo : ''
        };

        try {
            setCargando(true);
            await axios.post(`${API_URL}/productos`, datosProducto);
            cerrarModal();
            
            if (onProductoCreado) {
                onProductoCreado();
            }
            
            alert('Producto creado exitosamente');
        } catch (error) {
            console.error('Error al crear producto:', error);
            alert('Error al crear el producto');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="nuevo-valvic-container">
            <div className="nuevo-valvic-header">
                <h2 className="nuevo-valvic-title">
                    <FaPlus className="title-icon" /> Crear Nuevo
                </h2>
                <p className="nuevo-valvic-subtitle">
                    Administra tus categorías y productos
                </p>
            </div>

            <div className="nuevo-valvic-grid">
                <div className="nuevo-valvic-card">
                    <div className="nuevo-valvic-card-header">
                        <MdCategory className="card-icon" />
                        <h3>Categorías</h3>
                    </div>
                    
                    <div className="nuevo-valvic-card-body">
                        <div className="categorias-list">
                            {cargando ? (
                                <div className="loading-spinner">
                                    <span className="spinner-valvic"></span>
                                    Cargando categorías...
                                </div>
                            ) : categorias.length === 0 ? (
                                <div className="empty-state">
                                    <FaFolderOpen className="empty-icon" />
                                    <p>No hay categorías creadas</p>
                                </div>
                            ) : (
                                <ul className="categoria-items">
                                    {categorias.map((cat, index) => (
                                        <li key={index} className="categoria-item">
                                            <FaFolderOpen className="item-icon" />
                                            <span>{cat}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <button 
                            className="nuevo-valvic-btn-primary"
                            onClick={abrirModalCategoria}
                        >
                            <FaFolderPlus className="btn-icon" /> Nueva Categoría
                        </button>
                    </div>
                </div>

                <div className="nuevo-valvic-card">
                    <div className="nuevo-valvic-card-header">
                        <FaBox className="card-icon" />
                        <h3>Productos</h3>
                    </div>
                    
                    <div className="nuevo-valvic-card-body">
                        <div className="productos-info">
                            <div className="info-item">
                                <span className="info-label">Total Categorías:</span>
                                <span className="info-value">{categorias.length}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Última actualización:</span>
                                <span className="info-value">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        <button 
                            className="nuevo-valvic-btn-success"
                            onClick={abrirModalProducto}
                        >
                            <FaPlus className="btn-icon" /> Nuevo Producto
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="modal-overlay-valvic" onClick={cerrarModal}>
                    <div className="modal-content-valvic" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-valvic">
                            <div className="modal-header-icon">
                                {tipoModal === 'categoria' ? <FaFolderPlus /> : <FaPlus />}
                            </div>
                            <h2 className="modal-title-valvic">
                                {tipoModal === 'categoria' ? 'Nueva Categoría' : 'Nuevo Producto'}
                            </h2>
                            <button className="modal-close-btn" onClick={cerrarModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body-valvic">
                            {tipoModal === 'categoria' ? (
                                <form onSubmit={guardarCategoria}>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MdCategory className="label-icon" />
                                            Nombre de la Categoría *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Neumáticos, Aceites, Filtros..."
                                            value={nuevaCategoria.nombre}
                                            onChange={(e) => setNuevaCategoria({ nombre: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <div className="modal-actions-valvic">
                                        <button type="button" className="modal-btn-cancel" onClick={cerrarModal}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="modal-btn-confirm" disabled={cargando}>
                                            <FaSave className="btn-icon" /> 
                                            {cargando ? 'Guardando...' : 'Guardar Categoría'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={guardarProducto}>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MdCategory className="label-icon" />
                                            Categoría *
                                        </label>
                                        <select
                                            className="form-select"
                                            value={nuevoProducto.categoria}
                                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar categoría...</option>
                                            {categorias.map((cat, index) => (
                                                <option key={index} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        {categorias.length === 0 && (
                                            <span className="form-help-text">
                                                No hay categorías disponibles. Crea una primero.
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaTags className="label-icon" />
                                            Nombre del Producto *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Neumático 205/55R16"
                                            value={nuevoProducto.producto}
                                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, producto: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={nuevoProducto.tieneCodigo}
                                                onChange={(e) => setNuevoProducto({ 
                                                    ...nuevoProducto, 
                                                    tieneCodigo: e.target.checked,
                                                    codigo: e.target.checked ? nuevoProducto.codigo : ''
                                                })}
                                            />
                                            <FaBarcode className="label-icon" />
                                            ¿Tiene código?
                                        </label>
                                        {nuevoProducto.tieneCodigo && (
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Código del producto"
                                                value={nuevoProducto.codigo}
                                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigo: e.target.value })}
                                            />
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={nuevoProducto.tieneContenido}
                                                onChange={(e) => setNuevoProducto({ 
                                                    ...nuevoProducto, 
                                                    tieneContenido: e.target.checked,
                                                    contenido: e.target.checked ? nuevoProducto.contenido : ''
                                                })}
                                            />
                                            <FiPackage className="label-icon" />
                                            ¿Tiene contenido?
                                        </label>
                                        {nuevoProducto.tieneContenido && (
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Ej: 205/55R16, 5W30, etc."
                                                value={nuevoProducto.contenido}
                                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, contenido: e.target.value })}
                                            />
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <MdInventory className="label-icon" />
                                                Stock
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="0"
                                                value={nuevoProducto.stock || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '' || /^\d*$/.test(value)) {
                                                        setNuevoProducto({ 
                                                            ...nuevoProducto, 
                                                            stock: value === '' ? 0 : parseInt(value) || 0 
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                <FaDollarSign className="label-icon" />
                                                Precio
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="0.00"
                                                value={nuevoProducto.precio || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                        setNuevoProducto({ 
                                                            ...nuevoProducto, 
                                                            precio: value === '' ? 0 : parseFloat(value) || 0 
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="modal-actions-valvic">
                                        <button type="button" className="modal-btn-cancel" onClick={cerrarModal}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="modal-btn-confirm" disabled={cargando}>
                                            <FaSave className="btn-icon" /> 
                                            {cargando ? 'Guardando...' : 'Guardar Producto'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Nuevo;