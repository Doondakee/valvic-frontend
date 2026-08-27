import { useState } from 'react';
import logoValvic from '../assets/valvic.png';

// ICONOS
import { 
    FaStore, FaPlus, FaPercent, FaSignOutAlt, FaChevronDown, FaBoxes, FaUsers
} from 'react-icons/fa';

function Header({ activeTab, setActiveTab, onLogout, onNavigateToUsuarios }) {
    const [showMenu, setShowMenu] = useState(false);
    const usuario = localStorage.getItem('usuario') || 'Usuario';
    const rol = localStorage.getItem('rol') || 'empleado';

    const esAdmin = rol === 'administrador';

    return (
        <header className="header-valvic">
            <div className="header-valvic-content">
                <div className="header-valvic-left">
                    <div className="header-valvic-brand">
                        <img src={logoValvic} alt="Valvic" className="header-valvic-logo"/>
                        <div className="header-valvic-brand-text">
                            <h1 className="header-valvic-title">Gomería Valvic</h1>
                            <span className="header-valvic-subtitle">
                                <FaBoxes className="header-subtitle-icon" /> Control de Inventario
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="header-valvic-nav">
                    <button
                        className={`header-valvic-tab ${activeTab === 'inventario' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventario')}
                    >
                        <FaStore className="tab-icon" />
                        <span className="tab-text">Inventario</span>
                    </button>
                    
                    {esAdmin && (
                        <>
                            <button
                                className={`header-valvic-tab ${activeTab === 'nuevo' ? 'active' : ''}`}
                                onClick={() => setActiveTab('nuevo')}
                            >
                                <FaPlus className="tab-icon" />
                                <span className="tab-text">+ Nuevo</span>
                            </button>

                            <button
                                className={`header-valvic-tab ${activeTab === 'sumador' ? 'active' : ''}`}
                                onClick={() => setActiveTab('sumador')}
                            >
                                <FaPercent className="tab-icon" />
                                <span className="tab-text">Sumador %</span>
                            </button>
                        </>
                    )}
                </nav>

                <div className="header-valvic-user">
                    <div className="header-valvic-user-info" onClick={() => setShowMenu(!showMenu)}>
                        <div className="user-avatar-valvic">
                            <span>{usuario.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="user-details-valvic">
                            <span className="user-name-valvic">{usuario}</span>
                            <span className="user-role-valvic">{rol}</span>
                        </div>
                        <FaChevronDown className={`user-dropdown-icon ${showMenu ? 'rotated' : ''}`} />
                    </div>
            
                    {showMenu && (
                        <div className="header-valvic-dropdown">
                            <div className="dropdown-user-info">
                                <div className="dropdown-avatar">
                                    <span>{usuario.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <div className="dropdown-user-name">{usuario}</div>
                                    <div className="dropdown-user-role">{rol}</div>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            
                            {esAdmin && (
                                <>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => { 
                                            setShowMenu(false); 
                                            if (onNavigateToUsuarios) {
                                                onNavigateToUsuarios();
                                            }
                                        }}
                                    >
                                        <FaUsers className="dropdown-icon" />
                                        Gestionar Usuarios
                                    </button>
                                    <div className="dropdown-divider"></div>
                                </>
                            )}
                            
                            <button className="dropdown-item logout-item" onClick={() => { setShowMenu(false); onLogout(); }}>
                                <FaSignOutAlt className="dropdown-icon" />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;