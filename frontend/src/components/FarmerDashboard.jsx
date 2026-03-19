import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const FarmerDashboard = () => {
    const [user] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [parcels, setParcels] = useState([]);
    const navigate = useNavigate();

    const handleLogout = useCallback(async () => {
        try {
            await apiClient.post('/api/auth/logout'); 
        } catch (error) {
            console.error("Eroare la logout pe server:", error);
        } finally {
            localStorage.removeItem('user'); 
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        apiClient.get('/api/parcels')
            .then(response => {
                setParcels(response.data);
            })
            .catch(error => {
                console.error("Eroare la preluarea parcelelor:", error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    handleLogout();
                }
            });
    }, [user, navigate, handleLogout]);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h1>Salut, {user?.username}!</h1>
                <button onClick={handleLogout} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}>
                    Logout
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => navigate('/map')}
                    style={{ 
                        backgroundColor: '#2196F3', 
                        color: 'white', 
                        padding: '15px 30px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontSize: '16px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <span style={{fontSize: '20px'}}>&#x1F5FA;</span> Gestionează Harta Parcelelor
                </button>
                <button 
                    onClick={() => navigate('/machinery')}
                    style={{ 
                        backgroundColor: '#FFC107', 
                        color: 'black', 
                        padding: '15px 30px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontSize: '16px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <span style={{fontSize: '20px'}}>&#x1F69C;</span> Gestionează Utilaje
                </button>
                <button 
                    onClick={() => navigate('/inventory')}
                    style={{ 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        padding: '15px 30px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontSize: '16px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <span style={{fontSize: '20px'}}>&#x1F4E6;</span> Magazia Fermei
                </button>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h3>Sumar Parcele ({parcels.length})</h3>
                {parcels.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {parcels.map(parcel => (
                            <li key={parcel.id} style={{ background: '#f4f4f4', margin: '5px 0', padding: '10px', borderRadius: '3px', borderLeft: '4px solid #4CAF50' }}>
                                <strong>{parcel.name}</strong> ({parcel.cropType}) - {parcel.areaHectares.toFixed(2)} ha
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{color: '#666', fontStyle: 'italic'}}>Nu ai nicio parcelă înregistrată. Apasă pe butonul de mai sus pentru a merge la hartă și a adăuga una.</p>
                )}
            </div>
        </div>
    );
};

export default FarmerDashboard;