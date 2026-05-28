import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const cardStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    };

    const handleMouseOver = (e) => e.currentTarget.style.transform = 'scale(1.05)';
    const handleMouseOut = (e) => e.currentTarget.style.transform = 'scale(1)';

    return (
        <div>
            <h1 style={{ color: 'var(--primary-green)' }}>Panou de Control - {user?.farmName || 'Management'}</h1>
            <p>Bun venit, {user?.username}! De aici puteți superviza operațiunile fermei.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                <div style={cardStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onClick={() => navigate('/manager/employees')}>
                    <h2 style={{margin: 0}}>👥 Gestionează Echipa</h2>
                    <p>Adăugați și vizualizați angajații.</p>
                </div>
                <div style={cardStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} onClick={() => navigate('/map')}>
                    <h2 style={{margin: 0}}>🗺️ Vizualizare Hartă</h2>
                    <p>Vedeți starea parcelelor în timp real.</p>
                </div>
                <div style={{ backgroundColor: '#e0e0e0', ...cardStyle, cursor: 'not-allowed' }} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                    <h2 style={{margin: 0, color: '#9e9e9e'}}>📊 Rapoarte Financiare</h2>
                    <p style={{color: '#9e9e9e'}}>În curând.</p>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;