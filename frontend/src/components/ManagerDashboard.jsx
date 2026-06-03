import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const menuItems = [
        {
            title: 'Gestionează Echipa',
            description: 'Adăugați și vizualizați angajații fermei.',
            icon: '👥',
            path: '/manager/employees',
            color: '#3b82f6'
        },
        {
            title: 'Vizualizare Hartă',
            description: 'Urmăriți starea parcelelor și a culturilor.',
            icon: '🗺️',
            path: '/map',
            color: '#10b981'
        },
        {
            title: 'Utilaje și Echipamente',
            description: 'Gestionați parcul auto și starea tehnică.',
            icon: '🚜',
            path: '/machinery',
            color: '#f59e0b'
        },
        {
            title: 'Magazie și Stocuri',
            description: 'Monitorizați semințele, tratamentele și motorina.',
            icon: '📦',
            path: '/inventory',
            color: '#6366f1'
        },
        {
            title: 'Setări și Profil Fermă',
            description: 'Gestionați viziunea, sediul și jurnalul strategic.',
            icon: '⚙️',
            path: '/manager/profile',
            color: '#475569'
        },
        {
            title: 'Producție și Recolte',
            description: 'Analizați performanța fiecărei parcele pe ani.',
            icon: '📈',
            path: '/manager/yield-report',
            color: '#10b981'
        },
        {
            title: 'Meteo și Strategie',
            description: 'Analiză climatică avansată și recomandări de lucru.',
            icon: '🌤️',
            path: '/weather-strategy',
            color: '#0ea5e9'
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ color: 'var(--primary-green)', fontSize: '32px', marginBottom: '8px' }}>
                    Panou de Control - {user?.farmName || 'Management'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                    Bun venit, <strong>{user?.username}</strong>! De aici puteți superviza toate operațiunile fermei.
                </p>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                {menuItems.map((item, index) => (
                    <div 
                        key={index} 
                        className={`card card-interactive`}
                        onClick={() => !item.disabled && navigate(item.path)}
                        style={{ 
                            cursor: item.disabled ? 'not-allowed' : 'pointer',
                            opacity: item.disabled ? 0.7 : 1,
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
                            backgroundColor: item.disabled ? '#f1f5f9' : `${item.color}15`,
                            borderRadius: '50%',
                            marginBottom: '10px'
                        }}>
                            {item.icon}
                        </div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px', fontWeight: '700' }}>{item.title}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                            {item.disabled ? 'Funcționalitate în curs de dezvoltare.' : item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerDashboard;
