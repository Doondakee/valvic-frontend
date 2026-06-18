import { FaTimes, FaTrashAlt, FaExclamationTriangle, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

function ModalConfirmacion({ 
    isOpen, 
    onClose, 
    onConfirm, 
    productos = [], 
    categoria = '',
    titulo = 'Confirmar',
    mensaje = '',
    icono = 'peligro', // 'peligro', 'pregunta', 'info'
    botonConfirmar = 'Confirmar',
    botonCancelar = 'Cancelar',
    tipo = 'eliminar', // 'eliminar', 'descontar', 'info'
    loading = false
}) {
    if (!isOpen) return null;

    const getIcono = () => {
        switch(icono) {
            case 'peligro':
                return <FaExclamationTriangle className="modal-icon-danger" />;
            case 'pregunta':
                return <FaQuestionCircle className="modal-icon-question" />;
            case 'info':
                return <FaInfoCircle className="modal-icon-info" />;
            default:
                return <FaExclamationTriangle className="modal-icon-danger" />;
        }
    };

    const getColorConfirmar = () => {
        switch(tipo) {
            case 'eliminar':
                return 'modal-btn-danger';
            case 'descontar':
                return 'modal-btn-warning';
            default:
                return 'modal-btn-confirm';
        }
    };

    return (
        <div className="modal-overlay-valvic" onClick={onClose}>
            <div className="modal-content-valvic" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-valvic">
                    <div className="modal-header-icon">
                        {getIcono()}
                    </div>
                    <h2 className="modal-title-valvic">{titulo}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body-valvic">
                    {mensaje && (
                        <p className="modal-warning-text">{mensaje}</p>
                    )}
                    
                    {productos && productos.length > 0 && (
                        <div className="modal-products-list">
                            <h4>Productos a {tipo === 'eliminar' ? 'eliminar' : 'procesar'} ({productos.length})</h4>
                            <ul>
                                {productos.map((producto, index) => (
                                    <li key={producto.id || index}>
                                        <span className="product-name">{producto.producto}</span>
                                        <span className="product-detail">
                                            {producto.codigo ? `Cód: ${producto.codigo}` : ''}
                                            {producto.contenido ? ` - ${producto.contenido}` : ''}
                                        </span>
                                        <span className="product-stock">Stock: {producto.stock || 0}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {categoria && !productos.length && (
                        <p className="modal-warning-text">
                            ¿Estás seguro de que deseas eliminar la categoría <strong>{categoria}</strong>?
                        </p>
                    )}

                    <div className="modal-actions-valvic">
                        <button className="modal-btn-cancel" onClick={onClose} disabled={loading}>
                            {botonCancelar}
                        </button>
                        <button className={`modal-btn-confirm ${getColorConfirmar()}`} onClick={onConfirm} disabled={loading}>
                            {loading ? 'Procesando...' : botonConfirmar}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalConfirmacion;