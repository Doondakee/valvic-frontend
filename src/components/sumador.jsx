// Sumador.jsx - Con botones Aumentar y Restar
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPercent, FaSave, FaTags, FaDollarSign, FaList, FaSearch, FaExclamationTriangle, FaEdit, FaPlus, FaMinus } from 'react-icons/fa';
import { MdCategory, MdInventory } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL;

function Sumador() {
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [porcentaje, setPorcentaje] = useState(10);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [productosModificados, setProductosModificados] = useState([]);
    const [mostrarPreciosNuevos, setMostrarPreciosNuevos] = useState(false);
    const [tipoOperacion, setTipoOperacion] = useState('aumentar'); // 'aumentar' o 'restar'

    // Cargar categorías al montar el componente
    useEffect(() => {
        cargarCategorias();
    }, []);

    const cargarCategorias = async () => {
        try {
            const response = await axios.get(`${API_URL}/categorias`);
            setCategorias(response.data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            setMensaje({ tipo: 'error', texto: 'Error al cargar categorías' });
        }
    };

    const cargarProductos = async (categoria) => {
        if (!categoria) return;
        
        setCargando(true);
        setProductosModificados([]);
        setMostrarPreciosNuevos(false);
        
        try {
            const response = await axios.get(`${API_URL}/productos`);
            const productosFiltrados = response.data.filter(p => p.categoria === categoria);
            
            // Ordenar por nombre
            productosFiltrados.sort((a, b) => a.producto.localeCompare(b.producto));
            
            setProductos(productosFiltrados);
            setProductosFiltrados(productosFiltrados);
            
            if (productosFiltrados.length === 0) {
                setMensaje({ tipo: 'info', texto: 'No hay productos en esta categoría' });
            } else {
                setMensaje({ tipo: 'success', texto: `${productosFiltrados.length} productos encontrados` });
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setMensaje({ tipo: 'error', texto: 'Error al cargar productos' });
        } finally {
            setCargando(false);
        }
    };

    const handleCategoriaChange = async (e) => {
        const categoria = e.target.value;
        setCategoriaSeleccionada(categoria);
        setProductosFiltrados([]);
        setProductosModificados([]);
        setMostrarPreciosNuevos(false);
        setTipoOperacion('aumentar');
        
        if (categoria) {
            await cargarProductos(categoria);
        }
    };

    const calcularPrecioConCambio = (precio, porcentaje, tipo) => {
        if (tipo === 'aumentar') {
            return precio * (1 + (porcentaje / 100));
        } else {
            return precio * (1 - (porcentaje / 100));
        }
    };

    const aplicarCambio = (tipo) => {
        if (!categoriaSeleccionada) {
            setMensaje({ tipo: 'error', texto: 'Primero selecciona una categoría' });
            return;
        }

        if (productosFiltrados.length === 0) {
            setMensaje({ tipo: 'error', texto: 'No hay productos en esta categoría' });
            return;
        }

        if (porcentaje <= 0) {
            setMensaje({ tipo: 'error', texto: 'El porcentaje debe ser mayor a 0' });
            return;
        }

        setTipoOperacion(tipo);
        const textoOperacion = tipo === 'aumentar' ? 'aumento' : 'descuento';
        const signo = tipo === 'aumentar' ? '+' : '-';

        // Calcular nuevos precios
        const modificados = productosFiltrados.map(producto => ({
            ...producto,
            precio_original: producto.precio,
            precio_nuevo: Math.round(calcularPrecioConCambio(producto.precio, porcentaje, tipo))
        }));

        setProductosModificados(modificados);
        setMostrarPreciosNuevos(true);
        setMensaje({ 
            tipo: 'success', 
            texto: `Se aplicará un ${signo}${porcentaje}% de ${textoOperacion} a ${modificados.length} productos. Puedes editar los precios nuevos antes de guardar.` 
        });
    };

    const guardarCambios = async () => {
        if (productosModificados.length === 0) {
            setMensaje({ tipo: 'error', texto: 'No hay cambios para guardar' });
            return;
        }

        // Verificar que todos los precios nuevos sean válidos
        const preciosInvalidos = productosModificados.filter(p => p.precio_nuevo <= 0);
        if (preciosInvalidos.length > 0) {
            setMensaje({ 
                tipo: 'error', 
                texto: `Hay ${preciosInvalidos.length} productos con precio inválido. Verifica que todos los precios sean mayores a 0.` 
            });
            return;
        }

        const textoOperacion = tipoOperacion === 'aumentar' ? 'aumentar' : 'descontar';
        if (!confirm(`¿Estás seguro de ${textoOperacion} los precios de ${productosModificados.length} productos?`)) {
            return;
        }

        setGuardando(true);
        setMensaje({ tipo: 'info', texto: 'Guardando cambios...' });

        try {
            let actualizados = 0;
            let errores = 0;

            for (const producto of productosModificados) {
                try {
                    await axios.put(`${API_URL}/productos/${producto.id}`, {
                        ...producto,
                        precio: producto.precio_nuevo
                    });
                    actualizados++;
                } catch (error) {
                    console.error(`Error al actualizar producto ${producto.id}:`, error);
                    errores++;
                }
            }

            if (errores === 0) {
                setMensaje({ 
                    tipo: 'success', 
                    texto: `✅ ${actualizados} productos actualizados exitosamente` 
                });
            } else {
                setMensaje({ 
                    tipo: 'warning', 
                    texto: `⚠️ ${actualizados} actualizados, ${errores} errores` 
                });
            }

            // Recargar productos para ver los cambios
            await cargarProductos(categoriaSeleccionada);
            setProductosModificados([]);
            setMostrarPreciosNuevos(false);
            setPorcentaje(10);

        } catch (error) {
            console.error('Error al guardar cambios:', error);
            setMensaje({ tipo: 'error', texto: 'Error al guardar los cambios' });
        } finally {
            setGuardando(false);
        }
    };

    const cancelarCambios = () => {
        setProductosModificados([]);
        setMostrarPreciosNuevos(false);
        setMensaje({ tipo: 'info', texto: 'Cambios cancelados' });
    };

    // Redondear a la centena más cercana
    const redondearACentena = (numero) => {
        return Math.round(numero / 100) * 100;
    };

    // Redondear todos los precios nuevos a la centena
    const redondearTodosACentena = () => {
        setProductosModificados(prev => 
            prev.map(p => ({
                ...p,
                precio_nuevo: redondearACentena(p.precio_nuevo)
            }))
        );
        setMensaje({ tipo: 'info', texto: 'Todos los precios redondeados a la centena más cercana' });
    };

    return (
        <div className="sumador-valvic-container">
            <div className="sumador-valvic-header">
                <h2 className="sumador-valvic-title">
                    <FaPercent className="title-icon" /> Sumador de Porcentajes
                </h2>
                <p className="sumador-valvic-subtitle">
                    Aumenta o descuenta los precios de todos los productos de una categoría
                </p>
            </div>

            {/* Barra de herramientas */}
            <div className="sumador-valvic-toolbar">
                <div className="sumador-valvic-toolbar-left">
                    <div className="sumador-valvic-selector">
                        <MdCategory className="selector-icon" />
                        <select
                            className="sumador-valvic-select"
                            value={categoriaSeleccionada}
                            onChange={handleCategoriaChange}
                        >
                            <option value="">Seleccionar categoría...</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sumador-valvic-porcentaje">
                        <FaPercent className="porcentaje-icon" />
                        <input
                            type="text"
                            className="sumador-valvic-input"
                            value={porcentaje || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                    setPorcentaje(value === '' ? 0 : parseFloat(value) || 0);
                                }
                            }}
                            placeholder="%"
                        />
                        <span className="porcentaje-label">%</span>
                    </div>

                    <button
                        className="sumador-valvic-btn-aumentar"
                        onClick={() => aplicarCambio('aumentar')}
                        disabled={!categoriaSeleccionada || productosFiltrados.length === 0 || cargando}
                    >
                        <FaPlus className="btn-icon" /> Aumentar
                    </button>

                    <button
                        className="sumador-valvic-btn-restar"
                        onClick={() => aplicarCambio('restar')}
                        disabled={!categoriaSeleccionada || productosFiltrados.length === 0 || cargando}
                    >
                        <FaMinus className="btn-icon" /> Restar
                    </button>

                    {mostrarPreciosNuevos && (
                        <button
                            className="sumador-valvic-btn-secondary"
                            onClick={redondearTodosACentena}
                            title="Redondear todos los precios a la centena más cercana"
                        >
                            Redondear a Centena
                        </button>
                    )}
                </div>

                <div className="sumador-valvic-toolbar-right">
                    {mostrarPreciosNuevos && (
                        <>
                            <button
                                className="sumador-valvic-btn-success"
                                onClick={guardarCambios}
                                disabled={guardando}
                            >
                                <FaSave className="btn-icon" /> 
                                {guardando ? 'Guardando...' : `Guardar (${productosModificados.length})`}
                            </button>
                            <button
                                className="sumador-valvic-btn-secondary"
                                onClick={cancelarCambios}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mensaje de estado */}
            {mensaje && (
                <div className={`sumador-valvic-message ${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            {/* Tabla de productos */}
            {categoriaSeleccionada && (
                <div className="sumador-valvic-table-container">
                    <div className="sumador-valvic-table-header">
                        <div className="table-info">
                            <FaList className="info-icon" />
                            <span>Productos en <strong>{categoriaSeleccionada}</strong></span>
                            <span className="badge-count">{productosFiltrados.length}</span>
                        </div>
                        {mostrarPreciosNuevos && (
                            <div className="table-actions">
                                <span className={`porcentaje-aplicado ${tipoOperacion === 'aumentar' ? 'aumento' : 'descuento'}`}>
                                    {tipoOperacion === 'aumentar' ? '+' : '-'}{porcentaje}%
                                </span>
                                <span className="precios-editables">
                                    <FaEdit className="edit-icon" /> Precios editables
                                </span>
                            </div>
                        )}
                    </div>

                    {cargando ? (
                        <div className="sumador-valvic-loading">
                            <span className="spinner-valvic"></span>
                            Cargando productos...
                        </div>
                    ) : productosFiltrados.length === 0 ? (
                        <div className="sumador-valvic-empty">
                            <FaSearch className="empty-icon" />
                            <p>No hay productos en esta categoría</p>
                        </div>
                    ) : (
                        <table className="sumador-valvic-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Código</th>
                                    <th>Precio Actual</th>
                                    {mostrarPreciosNuevos && (
                                        <>
                                            <th>Precio Nuevo</th>
                                            <th>Cambio</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados.map(producto => {
                                    const modificado = productosModificados.find(p => p.id === producto.id);
                                    const precioNuevo = modificado ? modificado.precio_nuevo : null;
                                    const cambio = modificado ? (modificado.precio_nuevo - producto.precio) : 0;

                                    return (
                                        <tr key={producto.id} className={modificado ? 'sumador-valvic-row-modificado' : ''}>
                                            <td><strong>{producto.producto}</strong></td>
                                            <td><code>{producto.codigo || '—'}</code></td>
                                            <td className="precio-actual">
                                                ${(producto.precio || 0).toLocaleString('es-AR')}
                                            </td>
                                            {mostrarPreciosNuevos && modificado ? (
                                                <>
                                                    <td className="precio-nuevo">
                                                        <input
                                                            type="text"
                                                            className="sumador-valvic-precio-input"
                                                            value={modificado.precio_nuevo || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                    const nuevoPrecio = value === '' ? 0 : parseFloat(value) || 0;
                                                                    actualizarPrecioNuevo(producto.id, nuevoPrecio);
                                                                }
                                                            }}
                                                            onFocus={(e) => e.target.select()}
                                                        />
                                                    </td>
                                                    <td className="cambio">
                                                        {cambio !== 0 && (
                                                            <span className={cambio > 0 ? 'cambio-positivo' : 'cambio-negativo'}>
                                                                {cambio > 0 ? '▲' : '▼'} ${Math.abs(cambio).toLocaleString('es-AR')}
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            ) : mostrarPreciosNuevos ? (
                                                <>
                                                    <td className="precio-nuevo">—</td>
                                                    <td className="cambio">—</td>
                                                </>
                                            ) : null}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default Sumador;