import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const FarmerDashboard = () => {
    // Inițializăm starea direct din localStorage. Funcția este executată o singură dată.
    const [user] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [parcels, setParcels] = useState([]);
    const navigate = useNavigate();

    const handleLogout = useCallback(async () => {
        try {
            await apiClient.post('/api/auth/logout'); // Apelăm endpoint-ul de logout de pe backend
        } catch (error) {
            console.error("Eroare la logout pe server:", error);
        } finally {
            localStorage.removeItem('user'); // Ștergem datele locale indiferent de rezultat
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        // Acum, verificăm doar dacă starea 'user' este validă. Dacă nu, redirecționăm.
        if (!user) {
            navigate('/login');
            return;
        }

        // Preluăm un sumar al parcelelor pentru afișare
        apiClient.get('/api/parcels')
            .then(response => {
                setParcels(response.data);
            })
            .catch(error => {
                console.error("Eroare la preluarea parcelelor:", error);
                // Dacă sesiunea a expirat, delogăm utilizatorul
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    handleLogout();
                }
            });
    }, [user, navigate, handleLogout]); // Adăugăm 'user' la dependențe, deoarece efectul depinde de el.

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h1>Salut, {user?.username}!</h1>
                <button onClick={handleLogout} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}>
                    Logout
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h2>Panou de control</h2>
                <p>De aici poți gestiona resursele fermei tale.</p>
                <button 
                    onClick={() => navigate('/map')}
                    style={{ 
                        backgroundColor: '#2196F3', 
                        color: 'white', 
                        padding: '15px 30px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontSize: '16px', 
                        cursor: 'pointer' 
                    }}
                >
                    &#x1F5FA; Gestionează Harta Parcelelor
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
                        cursor: 'pointer' 
                    }}
                >
                    &#x1F69C; Gestionează Utilaje
                </button>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h3>Sumar Parcele ({parcels.length})</h3>
                {parcels.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {parcels.map(parcel => (
                            <li key={parcel.id} style={{ background: '#f4f4f4', margin: '5px 0', padding: '10px', borderRadius: '3px' }}>
                                <strong>{parcel.name}</strong> ({parcel.cropType}) - {parcel.areaHectares.toFixed(2)} ha
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nu ai nicio parcelă înregistrată. Mergi la hartă pentru a adăuga una.</p>
                )}
            </div>
        </div>
    );
};

export default FarmerDashboard;