import React from 'react';
import { useNavigate } from 'react-router-dom';

const AgronomistDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const menuItems = [
        {
            title: 'Harta si lucrari',
            description: 'Planificare lucrari agricole, inspectie parcele, sezoane de cultura si NDVI.',
            icon: 'MAP',
            path: '/map',
            color: '#10b981'
        },
        {
            title: 'Utilaje disponibile',
            description: 'Consultare flota, status, ore de functionare si progres mentenanta.',
            icon: 'UT',
            path: '/machinery',
            color: '#f59e0b'
        },
        {
            title: 'Magazie resurse',
            description: 'Verificare stocuri si transmitere cereri de aprovizionare catre manager.',
            icon: 'ST',
            path: '/inventory',
            color: '#6366f1'
        },
        {
            title: 'Istoric lucrari',
            description: 'Urmarire lucrari programate, in lucru si finalizate pentru muncitori.',
            icon: 'LOG',
            path: '/agronomist/history',
            color: '#3b82f6'
        },
        {
            title: 'Meteo si strategie',
            description: 'Analiza vremii, risc de precipitatii si ferestre optime pentru lucrari.',
            icon: 'MET',
            path: '/weather-strategy',
            color: '#0ea5e9'
        }
    ];

    return (
        <div className="page-shell">
            <section className="dashboard-hero">
                <p className="metric-label" style={{ margin: '0 0 8px 0' }}>Panou agronom</p>
                <h1 className="page-title">{user?.farmName || 'Ferma'}</h1>
                <p className="page-subtitle">
                    Bun venit, <strong>{user?.username}</strong>. De aici coordonezi lucrarile agricole, resursele si observatiile din teren.
                </p>
            </section>

            <div className="dashboard-grid">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        type="button"
                        className="card module-card"
                        onClick={() => navigate(item.path)}
                    >
                        <span className="module-icon" style={{ backgroundColor: item.color }}>{item.icon}</span>
                        <div>
                            <h3 className="module-title">{item.title}</h3>
                            <p className="module-description">{item.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AgronomistDashboard;
