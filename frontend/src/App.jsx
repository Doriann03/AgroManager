import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FarmerDashboard from './components/FarmerDashboard';
import MapPage from './components/MapPage'; 
import MachineryPage from './components/MachineryPage'; 
import InventoryPage from './components/InventoryPage'; // Importăm noua pagină de Magazie
import './App.css'; 

const AdminDashboard = () => <div className="page-container"><h1>Bun venit, Admin!</h1></div>;

const AppLayout = ({ children }) => {
  return (
    <div className="page-container">
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route 
          path="/farmer" 
          element={<AppLayout><FarmerDashboard /></AppLayout>} 
        />
        <Route 
          path="/admin" 
          element={<AppLayout><AdminDashboard /></AppLayout>} 
        />
        <Route 
          path="/map" 
          element={<AppLayout><MapPage /></AppLayout>} 
        />
        <Route 
          path="/machinery" 
          element={<AppLayout><MachineryPage /></AppLayout>} 
        />
        {/* Adăugăm ruta pentru Magazie */}
        <Route 
          path="/inventory" 
          element={<AppLayout><InventoryPage /></AppLayout>} 
        />
      </Routes>
    </Router>
  );
}

export default App;