import React from 'react';
import { useNavigate } from 'react-router-dom';

const AgronomistDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const buttonStyle = {
        padding: '20px',
        fontSize: '18px',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%'
    };

    return (
        <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{ color: 'var(--primary-green)', textAlign: 'center' }}>Panou de Lucru - Agronom ({user?.farmName})</h1>
            <p style={{ textAlign: 'center', marginBottom: '40px' }}>Gestionați lucrările agricole, utilajele și stadiul culturilor.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <button 
                    style={{ ...buttonStyle, backgroundColor: '#2196F3' }}
                    onClick={() => navigate('/map')}
                >
                    <span style={{ fontSize: '24px' }}>🗺️</span> Gestionează Harta Parcelelor
                </button>
                
                <button 
                    style={{ ...buttonStyle, backgroundColor: '#FFC107', color: 'black' }}
                    onClick={() => navigate('/machinery')}
                >
                    <span style={{ fontSize: '24px' }}>🚜</span> Gestionează Utilaje
                </button>

                <button 
                    style={{ ...buttonStyle, backgroundColor: '#4CAF50' }}
                    onClick={() => navigate('/inventory')}
                >
                    <span style={{ fontSize: '24px' }}>📦</span> Magazia Fermei
                </button>
            </div>
        </div>
    );
};

export default AgronomistDashboard;