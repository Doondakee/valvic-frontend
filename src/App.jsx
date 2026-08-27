import { useState, useEffect } from 'react';
import Login from './components/login';
import Header from './components/header';
import Inventario from './components/inventario';
import Usuarios from './components/usuarios';
import Nuevo from './components/nuevo';
import Sumador from './components/sumador';
import ModalConfirmacion from './components/modalConfirmacion';
import './styles/global.css';
import './styles/login.css';
import './styles/header.css';
import './styles/inventario.css';
import './styles/usuarios.css';
import './styles/nuevo.css';
import './styles/sumador.css';
import './styles/solicitarRegistro.css';
import './styles/modalConfirmacion.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('inventario');
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarSesion = () => {
      try {
        const usuario = localStorage.getItem('usuario');
        const userRol = localStorage.getItem('rol');
        const tiempoSesion = localStorage.getItem('tiempoSesion');
        
        if (tiempoSesion) {
          const tiempoActual = Date.now();
          const tiempoExpiracion = parseInt(tiempoSesion);
          const horasTranscurridas = (tiempoActual - tiempoExpiracion) / (1000 * 60 * 60);
          
          if (horasTranscurridas >= 12) {
            // Sesión expirada
            localStorage.removeItem('usuario');
            localStorage.removeItem('rol');
            localStorage.removeItem('userId');
            localStorage.removeItem('tiempoSesion');
            setIsAuthenticated(false);
            setRol(null);
          } else if (usuario) {
            setIsAuthenticated(true);
            setRol(userRol);
          }
        } else if (usuario) {
          localStorage.setItem('tiempoSesion', Date.now().toString());
          setIsAuthenticated(true);
          setRol(userRol);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setLoading(false);
      }
    };
    
    verificarSesion();
  }, []);

  const handleLogin = (status) => {
    if (status) {
      localStorage.setItem('tiempoSesion', Date.now().toString());
      setIsAuthenticated(true);
      setRol(localStorage.getItem('rol'));
    } else {
      setIsAuthenticated(false);
      setRol(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.removeItem('tiempoSesion');
    setIsAuthenticated(false);
    setRol(null);
  };

  const handleProductoCreado = () => {
    console.log('Producto creado exitosamente');
  };

  const handleCategoriaCreada = () => {
    console.log('Categoría creada exitosamente');
  };

  const handleNavigateToUsuarios = () => {
    setActiveTab('usuarios');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Cargando sesión...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Determinar si el usuario es administrador
  const esAdmin = rol === 'administrador';

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        onNavigateToUsuarios={handleNavigateToUsuarios}
      />
      <main className="main-content">
        {activeTab === 'inventario' && <Inventario />}
        {activeTab === 'nuevo' && (
          <Nuevo 
            onProductoCreado={handleProductoCreado}
            onCategoriaCreada={handleCategoriaCreada}
          />
        )}
        {activeTab === 'sumador' && <Sumador />}
        {activeTab === 'usuarios' && esAdmin && <Usuarios />}
      </main>
    </div>
  );
}

export default App;