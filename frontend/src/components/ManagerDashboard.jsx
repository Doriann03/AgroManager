import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const menuItems = [
        {
            title: 'Gestionare echipa',
            description: 'Administrare angajati, roluri, tarife orare, salarii si payroll lunar.',
            icon: 'HR',
            path: '/manager/employees',
            color: '#3b82f6'
        },
        {
            title: 'Harta parcelelor',
            description: 'Vizualizare parcele, culturi, suprafete si istoric agricol pe harta.',
            icon: 'MAP',
            path: '/map',
            color: '#10b981'
        },
        {
            title: 'Utilaje si service',
            description: 'Monitorizare flota, ore de functionare, mentenanta si costuri tehnice.',
            icon: 'UT',
            path: '/machinery',
            color: '#f59e0b'
        },
        {
            title: 'Magazie si stocuri',
            description: 'Evidenta consumabile, preturi unitare, praguri minime si cereri de aprovizionare.',
            icon: 'ST',
            path: '/inventory',
            color: '#6366f1'
        },
        {
            title: 'Profil ferma',
            description: 'Date generale, contact, viziune, sedinte si jurnal decizional.',
            icon: 'PF',
            path: '/manager/profile',
            color: '#475569'
        },
        {
            title: 'Productie si profitabilitate',
            description: 'Recolta, costuri, salarii, utilaje, subventii APIA si profit pe hectar.',
            icon: 'PL',
            path: '/manager/yield-report',
            color: '#16a34a'
        }
    ];

    return (
        <div className="page-shell">
            <section className="dashboard-hero">
                <p className="metric-label" style={{ margin: '0 0 8px 0' }}>Panou manager</p>
                <h1 className="page-title">{user?.farmName || 'Ferma'}</h1>
                <p className="page-subtitle">
                    Bun venit, <strong>{user?.username}</strong>. Ai acces la modulele de administrare, analiza financiara si monitorizare operationala.
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

export default ManagerDashboard;
