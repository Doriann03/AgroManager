import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        farmName: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            await apiClient.post('/api/auth/register', formData);
            setMessage('Cont creat cu succes! Vei fi redirecționat către login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error("Eroare inregistrare:", err);
            if (err.response && err.response.data) {
                setError(err.response.data); // Mesajul de eroare din backend (ex: user existent)
            } else {
                setError('A apărut o eroare la înregistrare.');
            }
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Înregistrare Fermier Nou</h2>
            <form onSubmit={handleRegister} style={{ display: 'inline-block', textAlign: 'left', minWidth: '300px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Utilizator:</label><br/>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Parola:</label><br/>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email:</label><br/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Numele Fermei:</label><br/>
                    <input type="text" name="farmName" value={formData.farmName} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
                
                <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>Creează Cont</button>
                
                <button type="button" onClick={() => navigate('/login')} style={{ width: '100%', padding: '10px', backgroundColor: '#ccc', border: 'none' }}>Înapoi la Login</button>
            </form>
        </div>
    );
};

export default Register;