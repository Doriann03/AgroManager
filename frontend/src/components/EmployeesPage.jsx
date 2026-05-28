import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton'; // Importăm componenta BackButton

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'WORKER'
    });
    
    const [error, setError] = useState('');

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/farms/employees');
            setEmployees(response.data);
        } catch (err) {
            console.error("Eroare la preluarea angajaților:", err);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await apiClient.post('/api/farms/employees', formData);
            resetForm();
            await fetchEmployees();
        } catch (err) {
            console.error("Eroare la adăugarea angajatului:", err);
            setError(err.response?.data || 'A apărut o eroare.');
        }
    };

    const resetForm = () => {
        setFormData({ username: '', password: '', email: '', role: 'WORKER' });
        setShowForm(false);
        setError('');
    };

    const getRoleLabel = (role) => {
        switch(role) {
            case 'FARM_MANAGER': return 'Manager';
            case 'AGRONOMIST': return 'Agronom';
            case 'WORKER': return 'Muncitor';
            default: return role;
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: 'var(--primary-green)' }}>Managementul Echipei</h1>
                <BackButton />
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Angajații Fermei ({employees.length})</h3>
                    {!showForm && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Adaugă Angajat</button>
                    )}
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--light-gray)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h4 style={{marginTop: 0}}>Adaugă un Membru Nou în Echipă</h4>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                            <div style={{ flex: '1 1 150px' }}>
                                <label>Nume utilizator:*</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label>Parolă Temporară:*</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                            </div>
                            <div style={{ flex: '1 1 200px' }}>
                                <label>Email:</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label>Rol în Fermă:*</label>
                                <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                                    <option value="WORKER">Muncitor</option>
                                    <option value="AGRONOMIST">Agronom</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">Adaugă Angajat</button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>Anulează</button>
                        </div>
                    </form>
                )}

                {employees.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Nu există angajați înregistrați.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--primary-green)', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Nume Utilizator</th>
                                <th style={{ padding: '12px' }}>Email</th>
                                <th style={{ padding: '12px' }}>Rol</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, index) => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.username}</td>
                                    <td style={{ padding: '12px' }}>{emp.email || '-'}</td>
                                    <td style={{ padding: '12px' }}>{getRoleLabel(emp.role)}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>Șterge</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EmployeesPage;