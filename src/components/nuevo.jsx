import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaPlus, FaFolderPlus, FaTags, FaDollarSign, FaBarcode, 
    FaSave, FaTimes, FaBox, FaList, FaFolderOpen, FaEdit, FaTrashAlt
} from 'react-icons/fa';
import { MdCategory, MdInventory } from 'react-icons/md';
import { FiPackage } from 'react-icons/fi';
import ModalConfirmacion from './modalConfirmacion';

const API_URL = import.meta.env.VITE_API_URL;

function Nuevo({ onProductoCreado, onCategoriaCreada }) {
    const [categorias, setCategorias] = useState([]);
    const [categoriasCompletas, setCategoriasCompletas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [tipoModal, setTipoModal] = useState(''); 
    const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    
    // Estado para nueva categoría
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: ''
    });

    // Estado para editar categoría
    const [categoriaEditando, setCategoriaEditando] = useState(null);

    // Estado para nuevo producto
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
        cargarCategoriasCompletas();
    }, []);

    const cargarCategorias = async () => {
        try {
            const response = await axios.get(`${API_URL}/categorias`);
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const cargarCategoriasCompletas = async () => {
        try {
            const response = await axios.get(`${API_URL}/categorias/completo`);
            setCategoriasCompletas(response.data);
        } catch (error) {
            console.error('Error al cargar categorías completas:', error);
            // Si falla, usar las categorías normales
            cargarCategorias();
        }
    };

    // Abrir modal para nueva categoría
    const abrirModalCategoria = () => {
        setTipoModal('categoria');
        setNuevaCategoria({ nombre: '' });
        setCategoriaEditando(null);
        setModalAbierto(true);
    };

    // Abrir modal para editar categoría
    const abrirModalEditarCategoria = (categoria) => {
        setTipoModal('editarCategoria');
        setCategoriaEditando(categoria);
        setNuevaCategoria({ nombre: categoria.categoria });
        setModalAbierto(true);
    };

    // Abrir modal para nuevo producto
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
        setCategoriaEditando(null);
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
            await cargarCategoriasCompletas();
            cerrarModal();
            
            if (onCategoriaCreada) {
                onCategoriaCreada();
            }
            
            alert('Categoría creada exitosamente');
        } catch (error) {
            console.error('Error al crear categoría:', error);
            alert(error.response?.data?.error || 'Error al crear la categoría');
        } finally {
            setCargando(false);
        }
    };

    // Guardar edición de categoría
    const guardarEdicionCategoria = async (e) => {
        e.preventDefault();
        if (!nuevaCategoria.nombre.trim()) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        try {
            setCargando(true);
            await axios.put(`${API_URL}/categorias/${categoriaEditando.id_categoria}`, { 
                categoria: nuevaCategoria.nombre.trim() 
            });
            await cargarCategorias();
            await cargarCategoriasCompletas();
            cerrarModal();
            
            if (onCategoriaCreada) {
                onCategoriaCreada();
            }
            
            alert('Categoría actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            alert(error.response?.data?.error || 'Error al actualizar la categoría');
        } finally {
            setCargando(false);
        }
    };

    // Eliminar categoría
    const eliminarCategoria = async () => {
        if (!categoriaAEliminar) return;

        try {
            setCargando(true);
            const response = await axios.delete(`${API_URL}/categorias/${categoriaAEliminar.id_categoria}`);
            
            await cargarCategorias();
            await cargarCategoriasCompletas();
            setModalConfirmacionOpen(false);
            setCategoriaAEliminar(null);
            
            if (onCategoriaCreada) {
                onCategoriaCreada();
            }
            
            alert(response.data.message || 'Categoría eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            const mensaje = error.response?.data?.error || 'Error al eliminar la categoría';
            alert(mensaje);
            setModalConfirmacionOpen(false);
        } finally {
            setCargando(false);
        }
    };

    // Abrir modal de confirmación para eliminar
    const confirmarEliminarCategoria = (categoria) => {
        setCategoriaAEliminar(categoria);
        setModalConfirmacionOpen(true);
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
                {/* Tarjeta de Categorías */}
                <div className="nuevo-valvic-card">
                    <div className="nuevo-valvic-card-header">
                        <MdCategory className="card-icon" />
                        <h3>Categorías</h3>
                        <span className="badge-count">{categorias.length}</span>
                    </div>
                    
                    <div className="nuevo-valvic-card-body">
                        <div className="categorias-list">
                            {cargando ? (
                                <div className="loading-spinner">
                                    <span className="spinner-valvic"></span>
                                    Cargando categorías...
                                </div>
                            ) : categoriasCompletas.length === 0 ? (
                                <div className="empty-state">
                                    <FaFolderOpen className="empty-icon" />
                                    <p>No hay categorías creadas</p>
                                </div>
                            ) : (
                                <ul className="categoria-items">
                                    {categoriasCompletas.map((cat) => (
                                        <li key={cat.id_categoria} className="categoria-item">
                                            <FaFolderOpen className="item-icon" />
                                            <span className="categoria-nombre">{cat.categoria}</span>
                                            <div className="categoria-actions">
                                                <button 
                                                    className="categoria-btn-edit"
                                                    onClick={() => abrirModalEditarCategoria(cat)}
                                                    title="Editar categoría"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="categoria-btn-delete"
                                                    onClick={() => confirmarEliminarCategoria(cat)}
                                                    title="Eliminar categoría"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
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

                {/* Tarjeta de Productos */}
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
                            disabled={categorias.length === 0}
                            title={categorias.length === 0 ? 'Primero debes crear una categoría' : ''}
                        >
                            <FaPlus className="btn-icon" /> Nuevo Producto
                        </button>
                        {categorias.length === 0 && (
                            <span className="disabled-hint">⚠️ Necesitas crear una categoría primero</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="modal-overlay-valvic" onClick={cerrarModal}>
                    <div className="modal-content-valvic" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-valvic">
                            <div className="modal-header-icon">
                                {tipoModal === 'categoria' ? <FaFolderPlus /> : 
                                 tipoModal === 'editarCategoria' ? <FaEdit /> : 
                                 <FaPlus />}
                            </div>
                            <h2 className="modal-title-valvic">
                                {tipoModal === 'categoria' ? 'Nueva Categoría' : 
                                 tipoModal === 'editarCategoria' ? 'Editar Categoría' : 
                                 'Nuevo Producto'}
                            </h2>
                            <button className="modal-close-btn" onClick={cerrarModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body-valvic">
                            {(tipoModal === 'categoria' || tipoModal === 'editarCategoria') ? (
                                // Formulario de Categoría
                                <form onSubmit={tipoModal === 'categoria' ? guardarCategoria : guardarEdicionCategoria}>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MdCategory className="label-icon" />
                                            {tipoModal === 'categoria' ? 'Nombre de la Categoría *' : 'Nuevo nombre de la Categoría *'}
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
                                            {cargando ? 'Guardando...' : tipoModal === 'categoria' ? 'Guardar Categoría' : 'Actualizar Categoría'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // Formulario de Producto
                                <form onSubmit={guardarProducto}>
                                    {/* ... resto del formulario de producto (sin cambios) ... */}
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

            {/* Modal de Confirmación para Eliminar Categoría */}
            <ModalConfirmacion 
                isOpen={modalConfirmacionOpen}
                onClose={() => {
                    setModalConfirmacionOpen(false);
                    setCategoriaAEliminar(null);
                }}
                onConfirm={eliminarCategoria}
                productos={[]}
                categoria={categoriaAEliminar ? `"${categoriaAEliminar.categoria}"` : ''}
            />
        </div>
    );
}

export default Nuevo;