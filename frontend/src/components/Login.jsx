import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await apiClient.post('/api/auth/login', {
                username: username.trim(),
                password: password
            });

            localStorage.setItem('user', JSON.stringify(response.data));

            // Redirecționare în funcție de noul sistem de roluri
            const role = response.data.role;
            switch (role) {
                case 'SUPER_ADMIN':
                    navigate('/super-admin');
                    break;
                case 'FARM_MANAGER':
                    navigate('/manager');
                    break;
                case 'AGRONOMIST':
                    navigate('/agronomist');
                    break;
                case 'WORKER':
                    navigate('/worker');
                    break;
                default:
                    navigate('/'); // Fallback
                    break;
            }

        } catch (err) {
            console.error("Eroare login:", err);
            setError('Date incorecte sau eroare de server!');
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            backgroundColor: 'var(--bg-color)',
            padding: '20px'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px', boxShadow: 'var(--box-shadow-md)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚜</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Autentificare</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>AgroManager - Management Agricol Digital</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted)' }}>UTILIZATOR</label>
                        <input 
                            type="text" 
                            placeholder="Nume utilizator"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted)' }}>PAROLĂ</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center', border: '1px solid #fee2e2' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '20px' }}>
                        Intră în cont
                    </button>
                    
                    <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px' }}>Nu aveți încă un cont?</p>
                        <button 
                            type="button" 
                            onClick={() => navigate('/register')} 
                            className="btn-secondary"
                            style={{ width: '100%' }}
                        >
                            Înregistrează-ți Ferma
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
