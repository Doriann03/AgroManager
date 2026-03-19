import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const MachineryPage = () => {
    const [machineryList, setMachineryList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    // State pentru formular (folosit și pentru adăugare și pentru editare)
    const [formData, setFormData] = useState({ 
        id: null,
        name: '', 
        type: '', 
        model: '', 
        licensePlate: '',
        workHours: '',
        status: 'ACTIVE',
        purchaseDate: '' 
    });
    
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

    const handleEditClick = (machinery) => {
        setFormData({
            id: machinery.id,
            name: machinery.name || '',
            type: machinery.type || '',
            model: machinery.model || '',
            licensePlate: machinery.licensePlate || '',
            workHours: machinery.workHours || '',
            status: machinery.status || 'ACTIVE',
            purchaseDate: machinery.purchaseDate || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ id: null, name: '', type: '', model: '', licensePlate: '', workHours: '', status: 'ACTIVE', purchaseDate: '' });
        setShowForm(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.type) {
            setError('Numele și tipul sunt obligatorii.');
            return;
        }
        setError('');
        
        try {
            if (formData.id) {
                // Modificare utilaj existent
                await apiClient.put(`/api/machinery/${formData.id}`, formData);
            } else {
                // Adăugare utilaj nou
                await apiClient.post('/api/machinery', formData);
            }
            resetForm();
            await fetchMachinery(); 
        } catch (err) {
            console.error("Eroare la salvarea utilajului:", err);
            setError('Salvarea a eșuat.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Ești sigur că vrei să ștergi acest utilaj? Toate activitățile asociate ar putea fi afectate.')) {
            try {
                await apiClient.delete(`/api/machinery/${id}`);
                await fetchMachinery(); 
            } catch (err) {
                console.error("Eroare la ștergerea utilajului:", err);
                alert('Ștergerea a eșuat.');
            }
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'ACTIVE': return { backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' };
            case 'REPAIR': return { backgroundColor: '#fff8e1', color: '#f57f17', border: '1px solid #ffecb3' };
            case 'INACTIVE': return { backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2' };
            default: return {};
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: 'var(--primary-green)' }}>Parcul Auto (Utilaje)</h1>
                <button 
                    onClick={() => navigate('/farmer')} 
                    className="btn-secondary"
                >
                    &#8592; Înapoi la Dashboard
                </button>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Flota Mea ({machineryList.length})</h3>
                    {!showForm && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Adaugă Utilaj</button>
                    )}
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--light-gray)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{marginTop: 0, color: 'var(--primary-green)'}}>{formData.id ? 'Modifică Utilaj' : 'Adaugă Utilaj Nou'}</h4>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{fontSize: '14px', color: '#555'}}>Nume (Ex: Tractor Fendt):*</label>
                                <input name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{fontSize: '14px', color: '#555'}}>Tip (Ex: Tractor, Combină):*</label>
                                <input name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{fontSize: '14px', color: '#555'}}>Model (Ex: 942 Vario):</label>
                                <input name="model" value={formData.model} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{fontSize: '14px', color: '#555'}}>Număr Înmatriculare:</label>
                                <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{fontSize: '14px', color: '#555'}}>Ore Funcționare:</label>
                                <input name="workHours" type="number" value={formData.workHours} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{fontSize: '14px', color: '#555'}}>Status:</label>
                                <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                                    <option value="ACTIVE">Activ</option>
                                    <option value="REPAIR">În reparație</option>
                                    <option value="INACTIVE">Inactiv</option>
                                </select>
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{fontSize: '14px', color: '#555'}}>Data Achiziției:</label>
                                <input name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>{formData.id ? 'Salvează Modificările' : 'Adaugă Utilajul'}</button>
                            <button type="button" className="btn-secondary" onClick={resetForm} style={{ padding: '10px 20px' }}>Anulează</button>
                        </div>
                    </form>
                )}

                {machineryList.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Nu aveți niciun utilaj înregistrat.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--primary-green)', color: 'white', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderRadius: '4px 0 0 0' }}>Nume</th>
                                    <th style={{ padding: '12px' }}>Tip & Model</th>
                                    <th style={{ padding: '12px' }}>Nr. Înmatriculare</th>
                                    <th style={{ padding: '12px' }}>Ore Funcționare</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Data Achiziției</th>
                                    <th style={{ padding: '12px', borderRadius: '0 4px 0 0', textAlign: 'center' }}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {machineryList.map((m, index) => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{m.name}</td>
                                        <td style={{ padding: '12px' }}>{m.type} {m.model ? `- ${m.model}` : ''}</td>
                                        <td style={{ padding: '12px' }}>{m.licensePlate || '-'}</td>
                                        <td style={{ padding: '12px' }}>{m.workHours ? `${m.workHours} ore` : '-'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ ...getStatusStyle(m.status), padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {m.status === 'ACTIVE' ? 'Activ' : m.status === 'REPAIR' ? 'În Reparație' : 'Inactiv'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>{m.purchaseDate || '-'}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            <button 
                                                onClick={() => handleEditClick(m)}
                                                style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }}
                                            >
                                                Editează
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(m.id)}
                                                style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Șterge
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MachineryPage;