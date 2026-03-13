import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const MachineryPage = () => {
    const [machineryList, setMachineryList] = useState([]);
    const [formData, setFormData] = useState({ name: '', type: '', model: '', purchaseDate: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchMachinery = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/machinery');
            setMachineryList(response.data);
        } catch (err) {
            console.error("Eroare la preluarea utilajelor:", err);
            setError('Nu s-au putut încărca datele.');
        }
    }, []);

    useEffect(() => {
        fetchMachinery();
    }, [fetchMachinery]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.type) {
            setError('Numele și tipul sunt obligatorii.');
            return;
        }
        setError('');
        try {
            await apiClient.post('/api/machinery', formData);
            setFormData({ name: '', type: '', model: '', purchaseDate: '' }); // Reset form
            await fetchMachinery(); // Refresh list
        } catch (err) {
            console.error("Eroare la salvarea utilajului:", err);
            setError('Salvarea a eșuat.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Ești sigur că vrei să ștergi acest utilaj?')) {
            try {
                await apiClient.delete(`/api/machinery/${id}`);
                await fetchMachinery(); // Refresh list
            } catch (err) {
                console.error("Eroare la ștergerea utilajului:", err);
                setError('Ștergerea a eșuat.');
            }
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
            <button onClick={() => navigate('/farmer')} style={{ marginBottom: '20px' }}>&larr; Înapoi la Panou</button>
            <h1>Management Utilaje</h1>

            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Adaugă Utilaj Nou</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nume (ex: Tractor Fendt)" style={{ flex: 1, padding: '8px' }} />
                    <input name="type" value={formData.type} onChange={handleChange} placeholder="Tip (ex: Tractor)" style={{ flex: 1, padding: '8px' }} />
                    <input name="model" value={formData.model} onChange={handleChange} placeholder="Model (ex: 942 Vario)" style={{ flex: 1, padding: '8px' }} />
                    <input name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} style={{ flex: 1, padding: '8px' }} />
                    <button type="submit" style={{ padding: '8px 15px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>Adaugă</button>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>

            <h3>Flota Mea de Utilaje ({machineryList.length})</h3>
            {machineryList.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Nume</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Tip</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Model</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Data Achiziției</th>
                            <th style={{ padding: '10px' }}>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machineryList.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{m.name}</td>
                                <td style={{ padding: '10px' }}>{m.type}</td>
                                <td style={{ padding: '10px' }}>{m.model}</td>
                                <td style={{ padding: '10px' }}>{m.purchaseDate}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '16px' }}>&#x1F5D1;</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Nu ai niciun utilaj înregistrat.</p>
            )}
        </div>
    );
};

export default MachineryPage;