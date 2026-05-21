import React from 'react';
import { useNavigate } from 'react-router-dom';

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        // Aici ar trebui un apel la API pentru logout
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh', 
            backgroundColor: '#f0f2f5',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{ 
                width: '100%', 
                maxWidth: '400px', 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '10px', 
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <h1 style={{ color: 'var(--primary-green)', margin: '0 0 10px 0' }}>Salut, {user?.username}!</h1>
                <p style={{ color: '#555', marginBottom: '30px' }}>Sarcinile tale de azi la ferma "{user?.farmName}":</p>

                <div style={{ 
                    border: '2px dashed #ccc', 
                    padding: '40px 20px', 
                    borderRadius: '8px', 
                    color: '#888',
                    marginBottom: '30px'
                }}>
                    Nu ai nicio lucrare atribuită astăzi.
                </div>

                <button 
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default WorkerDashboard;