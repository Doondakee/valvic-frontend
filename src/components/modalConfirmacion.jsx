import { FaTimes, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

function ModalConfirmacion({ isOpen, onClose, onConfirm, productos, categoria }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-valvic" onClick={onClose}>
      <div className="modal-content-valvic" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-valvic">
          <div className="modal-header-icon">
            <FaExclamationTriangle />
          </div>
          <h2 className="modal-title-valvic">Confirmar Eliminación</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body-valvic">
          <p className="modal-warning-text">
            ¿Estás seguro de que deseas eliminar <strong>{categoria}</strong> y todos sus productos?
          </p>
          
          <div className="modal-products-list">
            <h4>Productos a eliminar ({productos.length})</h4>
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

          <div className="modal-actions-valvic">
            <button className="modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button className="modal-btn-confirm" onClick={onConfirm}>
              <FaTrashAlt className="btn-icon" /> Eliminar Todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;