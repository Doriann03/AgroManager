import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MapPage from './components/MapPage';
import FarmerDashboard from './components/FarmerDashboard';

// Componente simple pentru test (pagini temporare)
const AdminDashboard = () => <h1>Bun venit, Admin! Aici vei gestiona totul.</h1>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta implicită redirecționează către login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;