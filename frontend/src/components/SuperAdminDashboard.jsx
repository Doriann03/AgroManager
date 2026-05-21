import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Aici ar trebui un apel la API pentru logout
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div>
            <h1 style={{ color: 'var(--primary-green)' }}>Panou Super Admin</h1>
            <p>Gestiune platformă și utilizatori.</p>
            <button 
                onClick={handleLogout}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Logout
            </button>
        </div>
    );
};

export default SuperAdminDashboard;