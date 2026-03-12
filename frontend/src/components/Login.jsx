import React, { useState } from 'react';
import axios from 'axios';
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
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username: username,
                password: password
            });

            console.log("Raspuns backend:", response.data);

            // Salvăm userul în localStorage (simplificat pentru moment)
            localStorage.setItem('user', JSON.stringify(response.data));

            // Redirecționare în funcție de rol
            const role = response.data.role;
            if (role === 'ADMIN') {
                navigate('/admin');
            } else if (role === 'FARMER') {
                navigate('/farmer');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error("Eroare login:", err);
            setError('Date incorecte sau eroare de server!');
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Autentificare AgroManager</h2>
            <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Utilizator:</label><br/>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Parola:</label><br/>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px' }}>Logare</button>
            </form>
        </div>
    );
};

export default Login;