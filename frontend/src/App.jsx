import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import apiClient from './api/axiosConfig';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage'; 
import MachineryPage from './components/MachineryPage'; 
import InventoryPage from './components/InventoryPage';
import EmployeesPage from './components/EmployeesPage';

// Import Dashboards
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AgronomistDashboard from './components/AgronomistDashboard';
import AgronomistHistoryPage from './components/AgronomistHistoryPage';
import WorkerDashboard from './components/WorkerDashboard';
import WorkerHistoryPage from './components/WorkerHistoryPage';
import WorkerPayrollPage from './components/WorkerPayrollPage';
import FarmProfilePage from './components/FarmProfilePage';
import YieldReportPage from './components/YieldReportPage';
import WeatherStrategyPage from './components/WeatherStrategyPage';

import './App.css'; 

// Layout general pentru utilizatori autentificati
const AppLayout = ({ children, maxWidth = '1200px' }) => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = React.useMemo(() => userStr ? JSON.parse(userStr) : null, [userStr]);
  
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationsRef = React.useRef(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        apiClient.get('/api/notifications'),
        apiClient.get('/api/notifications/unread-count')
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data);
    } catch (error) {
      console.error("Eroare la preluarea notificarilor:", error);
    }
  }, []);

  React.useEffect(() => {
    if (user && (user.role === 'AGRONOMIST' || user.role === 'FARM_MANAGER')) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, user?.role, fetchNotifications]);

  React.useEffect(() => {
    if (!showNotifications) return;

    const handleOutsideClick = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error("Eroare la marcarea notificarilor:", error);
    }
  };

  const markOneAsRead = async (id) => {
    try {
      await apiClient.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Eroare la marcarea notificarii:", error);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-link">
          <span style={{ fontSize: '28px' }}>🚜</span> AgroManager
        </Link>
        
        <nav className="app-nav">
          {(user?.role === 'FARM_MANAGER' || user?.role === 'AGRONOMIST') && (
            <>
              <Link to="/map" className="nav-link">Hartă</Link>
              <Link to="/machinery" className="nav-link">Utilaje</Link>
              <Link to="/inventory" className="nav-link">Magazie</Link>
              {user?.role === 'FARM_MANAGER' && <Link to="/manager/employees" className="nav-link">Angajați</Link>}
              
              {user?.role === 'FARM_MANAGER' && <Link to="/manager/profile" className="nav-link">Profil ferma</Link>}
              {user?.role === 'FARM_MANAGER' && <Link to="/manager/yield-report" className="nav-link">Profitabilitate</Link>}
              {user?.role === 'AGRONOMIST' && <Link to="/agronomist/history" className="nav-link">Istoric lucrari</Link>}
              {user?.role === 'AGRONOMIST' && <Link to="/weather-strategy" className="nav-link">Meteo</Link>}

              {/* Sectiune Notificari */}
              <div ref={notificationsRef} style={{ position: 'relative', marginLeft: '10px' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="notification-button"
                  aria-label="Notificari"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '-5px', 
                      right: '-5px', 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      fontSize: '10px', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      border: '2px solid white'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '40px', 
                    right: '0', 
                    width: '320px', 
                    backgroundColor: 'white', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)',
                    maxHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 1001
                  }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                      <strong style={{ fontSize: '14px' }}>Notificări</strong>
                      <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Marchează tot ca citit
                      </button>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Nicio notificare momentan.</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markOneAsRead(n.id)}
                            style={{ 
                              padding: '15px', 
                              borderBottom: '1px solid #f1f5f9', 
                              backgroundColor: (n.read || n.isRead) ? 'white' : '#f0fdf4',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                          >
                            <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px', lineHeight: '1.4' }}>{n.message}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(n.dateCreated).toLocaleString('ro-RO')}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="user-chip">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{user?.username}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}>
              Logout
            </button>
          </div>
        </nav>
      </header>
      
      <main className="app-main">
        <div style={{ maxWidth, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <footer className="app-footer">
        &copy; {new Date().getFullYear()} AgroManager - Digitalizăm Agricultura.
      </footer>
    </div>
  );
};

// Componenta pentru protejarea rutelor pe baza de rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirectionam catre dashboard-ul specific rolului daca incearca sa acceseze ceva nepermis
    const roleRoutes = {
      'SUPER_ADMIN': '/super-admin',
      'FARM_MANAGER': '/manager',
      'AGRONOMIST': '/agronomist',
      'WORKER': '/worker'
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publice */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute pentru fiecare rol */}
        <Route path="/super-admin" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AppLayout><SuperAdminDashboard /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['FARM_MANAGER']}>
            <AppLayout><ManagerDashboard /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/agronomist" element={
          <ProtectedRoute allowedRoles={['AGRONOMIST']}>
            <AppLayout><AgronomistDashboard /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/agronomist/history" element={
          <ProtectedRoute allowedRoles={['AGRONOMIST']}>
            <AppLayout><AgronomistHistoryPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/worker" element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <WorkerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/worker/history" element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <AppLayout><WorkerHistoryPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/worker/payroll" element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <AppLayout><WorkerPayrollPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Rute specifice managerului */}
        <Route path="/manager/employees" element={
          <ProtectedRoute allowedRoles={['FARM_MANAGER']}>
            <AppLayout><EmployeesPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/manager/profile" element={
          <ProtectedRoute allowedRoles={['FARM_MANAGER']}>
            <AppLayout><FarmProfilePage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/manager/yield-report" element={
          <ProtectedRoute allowedRoles={['FARM_MANAGER', 'SUPER_ADMIN']}>
            <AppLayout maxWidth="1600px"><YieldReportPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/weather-strategy" element={
          <ProtectedRoute allowedRoles={['AGRONOMIST', 'SUPER_ADMIN']}>
            <AppLayout><WeatherStrategyPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Rute partajate */}
        <Route path="/map" element={
          <ProtectedRoute allowedRoles={['FARM_MANAGER', 'AGRONOMIST', 'SUPER_ADMIN']}>
            <MapPage />
          </ProtectedRoute>
        } />

        <Route path="/machinery" element={
          <ProtectedRoute allowedRoles={['FARM_MANAGER', 'AGRONOMIST', 'SUPER_ADMIN']}>
            <AppLayout><MachineryPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['FARM_MANAGER', 'AGRONOMIST', 'SUPER_ADMIN']}>
            <AppLayout><InventoryPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="/farmer" element={<Navigate to="/manager" />} />
        <Route path="/admin" element={<Navigate to="/super-admin" />} />
      </Routes>
    </Router>
  );
}

export default App;
