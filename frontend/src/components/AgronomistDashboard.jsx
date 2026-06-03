import React from 'react';
import { useNavigate } from 'react-router-dom';

const AgronomistDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const menuItems = [
        {
            title: 'Harta Parcelelor',
            description: 'Planificați lucrările și monitorizați culturile pe hartă.',
            icon: '🗺️',
            path: '/map',
            color: '#10b981'
        },
        {
            title: 'Gestiune Utilaje',
            description: 'Verificați starea și alocarea echipamentelor.',
            icon: '🚜',
            path: '/machinery',
            color: '#f59e0b'
        },
        {
            title: 'Magazie Resurse',
            description: 'Gestionați stocurile de sămânță, îngrășăminte și motorină.',
            icon: '📦',
            path: '/inventory',
            color: '#6366f1'
        },
        {
            title: 'Istoric Sarcini Alocate',
            description: 'Vedeți statusul tuturor lucrărilor atribuite muncitorilor.',
            icon: '📋',
            path: '/agronomist/history',
            color: '#3b82f6'
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ color: 'var(--primary-green)', fontSize: '32px', marginBottom: '8px' }}>
                    Panou Agronom - {user?.farmName}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                    Bun venit, <strong>{user?.username}</strong>! Gestionați activitățile și resursele fermei.
                </p>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                {menuItems.map((item, index) => (
                    <div 
                        key={index} 
                        className="card card-interactive"
                        onClick={() => navigate(item.path)}
                        style={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '15px'
                        }}
                    >
                        <div style={{ 
                            fontSize: '40px', 
                            width: '80px', 
                            height: '80px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: `${item.color}15`,
                            borderRadius: '50%',
                            marginBottom: '10px'
                        }}>
                            {item.icon}
                        </div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px', fontWeight: '700' }}>{item.title}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgronomistDashboard;
