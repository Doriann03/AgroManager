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
                username: username,
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

    const loginContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5'
    };

    const formStyle = {
        padding: '40px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '350px'
    };

    return (
        <div style={loginContainerStyle}>
            <div style={formStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Autentificare AgroManager</h2>
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Utilizator:</label><br/>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Parola:</label><br/>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                    >
                        Logare
                    </button>
                    
                    <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <p style={{ margin: '0 0 10px 0' }}>Nu ai cont?</p>
                        <button 
                            type="button" 
                            onClick={() => navigate('/register')} 
                            style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Înregistrează-te ca Manager
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;