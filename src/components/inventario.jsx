import { useState, useEffect } from 'react';
import axios from 'axios';
import logoValvic from '../assets/valvic.png';

// ICONOS
import { FaSearch, FaEdit, FaTrashAlt, FaBox, FaTags, FaDollarSign, FaBarcode, FaSave, FaTimes, FaFolderOpen,
    FaFolder, FaFolderPlus, FaStore, FaList, FaClipboardCheck, FaExclamationTriangle, FaPlus, FaDatabase,
    FaCheck, FaCheckDouble
} from 'react-icons/fa';

import { MdCategory, MdInventory, MdProductionQuantityLimits, MdDashboard, MdOutlineCategory, MdFolder, 
    MdFolderOpen
} from 'react-icons/md';

import { FiPackage, FiGrid, FiList } from 'react-icons/fi';
import ModalConfirmacion from './modalConfirmacion';

const API_URL = import.meta.env.VITE_API_URL;

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState(null);
    const [cargando, setCargando] = useState(false);
    
    // Estados para los modos
    const [modoEdicion, setModoEdicion] = useState(false);
    const [modoEliminar, setModoEliminar] = useState(false);
    const [productosEditados, setProductosEditados] = useState({});
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);

    const [nuevoProducto, setNuevoProducto] = useState({
        categoria: '',
        producto: '',
        contenido: '',
        precio: 0,
        stock: 0,
        codigo: ''
    });

    const rol = localStorage.getItem('rol');
    const esAdmin = rol === 'administrador';

    const cargarCategorias = async () => {
        try {
            const response = await axios.get(`${API_URL}/categorias`);
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const cargarProductosPorCategoria = async (categoria) => {
        if (!categoria) return;
        
        setCargando(true);
        try {
            const response = await axios.get(`${API_URL}/productos`);
            let productosData = response.data;
            
            if (categoria && categoria !== 'todas') {
                productosData = productosData.filter(p => p.categoria === categoria);
            }
            
            setProductos(productosData);
            setProductosFiltrados(productosData);
            setModoEdicion(false);
            setModoEliminar(false);
            setProductosEditados({});
            setProductosSeleccionados([]);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleCategoriaChange = async (e) => {
        const categoria = e.target.value;
        setCategoriaSeleccionada(categoria);
        setBusqueda('');
        if (categoria) {
            await cargarProductosPorCategoria(categoria);
        } else {
            setProductos([]);
            setProductosFiltrados([]);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    // Filtrar productos por búsqueda
    useEffect(() => {
        if (!categoriaSeleccionada || !productos.length) return;
        
        let filtrados = [...productos];
        
        if (busqueda) {
            filtrados = filtrados.filter(p => 
                (p.producto && p.producto.toLowerCase().includes(busqueda.toLowerCase())) ||
                (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase())) ||
                (p.contenido && p.contenido.toLowerCase().includes(busqueda.toLowerCase()))
            );
        }
        setProductosFiltrados(filtrados);
    }, [busqueda, productos]);

    const guardarProducto = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await axios.put(`${API_URL}/productos/${editando.id}`, nuevoProducto);
            } else {
                await axios.post(`${API_URL}/productos`, nuevoProducto);
            }
            setMostrarFormulario(false);
            setEditando(null);
            setNuevoProducto({
                categoria: '',
                producto: '',
                contenido: '',
                precio: 0,
                stock: 0,
                codigo: ''
            });
        
            await cargarCategorias();
            await cargarProductosPorCategoria(categoriaSeleccionada);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar producto');
        }
    };

    // Función para activar modo edición
    const activarModoEdicion = () => {
        setModoEliminar(false);
        setProductosSeleccionados([]);
        setModoEdicion(true);
        const editados = {};
        productosFiltrados.forEach(p => {
            editados[p.id] = { ...p };
        });
        setProductosEditados(editados);
    };

    // Función para cancelar modo edición
    const cancelarModoEdicion = () => {
        setModoEdicion(false);
        setProductosEditados({});
    };

    // Función para guardar cambios en modo edición
    const guardarCambiosEdicion = async () => {
        try {
            setCargando(true);
            const idsModificados = Object.keys(productosEditados);
            
            for (const id of idsModificados) {
                const producto = productosEditados[id];
                await axios.put(`${API_URL}/productos/${id}`, producto);
            }
            
            await cargarProductosPorCategoria(categoriaSeleccionada);
            setModoEdicion(false);
            setProductosEditados({});
            alert('Cambios guardados exitosamente');
        } catch (error) {
            console.error('Error al guardar cambios:', error);
            alert('Error al guardar los cambios');
        } finally {
            setCargando(false);
        }
    };

    // Cambios en edición - Validación para números
    const handleEditChange = (id, campo, valor) => {
        setProductosEditados(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [campo]: valor
            }
        }));
    };

    // Activar modo eliminar - SOLO PARA ADMINISTRADORES
    const activarModoEliminar = () => {
        if (!esAdmin) {
            alert('No tienes permisos para eliminar productos');
            return;
        }
        setModoEdicion(false);
        setProductosEditados({});
        setModoEliminar(true);
        setProductosSeleccionados([]);
    };

    // Cancelar modo eliminar
    const cancelarModoEliminar = () => {
        setModoEliminar(false);
        setProductosSeleccionados([]);
    };

    // Seleccionar/deseleccionar producto en modo eliminar
    const toggleSeleccionProducto = (id) => {
        setProductosSeleccionados(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    // Seleccionar todos los productos en modo eliminar
    const seleccionarTodos = () => {
        if (productosSeleccionados.length === productosFiltrados.length) {
            setProductosSeleccionados([]);
        } else {
            setProductosSeleccionados(productosFiltrados.map(p => p.id));
        }
    };

    // Modal de confirmación de eliminación
    const abrirModalConfirmacion = () => {
        if (productosSeleccionados.length === 0) {
            alert('No has seleccionado ningún producto para eliminar');
            return;
        }
        setModalConfirmacionOpen(true);
    };

    // Eliminar productos seleccionados
    const eliminarProductosSeleccionados = async () => {
        try {
            setCargando(true);
            for (const id of productosSeleccionados) {
                await axios.delete(`${API_URL}/productos/${id}`);
            }
            await cargarProductosPorCategoria(categoriaSeleccionada);
            setProductosSeleccionados([]);
            setModoEliminar(false);
            setModalConfirmacionOpen(false);
            alert('Productos eliminados exitosamente');
        } catch (error) {
            console.error('Error al eliminar productos:', error);
            alert('Error al eliminar productos');
        } finally {
            setCargando(false);
        }
    };

    const editarProducto = (producto) => {
        setEditando(producto);
        setNuevoProducto(producto);
        setMostrarFormulario(true);
    };

    const productosStockBajo = productos.filter(p => (p.stock || 0) <= 0);

    // Determinar qué mostrar en el footer
    const getFooterInfo = () => {
        let info = `Total: ${productosFiltrados.length} productos`;
        if (modoEdicion) {
            info += ` | Editando: ${Object.keys(productosEditados).length} productos`;
        }
        if (modoEliminar && productosSeleccionados.length > 0) {
            info += ` | Seleccionados: ${productosSeleccionados.length} productos`;
        }
        return info;
    };

    return (
        <div className="inventario-valvic-container">
            <div className="inventario-valvic-toolbar">
                <div className="inventario-valvic-toolbar-center">
                    <div className="inventario-valvic-categoria-selector">
                        <MdCategory className="inventario-valvic-categoria-icon" />
                        <select
                            className="inventario-valvic-categoria-select"
                            value={categoriaSeleccionada}
                            onChange={handleCategoriaChange}
                        >
                            <option value="">
                                ─ Seleccionar ─
                            </option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="inventario-valvic-toolbar-right">
                    <div className="inventario-valvic-search">
                        <FaSearch className="inventario-valvic-search-icon" />
                        <input type="text" placeholder="Buscar productos..."
                            className="inventario-valvic-search-input" value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)} disabled={!categoriaSeleccionada}
                        />
                    </div>
                </div>
            </div>

            {productosStockBajo.length > 0 && (
                <div className="inventario-valvic-alert">
                    <FaExclamationTriangle className="inventario-valvic-alert-icon" />
                    Hay {productosStockBajo.length} productos con stock agotado
                </div>
            )}

            {mostrarFormulario && (
                <div className="inventario-valvic-form">
                    <h3 className="inventario-valvic-form-title">
                        {editando ? (
                            <>
                                <FaEdit className="form-icon" /> Editar Producto
                            </>
                        ) : (
                            <>
                                <FaPlus className="form-icon" /> Nuevo Producto
                            </>
                        )}
                    </h3>
                    <form onSubmit={guardarProducto}>
                        <div className="inventario-valvic-form-grid">
                            <div className="form-input-wrapper">
                                <MdCategory className="input-icon" />
                                <input type="text" placeholder="Categoría *" className="inventario-valvic-form-input"
                                    value={nuevoProducto.categoria || ''} onChange={(e) => 
                                    setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                                    required list="categoriasList"
                                />
                                <datalist id="categoriasList">
                                    {categorias.map(cat => <option key={cat} value={cat} />)}
                                </datalist>
                            </div>
                    
                            <div className="form-input-wrapper">
                                <FaTags className="input-icon" />
                                <input type="text" placeholder="Producto *" className="inventario-valvic-form-input"
                                    value={nuevoProducto.producto || ''}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, producto: e.target.value})}
                                    required
                                />
                            </div>
                    
                            <div className="form-input-wrapper">
                                <FiPackage className="input-icon" />
                                <input type="text" placeholder="Contenido (ej: 205/55R16)"
                                    className="inventario-valvic-form-input" value={nuevoProducto.contenido || ''}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, contenido: e.target.value})}
                                />
                            </div>
                    
                            <div className="form-input-wrapper">
                                <FaDollarSign className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Precio"
                                    className="inventario-valvic-form-input" 
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
                    
                            <div className="form-input-wrapper">
                                <MdInventory className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Stock"
                                    className="inventario-valvic-form-input" 
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
                            
                            <div className="form-input-wrapper">
                                <FaBarcode className="input-icon" />
                                <input type="text" placeholder="Código" className="inventario-valvic-form-input"
                                    value={nuevoProducto.codigo || ''}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, codigo: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="inventario-valvic-form-actions">
                            <button type="submit" className="inventario-valvic-btn-primary">
                                <FaSave className="btn-icon" /> Guardar
                            </button>
                            <button type="button" className="inventario-valvic-btn-secondary" onClick={() => {
                                setMostrarFormulario(false);
                                setEditando(null);
                            }}
                            >
                                <FaTimes className="btn-icon" /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!categoriaSeleccionada ? (
                <div className="inventario-valvic-hero">
                    <img src={logoValvic} alt="Valvic" className="inventario-valvic-hero-logo"/>
                    <h2 className="inventario-valvic-hero-title">
                        <FaStore className="hero-title-icon" /> Gomería Valvic
                    </h2>
                    <p className="inventario-valvic-hero-subtitle">
                        <MdFolderOpen className="hero-subtitle-icon" /> Selecciona una categoría para ver los productos
                    </p>
                </div>
            ) : (
                <div className="inventario-valvic-table-container">
                    <div className="inventario-valvic-actions-bar">
                        <div className="actions-bar-left">
                            {!modoEdicion && !modoEliminar ? (
                                <>
                                    <button 
                                        className="inventario-valvic-btn-primary"
                                        onClick={activarModoEdicion}
                                    >
                                        <FaEdit className="btn-icon" /> Editar Productos
                                    </button>
                                    {esAdmin && (
                                        <button 
                                            className="inventario-valvic-btn-danger"
                                            onClick={activarModoEliminar}
                                        >
                                            <FaTrashAlt className="btn-icon" /> Eliminar Productos
                                        </button>
                                    )}
                                </>
                            ) : modoEdicion ? (
                                <>
                                    <button 
                                        className="inventario-valvic-btn-success"
                                        onClick={guardarCambiosEdicion}
                                    >
                                        <FaSave className="btn-icon" /> Guardar Cambios
                                    </button>
                                    <button 
                                        className="inventario-valvic-btn-secondary"
                                        onClick={cancelarModoEdicion}
                                    >
                                        <FaTimes className="btn-icon" /> Cancelar Edición
                                    </button>
                                    <span className="actions-info">
                                        Editando {Object.keys(productosEditados).length} productos
                                    </span>
                                </>
                            ) : (
                                esAdmin && (
                                    <>
                                        <button 
                                            className="inventario-valvic-btn-danger"
                                            onClick={abrirModalConfirmacion}
                                        >
                                            <FaTrashAlt className="btn-icon" /> Confirmar Eliminación
                                        </button>
                                        <button 
                                            className="inventario-valvic-btn-secondary"
                                            onClick={cancelarModoEliminar}
                                        >
                                            <FaTimes className="btn-icon" /> Cancelar
                                        </button>
                                        <span className="actions-info">
                                            {productosSeleccionados.length} productos seleccionados
                                        </span>
                                    </>
                                )
                            )}
                        </div>
                        
                        <div className="actions-bar-right">
                            {modoEliminar && esAdmin && (
                                <button 
                                    className="inventario-valvic-btn-secondary"
                                    onClick={seleccionarTodos}
                                >
                                    {productosSeleccionados.length === productosFiltrados.length ? 
                                        <FaCheckDouble className="btn-icon" /> : 
                                        <FaCheck className="btn-icon" />}
                                    {productosSeleccionados.length === productosFiltrados.length ? 
                                        'Deseleccionar Todos' : 
                                        'Seleccionar Todos'}
                                </button>
                            )}
                        </div>
                    </div>

                    {cargando ? (
                        <div className="inventario-valvic-loading-products">
                            <span className="spinner-valvic"></span>
                            Cargando productos...
                        </div>
                    ) : (
                        <table className="inventario-valvic-table">
                            <thead>
                                <tr>
                                    {modoEliminar && esAdmin && (
                                        <th style={{width: '40px'}}>
                                            <input 
                                                type="checkbox"
                                                checked={productosSeleccionados.length === productosFiltrados.length && productosFiltrados.length > 0}
                                                onChange={seleccionarTodos}
                                            />
                                        </th>
                                    )}
                                    <th><FaBarcode className="th-icon" /> Código</th>
                                    <th><MdCategory className="th-icon" /> Categoría</th>
                                    <th><FaTags className="th-icon" /> Producto</th>
                                    <th><FiGrid className="th-icon" /> Contenido</th>
                                    <th><MdInventory className="th-icon" /> Stock</th>
                                    <th><FaDollarSign className="th-icon" /> Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={modoEliminar && esAdmin ? 7 : 6} className="inventario-valvic-empty">
                                            <FaBox className="empty-icon" /> No hay productos en esta categoría
                                        </td>
                                    </tr>
                                ) : (
                                    productosFiltrados.map(producto => {
                                        const datosProducto = modoEdicion ? productosEditados[producto.id] : producto;
                                        
                                        return (
                                            <tr key={producto.id} className={(producto.stock || 0) <= 0 ? 'inventario-valvic-row-stock-bajo' : ''}>
                                                {modoEliminar && esAdmin && (
                                                    <td>
                                                        <input 
                                                            type="checkbox"
                                                            checked={productosSeleccionados.includes(producto.id)}
                                                            onChange={() => toggleSeleccionProducto(producto.id)}
                                                        />
                                                    </td>
                                                )}
                                                <td><code>{producto.codigo || '—'}</code></td>
                                                <td>{producto.categoria || '—'}</td>
                                                <td>
                                                    {modoEdicion ? (
                                                        <input 
                                                            type="text"
                                                            className="inventario-valvic-edit-input"
                                                            value={datosProducto.producto || ''}
                                                            onChange={(e) => handleEditChange(producto.id, 'producto', e.target.value)}
                                                        />
                                                    ) : (
                                                        <strong>{producto.producto}</strong>
                                                    )}
                                                </td>
                                                <td>
                                                    {modoEdicion ? (
                                                        <input 
                                                            type="text"
                                                            className="inventario-valvic-edit-input"
                                                            value={datosProducto.contenido || ''}
                                                            onChange={(e) => handleEditChange(producto.id, 'contenido', e.target.value)}
                                                        />
                                                    ) : (
                                                        producto.contenido || '—'
                                                    )}
                                                </td>
                                                <td>
                                                    {modoEdicion ? (
                                                        <input 
                                                            type="text"
                                                            className="inventario-valvic-edit-input"
                                                            value={datosProducto.stock || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || /^\d*$/.test(value)) {
                                                                    handleEditChange(producto.id, 'stock', value === '' ? 0 : parseInt(value) || 0);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className={`inventario-valvic-badge ${(producto.stock || 0) <= 0 ? 'badge-danger' : 'badge-success'}`}>
                                                            {producto.stock || 0}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {modoEdicion ? (
                                                        <input 
                                                            type="text"
                                                            className="inventario-valvic-edit-input"
                                                            value={datosProducto.precio || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                    handleEditChange(producto.id, 'precio', value === '' ? 0 : parseFloat(value) || 0);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        '$' + (producto.precio || 0).toLocaleString()
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                
                    {!cargando && productosFiltrados.length > 0 && (
                        <div className="inventario-valvic-footer">
                            <FaDatabase className="footer-icon" />
                            {getFooterInfo()}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Confirmación */}
            <ModalConfirmacion 
                isOpen={modalConfirmacionOpen}
                onClose={() => setModalConfirmacionOpen(false)}
                onConfirm={eliminarProductosSeleccionados}
                productos={productosFiltrados.filter(p => productosSeleccionados.includes(p.id))}
                categoria={`${productosSeleccionados.length} productos`}
            />
        </div>
    );
}

export default Inventario;