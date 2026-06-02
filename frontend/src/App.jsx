import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage'; 
import MachineryPage from './components/MachineryPage'; 
import InventoryPage from './components/InventoryPage';
import EmployeesPage from './components/EmployeesPage'; // Importăm pagina de angajați

// Importăm noile dashboard-uri
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AgronomistDashboard from './components/AgronomistDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import WorkerHistoryPage from './components/WorkerHistoryPage';

import './App.css'; 

// Layout-ul general pentru paginile interioare, cu o lățime maximă
const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderBottom: '1px solid var(--border-color)', 
        padding: '0 50px',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--box-shadow-sm)'
      }}>
        <Link to="/" style={{ fontSize: '22px', fontPoppins: '800', fontWeight: '800', color: 'var(--primary-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🚜</span> AgroManager
        </Link>
        
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center', height: '100%' }}>
          {(user?.role === 'MANAGER' || user?.role === 'AGRONOMIST') && (
            <>
              <Link to="/map" className="nav-link">Hartă</Link>
              <Link to="/machinery" className="nav-link">Utilaje</Link>
              <Link to="/inventory" className="nav-link">Magazie</Link>
              {user?.role === 'MANAGER' && <Link to="/manager/employees" className="nav-link">Angajați</Link>}
            </>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid var(--border-color)', height: '40px' }}>
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
      
      <main style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      <footer style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
        &copy; {new Date().getFullYear()} AgroManager - Digitalizăm Agricultura.
      </footer>
    </div>
  );
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
        <Route path="/super-admin" element={<AppLayout><SuperAdminDashboard /></AppLayout>} />
        <Route path="/manager" element={<AppLayout><ManagerDashboard /></AppLayout>} />
        <Route path="/agronomist" element={<AppLayout><AgronomistDashboard /></AppLayout>} />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/worker/history" element={<AppLayout><WorkerHistoryPage /></AppLayout>} />

        {/* Rute specifice managerului */}
        <Route path="/manager/employees" element={<AppLayout><EmployeesPage /></AppLayout>} />

        {/* Rute partajate */}
        <Route path="/map" element={<MapPage />} />
        <Route path="/machinery" element={<AppLayout><MachineryPage /></AppLayout>} />
        <Route path="/inventory" element={<AppLayout><InventoryPage /></AppLayout>} />
        
        {/* Fallback */}
        <Route path="/farmer" element={<Navigate to="/manager" />} />
        <Route path="/admin" element={<Navigate to="/super-admin" />} />
      </Routes>
    </Router>
  );
}

export default App;