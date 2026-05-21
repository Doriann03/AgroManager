import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        farmName: '',
        farmAddress: '',
        farmContactEmail: ''
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

        // Setăm email-ul fermei să fie același cu email-ul managerului, dacă nu este completat
        const payload = {
            ...formData,
            farmContactEmail: formData.farmContactEmail || formData.email
        };

        try {
            await apiClient.post('/api/auth/register', payload);
            setMessage('Cont și fermă create cu succes! Vei fi redirecționat către login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error("Eroare inregistrare:", err);
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('A apărut o eroare la înregistrare.');
            }
        }
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px'
    };

    const formStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        boxSizing: 'border-box',
        border: '1px solid #ccc',
        borderRadius: '4px'
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleRegister} style={formStyle}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary-green)' }}>Înregistrează o Fermă Nouă</h2>
                <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>Creează contul tău de Manager și adaugă ferma pe care o administrezi.</p>
                
                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h4 style={{marginTop: 0}}>Detalii Cont Manager</h4>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Nume utilizator:*</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Parola:*</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email Manager:*</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
                    <h4 style={{marginTop: 0}}>Detalii Fermă</h4>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Numele Fermei:*</label>
                        <input type="text" name="farmName" value={formData.farmName} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Adresa Fermei:</label>
                        <input type="text" name="farmAddress" value={formData.farmAddress} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email Contact Fermă (opțional):</label>
                        <input type="email" name="farmContactEmail" value={formData.farmContactEmail} onChange={handleChange} placeholder="Dacă e gol, se folosește email-ul managerului" style={inputStyle} />
                    </div>
                </div>
                
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
                
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '10px' }}>Creează Cont și Fermă</button>
                <button type="button" onClick={() => navigate('/login')} className="btn-secondary" style={{ width: '100%', padding: '10px', marginTop: '10px' }}>Înapoi la Login</button>
            </form>
        </div>
    );
};

export default Register;