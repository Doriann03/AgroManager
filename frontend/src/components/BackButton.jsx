import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ style }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const role = user?.role;

        const roleToPathMap = {
            'SUPER_ADMIN': '/super-admin',
            'FARM_MANAGER': '/manager',
            'AGRONOMIST': '/agronomist',
            'WORKER': '/worker'
        };

        const path = role ? roleToPathMap[role] : '/login';
        navigate(path);
    };

    const defaultStyle = {
        padding: '9px 14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '1px solid var(--border-color)',
        backgroundColor: '#fff',
        color: 'var(--text-main)',
        fontWeight: 800,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)'
    };

    return (
        <button className="back-button" onClick={handleBack} style={{ ...defaultStyle, ...style }}>
            &#8592; Înapoi la Panou
        </button>
    );
};

export default BackButton;
