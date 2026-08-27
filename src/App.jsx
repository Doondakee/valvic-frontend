import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import Login from './components/login';
import Header from './components/header';
import Inventario from './components/inventario';
import Usuarios from './components/usuarios';
import Nuevo from './components/nuevo';
import Sumador from './components/sumador';
import Patentes from './components/Patentes';
import DetallePatente from './components/detallePatente';
import ClientesPatentes from './components/clientesPatente';
import './styles/global.css';
import './styles/login.css';
import './styles/header.css';
import './styles/inventario.css';
import './styles/usuarios.css';
import './styles/nuevo.css';
import './styles/sumador.css';
import './styles/solicitarRegistro.css';
import './styles/modalConfirmacion.css';
import './styles/patentes.css';
import './styles/clientesPatentes.css'; 
import './styles/detallePatente.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
      navigate('/inventario');
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
    navigate('/login');
  };

  const handleNavigateToUsuarios = () => {
    navigate('/usuarios');
  };

  // ==========================================
  // Ruta protegida (requiere autenticación)
  // ==========================================
  const RutaProtegida = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // ==========================================
  // Ruta solo para administradores
  // ==========================================
  const RutaAdmin = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (rol !== 'administrador') {
      return <Navigate to="/inventario" replace />;
    }
    return children;
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

  const esAdmin = rol === 'administrador';

  return (
    <Routes>
      {/* ========================================== */}
      {/* RUTAS PÚBLICAS (NO requieren login) */}
      {/* ========================================== */}
      <Route path="/clientes-patentes" element={<ClientesPatentes />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      
      {/* Redirección raíz */}
      <Route path="/" element={<Navigate to="/inventario" replace />} />

      {/* ========================================== */}
      {/* RUTAS PROTEGIDAS (requieren autenticación) */}
      {/* ========================================== */}
      <Route path="/inventario" element={
        <RutaProtegida>
          <Layout 
            activeTab="inventario"
            rol={rol}
            onLogout={handleLogout}
            onNavigateToUsuarios={handleNavigateToUsuarios}
          >
            <Inventario />
          </Layout>
        </RutaProtegida>
      } />

      <Route path="/patentes" element={
        <RutaProtegida>
          <Layout 
            activeTab="patentes"
            rol={rol}
            onLogout={handleLogout}
            onNavigateToUsuarios={handleNavigateToUsuarios}
          >
            <Patentes />
          </Layout>
        </RutaProtegida>
      } />

      {/* ✅ RUTA DINÁMICA PARA EL DETALLE DE UNA PATENTE */}
      <Route path="/patentes/:patente" element={
        <RutaProtegida>
          <Layout activeTab="patentes">
            <DetallePatenteWrapper />
          </Layout>
        </RutaProtegida>
      } />

      {/* Rutas solo para administradores */}
      <Route path="/nuevo" element={
        <RutaAdmin>
          <Layout 
            activeTab="nuevo"
            rol={rol}
            onLogout={handleLogout}
            onNavigateToUsuarios={handleNavigateToUsuarios}
          >
            <Nuevo />
          </Layout>
        </RutaAdmin>
      } />

      <Route path="/sumador" element={
        <RutaAdmin>
          <Layout 
            activeTab="sumador"
            rol={rol}
            onLogout={handleLogout}
            onNavigateToUsuarios={handleNavigateToUsuarios}
          >
            <Sumador />
          </Layout>
        </RutaAdmin>
      } />

      <Route path="/usuarios" element={
        <RutaAdmin>
          <Layout 
            activeTab="usuarios"
            rol={rol}
            onLogout={handleLogout}
            onNavigateToUsuarios={handleNavigateToUsuarios}
          >
            <Usuarios />
          </Layout>
        </RutaAdmin>
      } />

      {/* 404 - Página no encontrada */}
      <Route path="*" element={<Navigate to="/inventario" replace />} />
    </Routes>
  );
}

// ==========================================
// Componente Layout (Header + contenido)
// ==========================================
function Layout({ children, activeTab, rol, onLogout, onNavigateToUsuarios }) {
  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab}
        setActiveTab={() => {}}
        onLogout={onLogout}
        onNavigateToUsuarios={onNavigateToUsuarios}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ==========================================
// ✅ NUEVO: Wrapper para DetallePatente
// ==========================================
function DetallePatenteWrapper() {
  const { patente } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/clientes/${patente}`);
        if (response.data.success && response.data.data) {
          setCliente(response.data.data);
        } else {
          setError('No se encontró el cliente');
        }
      } catch (err) {
        console.error('Error al cargar cliente:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    if (patente) {
      cargarCliente();
    }
  }, [patente]);

  const handleVolver = () => {
    navigate('/patentes');
  };

  const handleEliminar = () => {
    navigate('/patentes');
  };

  const handleActualizar = () => {
    // Recargar los datos del cliente sin salir de la página
    const recargarCliente = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/clientes/${patente}`);
        if (response.data.success && response.data.data) {
          setCliente(response.data.data);
        }
      } catch (err) {
        console.error('Error al recargar cliente:', err);
      }
    };
    recargarCliente();
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Cargando...</div>;
  }

  if (error || !cliente) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ff6b6b' }}>
        {error || 'Cliente no encontrado'}
      </div>
    );
  }

  return (
    <DetallePatente 
      patente={cliente}
      onVolver={handleVolver}
      onEliminar={handleEliminar}
      onActualizar={handleActualizar}
    />
  );
}

export default App;