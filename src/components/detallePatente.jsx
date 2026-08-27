import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/detallePatente.css';

const API_URL = import.meta.env.VITE_API_URL;

function DetallePatente({ patente, onVolver, onEliminar, onActualizar }) {
    const navigate = useNavigate();
    const [modoEdicion, setModoEdicion] = useState(false);
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState(0);
    const [formData, setFormData] = useState({
        patente: patente.patente,
        modelo_auto: patente.modelo_auto || '',
        fecha: patente.fecha || '',
        kilometraje: patente.kilometraje || '',
        atendidox: patente.atendidox || '',
        total_litros_aceite: patente.total_litros_aceite || '',
        proxima_visita_km: patente.proxima_visita_km || '',
        aceite: patente.aceite || '',
        precio_aceite: patente.precio_aceite || '',
        check_aceite: patente.check_aceite || false,
        filtro_aceite: patente.filtro_aceite || '',
        precio_filtro_aceite: patente.precio_filtro_aceite || '',
        check_filtro_aceite: patente.check_filtro_aceite || false,
        filtro_aire: patente.filtro_aire || '',
        precio_filtro_aire: patente.precio_filtro_aire || '',
        check_filtro_aire: patente.check_filtro_aire || false,
        filtro_nafta: patente.filtro_nafta || '',
        precio_filtro_nafta: patente.precio_filtro_nafta || '',
        check_filtro_nafta: patente.check_filtro_nafta || false,
        ultimo_cambio_filtro_nafta: patente.ultimo_cambio_filtro_nafta || '',
        filtro_gasoil: patente.filtro_gasoil || '',
        precio_filtro_gasoil: patente.precio_filtro_gasoil || '',
        check_filtro_gasoil: patente.check_filtro_gasoil || false,
        ultimo_cambio_filtro_gasoil: patente.ultimo_cambio_filtro_gasoil || '',
        filtro_habitaculo: patente.filtro_habitaculo || '',
        precio_filtro_habitaculo: patente.precio_filtro_habitaculo || '',
        check_filtro_habitaculo: patente.check_filtro_habitaculo || false,
        fecha_cambio_filtro_habitaculo: patente.fecha_cambio_filtro_habitaculo || '',
        diferencial: patente.diferencial || '',
        precio_diferencial: patente.precio_diferencial || '',
        check_diferencial: patente.check_diferencial || false,
        caja: patente.caja || '',
        precio_caja: patente.precio_caja || '',
        check_caja: patente.check_caja || false,
        total: patente.total || '',
        otros1: patente.otros1 || '',
        otros1_precio: patente.otros1_precio || '',
        otros1_check: patente.otros1_check || false,
        otros2: patente.otros2 || '',
        otros2_precio: patente.otros2_precio || '',
        otros2_check: patente.otros2_check || false,
        otros3: patente.otros3 || '',
        otros3_precio: patente.otros3_precio || '',
        otros3_check: patente.otros3_check || false,
        observaciones: patente.observaciones || ''
    });

    // ==========================================
    // Formatear precio con separador de miles
    // ==========================================
    const formatearPrecio = (valor) => {
        if (!valor && valor !== 0) return '—';
        const numero = parseFloat(valor);
        if (isNaN(numero)) return '—';
        return numero.toLocaleString('es-AR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // ==========================================
    // Manejar cambios en el formulario
    // ==========================================
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ==========================================
    // Manejar cambio en radio button (SI/NO)
    // ==========================================
    const handleRadioChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // ==========================================
    // Calcular total de precios
    // ==========================================
    const calcularTotal = () => {
        const precios = [
            formData.precio_aceite,
            formData.precio_filtro_aceite,
            formData.precio_filtro_aire,
            formData.precio_filtro_nafta,
            formData.precio_filtro_gasoil,
            formData.precio_filtro_habitaculo,
            formData.precio_diferencial,
            formData.precio_caja,
            formData.otros1_precio,
            formData.otros2_precio,
            formData.otros3_precio
        ];

        const total = precios.reduce((sum, precio) => {
            const num = parseFloat(precio);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);

        return Math.round(total);
    };

    // ==========================================
    // Recargar datos del cliente desde la BD
    // ==========================================
    const recargarCliente = async () => {
        try {
            const response = await axios.get(`${API_URL}/clientes/${patente.patente}`);
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                setFormData({
                    patente: data.patente,
                    modelo_auto: data.modelo_auto || '',
                    fecha: data.fecha || '',
                    kilometraje: data.kilometraje || '',
                    atendidox: data.atendidox || '',
                    total_litros_aceite: data.total_litros_aceite || '',
                    proxima_visita_km: data.proxima_visita_km || '',
                    aceite: data.aceite || '',
                    precio_aceite: data.precio_aceite || '',
                    check_aceite: data.check_aceite || false,
                    filtro_aceite: data.filtro_aceite || '',
                    precio_filtro_aceite: data.precio_filtro_aceite || '',
                    check_filtro_aceite: data.check_filtro_aceite || false,
                    filtro_aire: data.filtro_aire || '',
                    precio_filtro_aire: data.precio_filtro_aire || '',
                    check_filtro_aire: data.check_filtro_aire || false,
                    filtro_nafta: data.filtro_nafta || '',
                    precio_filtro_nafta: data.precio_filtro_nafta || '',
                    check_filtro_nafta: data.check_filtro_nafta || false,
                    ultimo_cambio_filtro_nafta: data.ultimo_cambio_filtro_nafta || '',
                    filtro_gasoil: data.filtro_gasoil || '',
                    precio_filtro_gasoil: data.precio_filtro_gasoil || '',
                    check_filtro_gasoil: data.check_filtro_gasoil || false,
                    ultimo_cambio_filtro_gasoil: data.ultimo_cambio_filtro_gasoil || '',
                    filtro_habitaculo: data.filtro_habitaculo || '',
                    precio_filtro_habitaculo: data.precio_filtro_habitaculo || '',
                    check_filtro_habitaculo: data.check_filtro_habitaculo || false,
                    fecha_cambio_filtro_habitaculo: data.fecha_cambio_filtro_habitaculo || '',
                    diferencial: data.diferencial || '',
                    precio_diferencial: data.precio_diferencial || '',
                    check_diferencial: data.check_diferencial || false,
                    caja: data.caja || '',
                    precio_caja: data.precio_caja || '',
                    check_caja: data.check_caja || false,
                    total: data.total || '',
                    otros1: data.otros1 || '',
                    otros1_precio: data.otros1_precio || '',
                    otros1_check: data.otros1_check || false,
                    otros2: data.otros2 || '',
                    otros2_precio: data.otros2_precio || '',
                    otros2_check: data.otros2_check || false,
                    otros3: data.otros3 || '',
                    otros3_precio: data.otros3_precio || '',
                    otros3_check: data.otros3_check || false,
                    observaciones: data.observaciones || ''
                });
                setVersion(prev => prev + 1);
            }
        } catch (err) {
            console.error('Error al recargar cliente:', err);
        }
    };

    // ==========================================
    // Guardar cambios
    // ==========================================
    const handleGuardar = async () => {
        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                total: calcularTotal()
            };

            console.log('📦 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

            const response = await axios.put(
                `${API_URL}/clientes/${patente.patente}`,
                dataToSend
            );

            console.log('📥 Respuesta del backend:', response.data);

            if (response.data.success) {
                navigate(`/patentes/${patente.patente}`, { replace: true });
                const data = response.data.data;
                console.log('✅ Datos devueltos por el backend:', data);

                setFormData({
                    patente: data.patente,
                    modelo_auto: data.modelo_auto || '',
                    fecha: data.fecha || '',
                    kilometraje: data.kilometraje || '',
                    atendidox: data.atendidox || '',
                    total_litros_aceite: data.total_litros_aceite || '',
                    proxima_visita_km: data.proxima_visita_km || '',
                    aceite: data.aceite || '',
                    precio_aceite: data.precio_aceite || '',
                    check_aceite: data.check_aceite || false,
                    filtro_aceite: data.filtro_aceite || '',
                    precio_filtro_aceite: data.precio_filtro_aceite || '',
                    check_filtro_aceite: data.check_filtro_aceite || false,
                    filtro_aire: data.filtro_aire || '',
                    precio_filtro_aire: data.precio_filtro_aire || '',
                    check_filtro_aire: data.check_filtro_aire || false,
                    filtro_nafta: data.filtro_nafta || '',
                    precio_filtro_nafta: data.precio_filtro_nafta || '',
                    check_filtro_nafta: data.check_filtro_nafta || false,
                    ultimo_cambio_filtro_nafta: data.ultimo_cambio_filtro_nafta || '',
                    filtro_gasoil: data.filtro_gasoil || '',
                    precio_filtro_gasoil: data.precio_filtro_gasoil || '',
                    check_filtro_gasoil: data.check_filtro_gasoil || false,
                    ultimo_cambio_filtro_gasoil: data.ultimo_cambio_filtro_gasoil || '',
                    filtro_habitaculo: data.filtro_habitaculo || '',
                    precio_filtro_habitaculo: data.precio_filtro_habitaculo || '',
                    check_filtro_habitaculo: data.check_filtro_habitaculo || false,
                    fecha_cambio_filtro_habitaculo: data.fecha_cambio_filtro_habitaculo || '',
                    diferencial: data.diferencial || '',
                    precio_diferencial: data.precio_diferencial || '',
                    check_diferencial: data.check_diferencial || false,
                    caja: data.caja || '',
                    precio_caja: data.precio_caja || '',
                    check_caja: data.check_caja || false,
                    total: data.total || '',
                    otros1: data.otros1 || '',
                    otros1_precio: data.otros1_precio || '',
                    otros1_check: data.otros1_check || false,
                    otros2: data.otros2 || '',
                    otros2_precio: data.otros2_precio || '',
                    otros2_check: data.otros2_check || false,
                    otros3: data.otros3 || '',
                    otros3_precio: data.otros3_precio || '',
                    otros3_check: data.otros3_check || false,
                    observaciones: data.observaciones || ''
                });

                setVersion(prev => prev + 1);
                setModoEdicion(false);
                onActualizar();

                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Datos actualizados exitosamente',
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
            console.error('❌ Error al guardar:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar los cambios',
                background: '#111',
                color: '#fff',
                confirmButtonColor: '#e74c3c',
                confirmButtonText: 'Entendido',
            });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Eliminar patente
    // ==========================================
    const handleEliminar = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Esta acción eliminará la patente ${patente.patente} y todos sus datos`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#666',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#111',
            color: '#fff',
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const response = await axios.delete(
                `${API_URL}/patentes/${patente.patente}`
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'Patente eliminada exitosamente',
                    background: '#111',
                    color: '#fff',
                    confirmButtonColor: '#4CAF50',
                    confirmButtonText: 'OK',
                    timer: 2000,
                    timerProgressBar: true,
                });
                onEliminar(patente.patente);
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
            console.error('Error al eliminar:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar la patente',
                background: '#111',
                color: '#fff',
                confirmButtonColor: '#e74c3c',
                confirmButtonText: 'Entendido',
            });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Servicios (ordenados específicamente)
    // ==========================================
    const servicios = useMemo(() => [
        // Columna izquierda
        { key: 'aceite', label: 'Aceite' },
        { key: 'filtro_aceite', label: 'Filtro Aceite' },
        { key: 'filtro_aire', label: 'Filtro Aire' },
        { key: 'filtro_habitaculo', label: 'Filtro Habitáculo', extraField: 'fecha_cambio_filtro_habitaculo', extraLabel: 'Fecha Cambio' },
    ], [version]);

    const serviciosDerecha = useMemo(() => [
        // Columna derecha
        { key: 'filtro_nafta', label: 'Filtro Nafta', extraField: 'ultimo_cambio_filtro_nafta', extraLabel: 'Último Cambio (KM)' },
        { key: 'filtro_gasoil', label: 'Filtro Gasoil', extraField: 'ultimo_cambio_filtro_gasoil', extraLabel: 'Último Cambio (KM)' },
        { key: 'diferencial', label: 'Diferencial' },
        { key: 'caja', label: 'Caja' },
    ], [version]);

    const otrosServicios = useMemo(() => [
        { key: 'otros1', label: 'Otro 1', isOther: true },
        { key: 'otros2', label: 'Otro 2', isOther: true },
        { key: 'otros3', label: 'Otro 3', isOther: true }
    ], [version]);

    // ==========================================
    // Renderizar una tarjeta de servicio
    // ==========================================
    const renderServicio = (servicio) => {
        const { key, label, extraField, extraLabel, isOther } = servicio;
        const valor = formData[key] || '';
        const precioKey = isOther ? `${key}_precio` : `precio_${key}`;
        const precio = formData[precioKey] || '';
        const checkKey = isOther ? `${key}_check` : `check_${key}`;
        const check = formData[checkKey] || false;
        const extraValue = extraField ? formData[extraField] || '' : '';

        if (modoEdicion) {
            return (
                <div className="detalle-servicio-card" key={`${key}-${version}`}>
                    <div className="servicio-card-titulo">{label}</div>
                    <div className="servicio-card-campos">
                        <input
                            type="text"
                            name={key}
                            value={valor}
                            onChange={handleInputChange}
                            placeholder={isOther ? "Descripción" : "Estado"}
                            className="servicio-card-input"
                        />
                        <input
                            type="number"
                            name={precioKey}
                            value={precio}
                            onChange={handleInputChange}
                            placeholder="$ Precio"
                            className="servicio-card-input-precio"
                            step="1"
                        />
                        {extraField && (
                            <input
                                type={extraField.includes('fecha') ? 'date' : 'number'}
                                name={extraField}
                                value={extraValue}
                                onChange={handleInputChange}
                                placeholder={extraLabel}
                                className="servicio-card-input-extra"
                            />
                        )}
                        <div className="servicio-card-radio-group">
                            <label className="servicio-card-radio-label">
                                <input
                                    type="radio"
                                    name={checkKey}
                                    checked={check === true}
                                    onChange={() => handleRadioChange(checkKey, true)}
                                />
                                <span>SÍ</span>
                            </label>
                            <label className="servicio-card-radio-label">
                                <input
                                    type="radio"
                                    name={checkKey}
                                    checked={check === false}
                                    onChange={() => handleRadioChange(checkKey, false)}
                                />
                                <span>NO</span>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="detalle-servicio-card" key={`${key}-${version}`}>
                <div className="servicio-card-titulo">{label}</div>
                <div className="servicio-card-campos">
                    <span className="servicio-card-valor">{valor || '—'}</span>
                    <span className="servicio-card-precio">
                        {precio ? `$${formatearPrecio(precio)}` : '—'}
                    </span>
                    {extraField && (
                        <span className="servicio-card-extra">
                            {extraField.includes('fecha') 
                                ? (extraValue ? new Date(extraValue + 'T00:00:00Z').toLocaleDateString('es-AR', { timeZone: 'UTC' }) : '—')
                                : (extraValue ? Number(extraValue).toLocaleString() + ' KM' : '—')}
                        </span>
                    )}
                    <span className="servicio-card-check">{check ? '✓ SÍ' : '✗ NO'}</span>
                </div>
            </div>
        );
    };

    // ==========================================
    // Renderizado
    // ==========================================
    const totalCalculado = calcularTotal();

    return (
        <div className="detalle-container">
            {/* HEADER */}
            <div className="detalle-header">
                <button 
                    className="detalle-btn-volver"
                    onClick={onVolver}
                >
                    ← Volver
                </button>
                <div className="detalle-patente">{patente.patente}</div>
                <div className="detalle-acciones-header">
                    {modoEdicion ? (
                        <>
                            <button 
                                className="detalle-btn-cancelar"
                                onClick={() => {
                                    setModoEdicion(false);
                                    setFormData({
                                        patente: patente.patente,
                                        modelo_auto: patente.modelo_auto || '',
                                        fecha: patente.fecha || '',
                                        kilometraje: patente.kilometraje || '',
                                        atendidox: patente.atendidox || '',
                                        total_litros_aceite: patente.total_litros_aceite || '',
                                        proxima_visita_km: patente.proxima_visita_km || '',
                                        aceite: patente.aceite || '',
                                        precio_aceite: patente.precio_aceite || '',
                                        check_aceite: patente.check_aceite || false,
                                        filtro_aceite: patente.filtro_aceite || '',
                                        precio_filtro_aceite: patente.precio_filtro_aceite || '',
                                        check_filtro_aceite: patente.check_filtro_aceite || false,
                                        filtro_aire: patente.filtro_aire || '',
                                        precio_filtro_aire: patente.precio_filtro_aire || '',
                                        check_filtro_aire: patente.check_filtro_aire || false,
                                        filtro_nafta: patente.filtro_nafta || '',
                                        precio_filtro_nafta: patente.precio_filtro_nafta || '',
                                        check_filtro_nafta: patente.check_filtro_nafta || false,
                                        ultimo_cambio_filtro_nafta: patente.ultimo_cambio_filtro_nafta || '',
                                        filtro_gasoil: patente.filtro_gasoil || '',
                                        precio_filtro_gasoil: patente.precio_filtro_gasoil || '',
                                        check_filtro_gasoil: patente.check_filtro_gasoil || false,
                                        ultimo_cambio_filtro_gasoil: patente.ultimo_cambio_filtro_gasoil || '',
                                        filtro_habitaculo: patente.filtro_habitaculo || '',
                                        precio_filtro_habitaculo: patente.precio_filtro_habitaculo || '',
                                        check_filtro_habitaculo: patente.check_filtro_habitaculo || false,
                                        fecha_cambio_filtro_habitaculo: patente.fecha_cambio_filtro_habitaculo || '',
                                        diferencial: patente.diferencial || '',
                                        precio_diferencial: patente.precio_diferencial || '',
                                        check_diferencial: patente.check_diferencial || false,
                                        caja: patente.caja || '',
                                        precio_caja: patente.precio_caja || '',
                                        check_caja: patente.check_caja || false,
                                        total: patente.total || '',
                                        otros1: patente.otros1 || '',
                                        otros1_precio: patente.otros1_precio || '',
                                        otros1_check: patente.otros1_check || false,
                                        otros2: patente.otros2 || '',
                                        otros2_precio: patente.otros2_precio || '',
                                        otros2_check: patente.otros2_check || false,
                                        otros3: patente.otros3 || '',
                                        otros3_precio: patente.otros3_precio || '',
                                        otros3_check: patente.otros3_check || false,
                                        observaciones: patente.observaciones || ''
                                    });
                                }}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="detalle-btn-guardar"
                                onClick={handleGuardar}
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className="detalle-btn-modificar"
                                onClick={() => setModoEdicion(true)}
                            >
                                Modificar
                            </button>
                            <button 
                                className="detalle-btn-eliminar"
                                onClick={handleEliminar}
                                disabled={loading}
                            >
                                Eliminar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* BODY */}
            <div className="detalle-body">
                {/* DATOS DEL VEHÍCULO */}
                <div className="detalle-datos-vehiculo">
                    <div className="detalle-vehiculo-header">
                        <h3>Datos del Vehículo</h3>
                    </div>
                    <div className="detalle-datos-grid">
                        <div className="detalle-campo">
                            <label>Modelo</label>
                            {modoEdicion ? (
                                <input
                                    type="text"
                                    name="modelo_auto"
                                    value={formData.modelo_auto}
                                    onChange={handleInputChange}
                                    className="detalle-input"
                                    placeholder="Ej: Toyota Corolla"
                                />
                            ) : (
                                <span className="detalle-valor">{formData.modelo_auto || '—'}</span>
                            )}
                        </div>
                        <div className="detalle-campo">
                            <label>Fecha de Servicio</label>
                            {modoEdicion ? (
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleInputChange}
                                    className="detalle-input"
                                />
                            ) : (
                                <span className="detalle-valor">
                                    {formData.fecha ? new Date(formData.fecha + 'T00:00:00Z').toLocaleDateString('es-AR', { timeZone: 'UTC' }) : '—'}
                                </span>
                            )}
                        </div>
                        <div className="detalle-campo">
                            <label>Kilometraje</label>
                            {modoEdicion ? (
                                <input
                                    type="number"
                                    name="kilometraje"
                                    value={formData.kilometraje}
                                    onChange={handleInputChange}
                                    className="detalle-input"
                                    placeholder="Ej: 125202"
                                />
                            ) : (
                                <span className="detalle-valor">
                                    {formData.kilometraje ? formData.kilometraje.toLocaleString() + ' KM' : '—'}
                                </span>
                            )}
                        </div>
                        <div className="detalle-campo">
                            <label>Atendido por</label>
                            {modoEdicion ? (
                                <input
                                    type="text"
                                    name="atendidox"
                                    value={formData.atendidox}
                                    onChange={handleInputChange}
                                    className="detalle-input"
                                    placeholder="Nombre del empleado"
                                />
                            ) : (
                                <span className="detalle-valor">{formData.atendidox || '—'}</span>
                            )}
                        </div>
                        <div className="detalle-campo">
                            <label>Total Litros de Aceite</label>
                            {modoEdicion ? (
                                <input
                                    type="number"
                                    name="total_litros_aceite"
                                    value={formData.total_litros_aceite}
                                    onChange={handleInputChange}
                                    className="detalle-input"
                                    placeholder="Ej: 4.5"
                                    step="0.1"
                                />
                            ) : (
                                <span className="detalle-valor">
                                    {formData.total_litros_aceite ? formData.total_litros_aceite + ' L' : '—'}
                                </span>
                            )}
                        </div>
                        {/* ✅ NUEVO: Próxima Visita KM */}
                        <div className="detalle-campo">
                            <label>Próxima Visita</label>
                            {modoEdicion ? (
                                <input
                                    type="number"
                                    name="proxima_visita_km"
                                    value={formData.proxima_visita_km}
                                    onChange={handleInputChange}
                                    className="detalle-input"
                                    placeholder="Ej: 130000"
                                />
                            ) : (
                                <span className="detalle-valor">
                                    {formData.proxima_visita_km ? formData.proxima_visita_km.toLocaleString() + ' KM' : '—'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* SERVICIOS REALIZADOS */}
                <div className="detalle-servicios">
                    <div className="detalle-servicios-header">
                        <h3>Servicios Realizados</h3>
                        <span className="detalle-servicios-count">
                            {[...servicios, ...serviciosDerecha].filter(s => formData[`check_${s.key}`] === true || formData[`${s.key}_check`] === true).length} de {servicios.length + serviciosDerecha.length} completados
                        </span>
                    </div>
                    <div className="detalle-servicios-columnas">
                        <div className="detalle-servicios-columna">
                            {servicios.map(servicio => renderServicio(servicio))}
                        </div>
                        <div className="detalle-servicios-columna">
                            {serviciosDerecha.map(servicio => renderServicio(servicio))}
                        </div>
                    </div>
                </div>

                {/* OTROS - Servicios adicionales */}
                <div className="detalle-otros">
                    <div className="detalle-otros-header">
                        <h3>Otros</h3>
                        <span className="detalle-otros-count">
                            {otrosServicios.filter(s => formData[`${s.key}_check`] === true).length} de {otrosServicios.length} completados
                        </span>
                    </div>
                    <div className="detalle-otros-grid">
                        {otrosServicios.map(servicio => renderServicio(servicio))}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="detalle-total">
                    <div className="detalle-total-content">
                        <span className="detalle-total-label">Total</span>
                        <span className="detalle-total-valor">${formatearPrecio(totalCalculado)}</span>
                    </div>
                </div>

                {/* OBSERVACIONES */}
                <div className="detalle-observaciones">
                    <h3>Observaciones</h3>
                    {modoEdicion ? (
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            className="detalle-textarea-observaciones"
                            rows="5"
                            placeholder="Observaciones generales del servicio..."
                        />
                    ) : (
                        <div className="detalle-texto-observaciones">
                            {formData.observaciones || 'Sin observaciones'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetallePatente;