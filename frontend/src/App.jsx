import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MapPage from './components/MapPage'; 
import MachineryPage from './components/MachineryPage'; 
import InventoryPage from './components/InventoryPage';
import EmployeesPage from './components/EmployeesPage'; // Importăm pagina de angajați

// Importăm noile dashboard-uri
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AgronomistDashboard from './components/AgronomistDashboard';
import WorkerDashboard from './components/WorkerDashboard';

import './App.css'; 

// Layout-ul general pentru paginile interioare, cu o lățime maximă
const AppLayout = ({ children }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publice */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute pentru fiecare rol */}
        <Route path="/super-admin" element={<AppLayout><SuperAdminDashboard /></AppLayout>} />
        <Route path="/manager" element={<AppLayout><ManagerDashboard /></AppLayout>} />
        <Route path="/agronomist" element={<AppLayout><AgronomistDashboard /></AppLayout>} />
        <Route path="/worker" element={<WorkerDashboard />} />

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