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

    const labelStyle = { 
        display: 'block', 
        fontSize: '12px', 
        fontWeight: '700', 
        marginBottom: '6px', 
        color: 'var(--text-muted)',
        textTransform: 'uppercase'
    };
    
    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        marginBottom: '15px'
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            backgroundColor: 'var(--bg-color)',
            padding: '40px 20px'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '40px', boxShadow: 'var(--box-shadow-md)' }}>
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌾</div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-green)', margin: 0 }}>Înregistrare Fermă</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>Începeți digitalizarea fermei dumneavoastră astăzi.</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '2px solid var(--primary-green)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>Cont Manager</h3>
                            
                            <label style={labelStyle}>UTILIZATOR *</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required style={inputStyle} placeholder="ex: ionpopescu" />
                            
                            <label style={labelStyle}>PAROLĂ *</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} placeholder="••••••••" />
                            
                            <label style={labelStyle}>EMAIL MANAGER *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="manager@ferma.ro" />
                        </div>

                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '2px solid var(--primary-green)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-main)' }}>Detalii Fermă</h3>
                            
                            <label style={labelStyle}>NUME FERMĂ *</label>
                            <input type="text" name="farmName" value={formData.farmName} onChange={handleChange} required style={inputStyle} placeholder="ex: Ferma Agricola S.R.L." />
                            
                            <label style={labelStyle}>ADRESĂ / LOCALIZARE</label>
                            <input type="text" name="farmAddress" value={formData.farmAddress} onChange={handleChange} style={inputStyle} placeholder="Județ, Localitate..." />
                            
                            <label style={labelStyle}>EMAIL CONTACT (OPȚIONAL)</label>
                            <input type="email" name="farmContactEmail" value={formData.farmContactEmail} onChange={handleChange} style={inputStyle} placeholder="office@ferma.ro" />
                        </div>
                    </div>
                    
                    {error && (
                        <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', margin: '20px 0', textAlign: 'center', border: '1px solid #fee2e2' }}>
                            {error}
                        </div>
                    )}
                    
                    {message && (
                        <div style={{ padding: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', fontSize: '13px', margin: '20px 0', textAlign: 'center', border: '1px solid #dcfce7' }}>
                            {message}
                        </div>
                    )}
                    
                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '16px', padding: '14px' }}>
                            Creează Cont și Fermă
                        </button>
                        <button type="button" onClick={() => navigate('/login')} className="btn-secondary" style={{ width: '100%', padding: '12px' }}>
                            Am deja cont, mergi la Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
