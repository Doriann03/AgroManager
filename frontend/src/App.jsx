import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

// Componente simple pentru test (pagini temporare)
const AdminDashboard = () => <h1>Bun venit, Admin! Aici vei gestiona totul.</h1>;
const FarmerDashboard = () => <h1>Salut Fermierule! Aici sunt parcelele tale.</h1>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta implicită redirecționează către login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;