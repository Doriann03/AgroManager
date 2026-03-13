import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FarmerDashboard from './components/FarmerDashboard';
import MapPage from './components/MapPage'; // Importăm componenta MapPage
import MachineryPage from './components/MachineryPage'; // Importăm componenta MachineryPage
import './App.css'; // Importăm stilurile globale

// Componente simple pentru test (pagini temporare)
const AdminDashboard = () => <div className="page-container"><h1>Bun venit, Admin!</h1></div>;

// Un layout simplu pentru paginile autentificate
const AppLayout = ({ children }) => {
  return (
    <div className="page-container">
      {/* Aici ar putea veni un header sau un meniu lateral comun */}
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute publice */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute protejate (încapsulate în layout) */}
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

      </Routes>
    </Router>
  );
}

export default App;