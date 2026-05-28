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
        padding: '8px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        color: '#333',
        fontWeight: 'bold'
    };

    return (
        <button onClick={handleBack} style={{ ...defaultStyle, ...style }}>
            &#8592; Înapoi la Panou
        </button>
    );
};

export default BackButton;
