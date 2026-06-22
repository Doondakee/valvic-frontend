import { useState, useEffect } from 'react';
import axios from 'axios';
import logoValvic from '../assets/valvic.png';

// ICONOS
import { FaSearch, FaEdit, FaTrashAlt, FaBox, FaTags, FaDollarSign, FaBarcode, FaSave, FaTimes, FaFolderOpen,
    FaFolder, FaFolderPlus, FaStore, FaList, FaClipboardCheck, FaExclamationTriangle, FaPlus, FaDatabase,
    FaCheck, FaCheckDouble, FaCar, FaInfoCircle, FaMoneyBill, FaSpinner
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
    
    // Estado para mensaje temporal
    const [mensajeTemporal, setMensajeTemporal] = useState(null);
    
    // Estado para progreso de guardado
    const [progresoGuardado, setProgresoGuardado] = useState({ mostrar: false, actual: 0, total: 0 });

    // Estado para columnas visibles
    const [columnasVisibles, setColumnasVisibles] = useState({
        mostrarCodigo: true,
        mostrarCategoria: true,
        mostrarProducto: true,
        mostrarVehiculo: true,
        mostrarDetalle: true,
        mostrarContenido: true,
        mostrarPrecioContado: true,
        mostrarPrecio: true,
        mostrarPrecioColocado: true
    });

    const [nuevoProducto, setNuevoProducto] = useState({
        categoria: '',
        producto: '',
        contenido: '',
        precio: 0,
        stock: 0,
        codigo: '',
        vehiculo: '',
        detalle: '',
        precio_contado: 0,
        precio_colocado: 0
    });

    const rol = localStorage.getItem('rol');
    const esAdmin = rol === 'administrador';

    // Stock bajo para alertas
    const productosStockBajo = productos.filter(p => (p.stock || 0) <= 0);
    const productosStockCritico = productos.filter(p => (p.stock || 0) >= 1 && (p.stock || 0) <= 3);

    const estaVacio = (valor) => {
        return valor === null || valor === undefined || valor === '';
    };

    const determinarColumnasVisibles = (productosData, esTodas) => {
        if (!productosData || productosData.length === 0) {
            return {
                mostrarCodigo: true,
                mostrarCategoria: true,
                mostrarProducto: true,
                mostrarVehiculo: true,
                mostrarDetalle: true,
                mostrarContenido: true,
                mostrarPrecioContado: true,
                mostrarPrecio: true,
                mostrarPrecioColocado: true
            };
        }

        if (esTodas) {
            return {
                mostrarCodigo: true,
                mostrarCategoria: true,
                mostrarProducto: true,
                mostrarVehiculo: true,
                mostrarDetalle: true,
                mostrarContenido: true,
                mostrarPrecioContado: true,
                mostrarPrecio: true,
                mostrarPrecioColocado: true
            };
        }

        return {
            mostrarCodigo: productosData.some(p => !estaVacio(p.codigo)),
            mostrarCategoria: true,
            mostrarProducto: true,
            mostrarVehiculo: productosData.some(p => !estaVacio(p.vehiculo)),
            mostrarDetalle: productosData.some(p => !estaVacio(p.detalle)),
            mostrarContenido: productosData.some(p => !estaVacio(p.contenido)),
            mostrarPrecioContado: productosData.some(p => !estaVacio(p.precio_contado) && p.precio_contado > 0),
            mostrarPrecio: true,
            mostrarPrecioColocado: productosData.some(p => !estaVacio(p.precio_colocado) && p.precio_colocado > 0)
        };
    };

    // Función para descontar stock directamente (sin confirmación)
    const descontarStockDirecto = async (producto) => {
        if (producto.stock <= 0) {
            setMensajeTemporal({ tipo: 'error', texto: '⚠️ No hay stock disponible' });
            setTimeout(() => setMensajeTemporal(null), 3000);
            return;
        }

        try {
            setCargando(true);
            const nuevoStock = producto.stock - 1;
            
            await axios.patch(`${API_URL}/productos/${producto.id}/stock`, {
                cantidad: -1
            });

            setProductos(prev => 
                prev.map(p => 
                    p.id === producto.id ? { ...p, stock: nuevoStock } : p
                )
            );
            setProductosFiltrados(prev => 
                prev.map(p => 
                    p.id === producto.id ? { ...p, stock: nuevoStock } : p
                )
            );

            if (modoEdicion && productosEditados[producto.id]) {
                setProductosEditados(prev => ({
                    ...prev,
                    [producto.id]: {
                        ...prev[producto.id],
                        stock: nuevoStock
                    }
                }));
            }

            setMensajeTemporal({ 
                tipo: 'success', 
                texto: `📦 Descontado 1 a "${producto.producto}"` 
            });
            setTimeout(() => setMensajeTemporal(null), 2500);

        } catch (error) {
            console.error('Error al descontar stock:', error);
            setMensajeTemporal({ tipo: 'error', texto: '❌ Error al descontar stock' });
            setTimeout(() => setMensajeTemporal(null), 3000);
        } finally {
            setCargando(false);
        }
    };

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
            
            const esTodas = categoria === 'todas';
            if (!esTodas) {
                productosData = productosData.filter(p => p.categoria === categoria);
            }
            
            setProductos(productosData);
            setProductosFiltrados(productosData);
            
            const columnas = determinarColumnasVisibles(productosData, esTodas);
            setColumnasVisibles(columnas);
            
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

    useEffect(() => {
        if (!categoriaSeleccionada || !productos.length) return;
        
        let filtrados = [...productos];
        
        if (busqueda) {
            const terminoBusqueda = busqueda.toLowerCase().trim();
            
            const contienePalabraExacta = (texto, termino) => {
                if (!texto) return false;
                const textoLower = texto.toLowerCase();
                return textoLower === termino || 
                       textoLower.startsWith(termino + ' ') || 
                       textoLower.endsWith(' ' + termino) || 
                       textoLower.includes(' ' + termino + ' ');
            };

            filtrados = filtrados.filter(p => 
                contienePalabraExacta(p.producto, terminoBusqueda) ||
                contienePalabraExacta(p.codigo, terminoBusqueda) ||
                contienePalabraExacta(p.contenido, terminoBusqueda) ||
                contienePalabraExacta(p.vehiculo, terminoBusqueda) ||
                contienePalabraExacta(p.detalle, terminoBusqueda)
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
                codigo: '',
                vehiculo: '',
                detalle: '',
                precio_contado: 0,
                precio_colocado: 0
            });
        
            await cargarCategorias();
            await cargarProductosPorCategoria(categoriaSeleccionada);
            setMensajeTemporal({ tipo: 'success', texto: '✅ Producto guardado exitosamente' });
            setTimeout(() => setMensajeTemporal(null), 3000);
        } catch (error) {
            console.error('Error al guardar:', error);
            setMensajeTemporal({ tipo: 'error', texto: '❌ Error al guardar producto' });
            setTimeout(() => setMensajeTemporal(null), 3000);
        }
    };

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

    const cancelarModoEdicion = () => {
        setModoEdicion(false);
        setProductosEditados({});
        setProgresoGuardado({ mostrar: false, actual: 0, total: 0 });
    };

    // ✅ OPTIMIZACIÓN: Guardar cambios en lote (BATCH)
    const guardarCambiosEdicion = async () => {
        const idsModificados = Object.keys(productosEditados);
        
        if (idsModificados.length === 0) {
            setMensajeTemporal({ tipo: 'error', texto: 'No hay cambios para guardar' });
            setTimeout(() => setMensajeTemporal(null), 3000);
            return;
        }

        // Mostrar progreso
        setProgresoGuardado({ mostrar: true, actual: 0, total: idsModificados.length });
        setMensajeTemporal({ 
            tipo: 'info', 
            texto: `⏳ Preparando ${idsModificados.length} productos para guardar...` 
        });

        try {
            setCargando(true);
            
            // Preparar array de productos a actualizar
            const productosAActualizar = idsModificados.map(id => ({
                id: parseInt(id),
                ...productosEditados[id]
            }));

            // Actualizar progreso
            setProgresoGuardado(prev => ({ ...prev, actual: Math.min(prev.actual + 1, prev.total) }));
            setMensajeTemporal({ 
                tipo: 'info', 
                texto: `⏳ Guardando ${idsModificados.length} productos...` 
            });

            // Enviar todos en una sola request
            const response = await axios.put(`${API_URL}/productos/batch`, {
                productos: productosAActualizar
            });

            setProgresoGuardado(prev => ({ ...prev, actual: prev.total }));

            // Recargar productos
            await cargarProductosPorCategoria(categoriaSeleccionada);
            setModoEdicion(false);
            setProductosEditados({});
            
            const mensajeExito = response.data?.message || 'Cambios guardados exitosamente';
            setMensajeTemporal({ 
                tipo: 'success', 
                texto: `✅ ${mensajeExito}` 
            });
            setTimeout(() => setMensajeTemporal(null), 4000);
            
        } catch (error) {
            console.error('Error al guardar cambios:', error);
            
            // Intentar guardar uno por uno si falla el batch
            if (idsModificados.length > 10) {
                setMensajeTemporal({ 
                    tipo: 'warning', 
                    texto: '⚠️ El lote falló, intentando guardar individualmente...' 
                });
                
                // Guardar uno por uno como fallback
                let exitos = 0;
                let errores = 0;
                
                for (let i = 0; i < idsModificados.length; i++) {
                    const id = idsModificados[i];
                    try {
                        await axios.put(`${API_URL}/productos/${id}`, productosEditados[id]);
                        exitos++;
                        setProgresoGuardado({ mostrar: true, actual: exitos, total: idsModificados.length });
                    } catch (e) {
                        errores++;
                        console.error(`Error guardando producto ${id}:`, e);
                    }
                }
                
                await cargarProductosPorCategoria(categoriaSeleccionada);
                setModoEdicion(false);
                setProductosEditados({});
                
                setMensajeTemporal({ 
                    tipo: errores === 0 ? 'success' : 'warning',
                    texto: errores === 0 
                        ? `✅ ${exitos} productos guardados exitosamente` 
                        : `⚠️ ${exitos} guardados, ${errores} con errores`
                });
                setTimeout(() => setMensajeTemporal(null), 4000);
            } else {
                setMensajeTemporal({ 
                    tipo: 'error', 
                    texto: '❌ Error al guardar los cambios' 
                });
                setTimeout(() => setMensajeTemporal(null), 5000);
            }
        } finally {
            setCargando(false);
            setTimeout(() => {
                setProgresoGuardado({ mostrar: false, actual: 0, total: 0 });
            }, 2000);
        }
    };

    const handleEditChange = (id, campo, valor) => {
        setProductosEditados(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [campo]: valor
            }
        }));
    };

    const activarModoEliminar = () => {
        if (!esAdmin) {
            setMensajeTemporal({ tipo: 'error', texto: '⛔ No tienes permisos para eliminar productos' });
            setTimeout(() => setMensajeTemporal(null), 3000);
            return;
        }
        setModoEdicion(false);
        setProductosEditados({});
        setModoEliminar(true);
        setProductosSeleccionados([]);
    };

    const cancelarModoEliminar = () => {
        setModoEliminar(false);
        setProductosSeleccionados([]);
    };

    const toggleSeleccionProducto = (id) => {
        setProductosSeleccionados(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const seleccionarTodos = () => {
        if (productosSeleccionados.length === productosFiltrados.length) {
            setProductosSeleccionados([]);
        } else {
            setProductosSeleccionados(productosFiltrados.map(p => p.id));
        }
    };

    const abrirModalConfirmacion = () => {
        if (productosSeleccionados.length === 0) {
            setMensajeTemporal({ tipo: 'error', texto: '⚠️ No has seleccionado ningún producto' });
            setTimeout(() => setMensajeTemporal(null), 3000);
            return;
        }
        setModalConfirmacionOpen(true);
    };

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
            setMensajeTemporal({ tipo: 'success', texto: `🗑️ ${productosSeleccionados.length} productos eliminados` });
            setTimeout(() => setMensajeTemporal(null), 3000);
        } catch (error) {
            console.error('Error al eliminar productos:', error);
            setMensajeTemporal({ tipo: 'error', texto: '❌ Error al eliminar productos' });
            setTimeout(() => setMensajeTemporal(null), 3000);
        } finally {
            setCargando(false);
        }
    };

    const editarProducto = (producto) => {
        setEditando(producto);
        setNuevoProducto(producto);
        setMostrarFormulario(true);
    };

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

    const getTotalColumnas = () => {
        let count = 0;
        if (columnasVisibles.mostrarCodigo) count++;
        if (columnasVisibles.mostrarCategoria) count++;
        if (columnasVisibles.mostrarProducto) count++;
        if (columnasVisibles.mostrarVehiculo) count++;
        if (columnasVisibles.mostrarDetalle) count++;
        if (columnasVisibles.mostrarContenido) count++;
        if (columnasVisibles.mostrarPrecioContado) count++;
        if (columnasVisibles.mostrarPrecio) count++;
        if (columnasVisibles.mostrarPrecioColocado) count++;
        if (modoEliminar && esAdmin) count++;
        return count;
    };

    const getStockBadgeClass = (stock) => {
        const stockValue = stock || 0;
        if (stockValue === 0) return 'badge-danger';
        if (stockValue <= 3) return 'badge-warning';
        return 'badge-success';
    };

    const getRowClass = (stock) => {
        const stockValue = stock || 0;
        if (stockValue === 0) return 'inventario-valvic-row-stock-cero';
        if (stockValue <= 3) return 'inventario-valvic-row-stock-bajo';
        return '';
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
                            <option value="">─ Seleccionar ─</option>
                            <option value="todas">📦 Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="inventario-valvic-toolbar-right">
                    <div className="inventario-valvic-search">
                        <FaSearch className="inventario-valvic-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Buscar productos..."
                            className="inventario-valvic-search-input" 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)} 
                            disabled={!categoriaSeleccionada}
                        />
                    </div>
                </div>
            </div>

            {mensajeTemporal && (
                <div className={`inventario-valvic-message ${mensajeTemporal.tipo}`}>
                    {mensajeTemporal.texto}
                </div>
            )}

            {/* Barra de progreso para guardado en lote */}
            {progresoGuardado.mostrar && (
                <div className="inventario-valvic-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${(progresoGuardado.actual / progresoGuardado.total) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        {progresoGuardado.actual} / {progresoGuardado.total} productos
                    </span>
                </div>
            )}

            {/* Alertas de stock */}
            {(productosStockBajo.length > 0 || productosStockCritico.length > 0) && (
                <div className="inventario-valvic-alerts-container">
                    {productosStockBajo.length > 0 && (
                        <div className="inventario-valvic-alert inventario-valvic-alert-danger">
                            <FaExclamationTriangle className="inventario-valvic-alert-icon" />
                            <span>Hay <strong>{productosStockBajo.length}</strong> productos con stock <strong>agotado</strong></span>
                        </div>
                    )}
                    {productosStockCritico.length > 0 && (
                        <div className="inventario-valvic-alert inventario-valvic-alert-warning">
                            <FaExclamationTriangle className="inventario-valvic-alert-icon" />
                            <span>Hay <strong>{productosStockCritico.length}</strong> productos con <strong>poco stock</strong> (1-3 unidades)</span>
                        </div>
                    )}
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
                                <input 
                                    type="text" 
                                    placeholder="Categoría *" 
                                    className="inventario-valvic-form-input"
                                    value={nuevoProducto.categoria || ''} 
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                                    required 
                                    list="categoriasList"
                                />
                                <datalist id="categoriasList">
                                    {categorias.map(cat => <option key={cat} value={cat} />)}
                                </datalist>
                            </div>
                    
                            <div className="form-input-wrapper">
                                <FaTags className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Producto" 
                                    className="inventario-valvic-form-input"
                                    value={nuevoProducto.producto || ''}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, producto: e.target.value})}
                                />
                            </div>

                            <div className="form-input-wrapper">
                                <FaCar className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Vehículo" 
                                    className="inventario-valvic-form-input"
                                    value={nuevoProducto.vehiculo || ''}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, vehiculo: e.target.value})}
                                />
                            </div>

                            <div className="form-input-wrapper">
                                <FaInfoCircle className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Detalle" 
                                    className="inventario-valvic-form-input"
                                    value={nuevoProducto.detalle || ''}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, detalle: e.target.value})}
                                />
                            </div>
                    
                            <div className="form-input-wrapper">
                                <FiPackage className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Contenido (ej: 205/55R16)"
                                    className="inventario-valvic-form-input" 
                                    value={nuevoProducto.contenido || ''}
                                    onChange={(e) => setNuevoProducto({...nuevoProducto, contenido: e.target.value})}
                                />
                            </div>

                            <div className="form-input-wrapper">
                                <FaMoneyBill className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Precio Contado"
                                    className="inventario-valvic-form-input" 
                                    value={nuevoProducto.precio_contado || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                            setNuevoProducto({
                                                ...nuevoProducto, 
                                                precio_contado: value === '' ? 0 : parseFloat(value) || 0
                                            });
                                        }
                                    }}
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
                                <FaMoneyBill className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Precio Colocado"
                                    className="inventario-valvic-form-input" 
                                    value={nuevoProducto.precio_colocado || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                            setNuevoProducto({
                                                ...nuevoProducto, 
                                                precio_colocado: value === '' ? 0 : parseFloat(value) || 0
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
                                <input 
                                    type="text" 
                                    placeholder="Código" 
                                    className="inventario-valvic-form-input"
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
                            }}>
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
                                    {esAdmin && (
                                        <button 
                                            className="inventario-valvic-btn-primary"
                                            onClick={activarModoEdicion}
                                        >
                                            <FaEdit className="btn-icon" /> Editar Productos
                                        </button>
                                    )}
                                    {esAdmin && (
                                        <button 
                                            className="inventario-valvic-btn-danger"
                                            onClick={activarModoEliminar}
                                        >
                                            <FaTrashAlt className="btn-icon" /> Eliminar Productos
                                        </button>
                                    )}
                                    {categoriaSeleccionada && categoriaSeleccionada !== 'todas' && (
                                        <div className="columnas-info">
                                            {!columnasVisibles.mostrarCodigo && (
                                                <span className="columna-oculta" title="Esta categoría no tiene productos con código">
                                                    ⚡ Sin código
                                                </span>
                                            )}
                                            {!columnasVisibles.mostrarVehiculo && (
                                                <span className="columna-oculta" title="Esta categoría no tiene productos con vehículo">
                                                    ⚡ Sin vehículo
                                                </span>
                                            )}
                                            {!columnasVisibles.mostrarDetalle && (
                                                <span className="columna-oculta" title="Esta categoría no tiene productos con detalle">
                                                    ⚡ Sin detalle
                                                </span>
                                            )}
                                            {!columnasVisibles.mostrarContenido && (
                                                <span className="columna-oculta" title="Esta categoría no tiene productos con contenido">
                                                    ⚡ Sin contenido
                                                </span>
                                            )}
                                            {!columnasVisibles.mostrarPrecioContado && (
                                                <span className="columna-oculta" title="Esta categoría no tiene productos con precio contado">
                                                    ⚡ Sin precio contado
                                                </span>
                                            )}
                                            {!columnasVisibles.mostrarPrecioColocado && (
                                                <span className="columna-oculta" title="Esta categoría no tiene productos con precio colocado">
                                                    ⚡ Sin precio colocado
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : modoEdicion ? (
                                esAdmin && (
                                    <>
                                        <button 
                                            className="inventario-valvic-btn-success"
                                            onClick={guardarCambiosEdicion}
                                            disabled={cargando}
                                        >
                                            <FaSave className="btn-icon" /> 
                                            {cargando ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                        <button 
                                            className="inventario-valvic-btn-secondary"
                                            onClick={cancelarModoEdicion}
                                            disabled={cargando}
                                        >
                                            <FaTimes className="btn-icon" /> Cancelar Edición
                                        </button>
                                        <span className="actions-info">
                                            Editando {Object.keys(productosEditados).length} productos
                                        </span>
                                    </>
                                )
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
                                    {columnasVisibles.mostrarCodigo && (
                                        <th><FaBarcode className="th-icon" /> Código</th>
                                    )}
                                    {columnasVisibles.mostrarCategoria && (
                                        <th><MdCategory className="th-icon" /> Categoría</th>
                                    )}
                                    {columnasVisibles.mostrarProducto && (
                                        <th><FaTags className="th-icon" /> Producto</th>
                                    )}
                                    {columnasVisibles.mostrarVehiculo && (
                                        <th><FaCar className="th-icon" /> Vehículo</th>
                                    )}
                                    {columnasVisibles.mostrarDetalle && (
                                        <th><FaInfoCircle className="th-icon" /> Detalle</th>
                                    )}
                                    {columnasVisibles.mostrarContenido && (
                                        <th><FiGrid className="th-icon" /> Contenido</th>
                                    )}
                                    {columnasVisibles.mostrarPrecioContado && (
                                        <th><FaMoneyBill className="th-icon" /> Precio Contado</th>
                                    )}
                                    {columnasVisibles.mostrarPrecio && (
                                        <th><FaDollarSign className="th-icon" /> Precio</th>
                                    )}
                                    {columnasVisibles.mostrarPrecioColocado && (
                                        <th><FaMoneyBill className="th-icon" /> Precio Colocado</th>
                                    )}
                                    <th><MdInventory className="th-icon" /> Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={getTotalColumnas() + 1} className="inventario-valvic-empty">
                                            <FaBox className="empty-icon" /> No hay productos en esta categoría
                                        </td>
                                    </tr>
                                ) : (
                                    productosFiltrados.map(producto => {
                                        const datosProducto = modoEdicion ? productosEditados[producto.id] : producto;
                                        
                                        return (
                                            <tr 
                                                key={producto.id} 
                                                className={`${!modoEdicion ? getRowClass(producto.stock) : ''}`}
                                            >
                                                {modoEliminar && esAdmin && (
                                                    <td>
                                                        <input 
                                                            type="checkbox"
                                                            checked={productosSeleccionados.includes(producto.id)}
                                                            onChange={() => toggleSeleccionProducto(producto.id)}
                                                        />
                                                    </td>
                                                )}
                                                {columnasVisibles.mostrarCodigo && (
                                                    <td>
                                                        {modoEdicion ? (
                                                            <input 
                                                                type="text"
                                                                className="inventario-valvic-edit-input"
                                                                value={datosProducto.codigo || ''}
                                                                onChange={(e) => handleEditChange(producto.id, 'codigo', e.target.value)}
                                                            />
                                                        ) : (
                                                            <code>{producto.codigo || '—'}</code>
                                                        )}
                                                    </td>
                                                )}
                                                {columnasVisibles.mostrarCategoria && (
                                                    <td>
                                                        {modoEdicion ? (
                                                            <select
                                                                className="inventario-valvic-edit-select"
                                                                value={datosProducto.categoria || ''}
                                                                onChange={(e) => handleEditChange(producto.id, 'categoria', e.target.value)}
                                                            >
                                                                {categorias.map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            producto.categoria || '—'
                                                        )}
                                                    </td>
                                                )}
                                                {columnasVisibles.mostrarProducto && (
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
                                                )}
                                                {columnasVisibles.mostrarVehiculo && (
                                                    <td>
                                                        {modoEdicion ? (
                                                            <input 
                                                                type="text"
                                                                className="inventario-valvic-edit-input"
                                                                value={datosProducto.vehiculo || ''}
                                                                onChange={(e) => handleEditChange(producto.id, 'vehiculo', e.target.value)}
                                                            />
                                                        ) : (
                                                            producto.vehiculo || '—'
                                                        )}
                                                    </td>
                                                )}
                                                {columnasVisibles.mostrarDetalle && (
                                                    <td>
                                                        {modoEdicion ? (
                                                            <input 
                                                                type="text"
                                                                className="inventario-valvic-edit-input"
                                                                value={datosProducto.detalle || ''}
                                                                onChange={(e) => handleEditChange(producto.id, 'detalle', e.target.value)}
                                                            />
                                                        ) : (
                                                            producto.detalle || '—'
                                                        )}
                                                    </td>
                                                )}
                                                {columnasVisibles.mostrarContenido && (
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
                                                )}
                                                {columnasVisibles.mostrarPrecioContado && (
                                                    <td>
                                                        {modoEdicion ? (
                                                            <input 
                                                                type="text"
                                                                className="inventario-valvic-edit-input"
                                                                value={datosProducto.precio_contado || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                        handleEditChange(producto.id, 'precio_contado', value === '' ? 0 : parseFloat(value) || 0);
                                                                    }
                                                                }}
                                                                placeholder="0.00"
                                                            />
                                                        ) : (
                                                            (producto.precio_contado || 0) > 0 ? '$' + (producto.precio_contado || 0).toLocaleString() : '—'
                                                        )}
                                                    </td>
                                                )}
                                                {columnasVisibles.mostrarPrecio && (
                                                    <td>
                                                        {modoEdicion ? (
                                                            <input 
                                                                type="text"
                                                                className="inventario-valvic-edit-input precio-input"
                                                                value={datosProducto.precio || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                        handleEditChange(producto.id, 'precio', value === '' ? 0 : parseFloat(value) || 0);
                                                                    }
                                                                }}
                                                                placeholder="0.00"
                                                            />
                                                        ) : (
                                                            '$' + (producto.precio || 0).toLocaleString()
                                                        )}
                                                    </td>
                                                )}
                                                {columnasVisibles.mostrarPrecioColocado && (
                                                    <td>
                                                        {modoEdicion ? (
                                                            <input 
                                                                type="text"
                                                                className="inventario-valvic-edit-input"
                                                                value={datosProducto.precio_colocado || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                        handleEditChange(producto.id, 'precio_colocado', value === '' ? 0 : parseFloat(value) || 0);
                                                                    }
                                                                }}
                                                                placeholder="0.00"
                                                            />
                                                        ) : (
                                                            (producto.precio_colocado || 0) > 0 ? '$' + (producto.precio_colocado || 0).toLocaleString() : '—'
                                                        )}
                                                    </td>
                                                )}
                                                <td>
                                                    {modoEdicion ? (
                                                        <div className="stock-editor-wrapper">
                                                            <button 
                                                                type="button"
                                                                className="stock-btn stock-btn-minus"
                                                                onClick={() => {
                                                                    const currentValue = datosProducto.stock || 0;
                                                                    const newValue = Math.max(0, currentValue - 1);
                                                                    handleEditChange(producto.id, 'stock', newValue);
                                                                }}
                                                            >
                                                                −
                                                            </button>
                                                            <input 
                                                                type="number"
                                                                className="inventario-valvic-edit-input stock-input"
                                                                value={datosProducto.stock || ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '') {
                                                                        handleEditChange(producto.id, 'stock', 0);
                                                                    } else {
                                                                        const numValue = parseInt(value);
                                                                        if (!isNaN(numValue) && numValue >= 0) {
                                                                            handleEditChange(producto.id, 'stock', numValue);
                                                                        }
                                                                    }
                                                                }}
                                                                min="0"
                                                                step="1"
                                                            />
                                                            <button 
                                                                type="button"
                                                                className="stock-btn stock-btn-plus"
                                                                onClick={() => {
                                                                    const currentValue = datosProducto.stock || 0;
                                                                    const newValue = currentValue + 1;
                                                                    handleEditChange(producto.id, 'stock', newValue);
                                                                }}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="stock-display-wrapper">
                                                            <span className={`inventario-valvic-badge ${getStockBadgeClass(producto.stock)}`}>
                                                                {producto.stock || 0}
                                                            </span>
                                                            {(producto.stock || 0) > 0 && (
                                                                <button 
                                                                    type="button"
                                                                    className="stock-btn-mini stock-btn-minus-mini"
                                                                    onClick={() => descontarStockDirecto(producto)}
                                                                    title="Descontar 1 unidad"
                                                                >
                                                                    −
                                                                </button>
                                                            )}
                                                        </div>
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

            <ModalConfirmacion 
                isOpen={modalConfirmacionOpen}
                onClose={() => setModalConfirmacionOpen(false)}
                onConfirm={eliminarProductosSeleccionados}
                productos={productosFiltrados.filter(p => productosSeleccionados.includes(p.id))}
                categoria={`${productosSeleccionados.length} productos`}
                titulo="Confirmar Eliminación"
                icono="peligro"
                botonConfirmar="Eliminar"
                botonCancelar="Cancelar"
                tipo="eliminar"
                loading={cargando}
            />
        </div>
    );
}

export default Inventario;