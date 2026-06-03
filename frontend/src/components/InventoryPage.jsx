import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const InventoryPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isManager = user?.role === 'FARM_MANAGER';
    const isAgronomist = user?.role === 'AGRONOMIST';

    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' sau 'requests'
    
    // State-uri Inventar
    const [inventory, setInventory] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newItemId, setNewItemId] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('FERTILIZER');
    const [newItemUnit, setNewItemUnit] = useState('L');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    // State-uri Cereri
    const [requests, setRequests] = useState([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [newRequest, setNewRequest] = useState({ 
        itemName: '', 
        itemCategory: 'FERTILIZER', 
        quantityRequested: '', 
        unitOfMeasure: 'L', 
        priority: 'MEDIUM' 
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchInventory = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/inventory');
            setInventory(response.data);
        } catch (err) {
            console.error("Eroare la preluarea magaziei:", err);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/inventory-requests');
            setRequests(response.data);
        } catch (err) {
            console.error("Eroare la preluarea cererilor:", err);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
        fetchRequests();
    }, [fetchInventory, fetchRequests]);

    // --- LOGICA INVENTAR ---
    const resetInventoryForm = () => {
        setNewItemId(null);
        setNewItemName('');
        setNewItemCategory('FERTILIZER');
        setNewItemUnit('L');
        setNewItemQuantity('');
        setNewItemPrice('');
        setShowForm(false);
        setError('');
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        const payload = {
            id: newItemId, name: newItemName, category: newItemCategory,
            unitOfMeasure: newItemUnit, quantityAvailable: parseFloat(newItemQuantity),
            unitPrice: newItemPrice ? parseFloat(newItemPrice) : 0
        };
        try {
            if (newItemId) await apiClient.put(`/api/inventory/${newItemId}`, payload);
            else await apiClient.post('/api/inventory', payload);
            fetchInventory();
            resetInventoryForm();
        } catch (err) {
            setError("Eroare la salvarea produsului.");
        }
    };

    const handleDeleteItem = async (id) => {
        if(window.confirm("Ștergi acest produs?")) {
            try {
                await apiClient.delete(`/api/inventory/${id}`);
                fetchInventory();
            } catch (err) { alert("Nu s-a putut șterge."); }
        }
    };

    // --- LOGICA CERERI ---
    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/api/inventory-requests', newRequest);
            fetchRequests();
            setNewRequest({ itemName: '', quantityRequested: '', unitOfMeasure: 'L', priority: 'MEDIUM' });
            setShowRequestForm(false);
            alert("Cererea a fost trimisă managerului!");
        } catch (err) { alert("Eroare la trimiterea cererii."); }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await apiClient.put(`/api/inventory-requests/${id}/status`, { status });
            fetchRequests();
        } catch (err) { alert("Eroare la actualizarea statusului."); }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'APPROVED': return { color: '#16a34a', fontWeight: 'bold' };
            case 'REJECTED': return { color: '#dc2626', fontWeight: 'bold' };
            default: return { color: '#d97706', fontWeight: 'bold' };
        }
    };

    const getPriorityStyle = (prio) => {
        switch(prio) {
            case 'HIGH': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            case 'LOW': return { backgroundColor: '#f0fdf4', color: '#166534' };
            default: return { backgroundColor: '#fef3c7', color: '#92400e' };
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: 'var(--primary-green)', margin: 0 }}>Gestiune Resurse</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Magazie, stocuri și cereri de aprovizionare.</p>
                </div>
                <BackButton />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <button 
                    onClick={() => setActiveTab('inventory')}
                    style={{ 
                        padding: '10px 20px', border: 'none', background: activeTab === 'inventory' ? 'var(--primary-green)' : 'transparent',
                        color: activeTab === 'inventory' ? 'white' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >📦 Stocuri Magazie</button>
                <button 
                    onClick={() => setActiveTab('requests')}
                    style={{ 
                        padding: '10px 20px', border: 'none', background: activeTab === 'requests' ? 'var(--primary-green)' : 'transparent',
                        color: activeTab === 'requests' ? 'white' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >📝 Cereri Aprovizionare</button>
            </div>

            {activeTab === 'inventory' ? (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Stocuri Curente</h3>
                        {isManager && !showForm && (
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Adaugă Produs</button>
                        )}
                    </div>

                    {showForm && (
                        <form onSubmit={handleSaveItem} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>NUME PRODUS</label>
                                    <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>CATEGORIE</label>
                                    <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <option value="FERTILIZER">Îngrășământ</option>
                                        <option value="PESTICIDE">Pesticid</option>
                                        <option value="SEED">Sămânță</option>
                                        <option value="FUEL">Combustibil</option>
                                        <option value="OTHER">Altele</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>CANTITATE</label>
                                    <input type="number" value={newItemQuantity} onChange={e => setNewItemQuantity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>UNITATE</label>
                                    <select value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <option value="L">Litri (L)</option>
                                        <option value="Kg">Kilograme (Kg)</option>
                                        <option value="Tone">Tone</option>
                                        <option value="Buc">Bucăți</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary">Salvează</button>
                                <button type="button" className="btn-secondary" onClick={resetInventoryForm}>Anulează</button>
                            </div>
                        </form>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '12px 10px' }}>Produs</th>
                                <th style={{ padding: '12px 10px' }}>Categorie</th>
                                <th style={{ padding: '12px 10px' }}>Stoc</th>
                                {isManager && <th style={{ padding: '12px 10px', textAlign: 'right' }}>Acțiuni</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px 10px', fontWeight: '700' }}>{item.name}</td>
                                    <td style={{ padding: '15px 10px' }}>{item.category}</td>
                                    <td style={{ padding: '15px 10px' }}>{item.quantityAvailable} {item.unitOfMeasure}</td>
                                    {isManager && (
                                        <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                                            <button onClick={() => { setNewItemId(item.id); setNewItemName(item.name); setNewItemQuantity(item.quantityAvailable); setShowForm(true); }} style={{ marginRight: '10px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>✏️</button>
                                            <button onClick={() => handleDeleteItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Cereri Aprovizionare</h3>
                        {isAgronomist && !showRequestForm && (
                            <button className="btn-primary" onClick={() => setShowRequestForm(true)}>+ Cerere Nouă</button>
                        )}
                    </div>

                    {showRequestForm && (
                        <form onSubmit={handleCreateRequest} style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>Trimite cerere către manager</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>CE AVEM NEVOIE?</label>
                                    <input type="text" placeholder="Ex: Azotat, Semințe porumb..." value={newRequest.itemName} onChange={e => setNewRequest({...newRequest, itemName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>CATEGORIE</label>
                                    <select value={newRequest.itemCategory} onChange={e => setNewRequest({...newRequest, itemCategory: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <option value="FERTILIZER">Îngrășământ</option>
                                        <option value="PESTICIDE">Pesticid</option>
                                        <option value="SEED">Sămânță</option>
                                        <option value="FUEL">Combustibil</option>
                                        <option value="OTHER">Altele</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>CANTITATE</label>
                                    <input type="number" value={newRequest.quantityRequested} onChange={e => setNewRequest({...newRequest, quantityRequested: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>UNITATE</label>
                                    <select value={newRequest.unitOfMeasure} onChange={e => setNewRequest({...newRequest, unitOfMeasure: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <option value="L">Litri (L)</option>
                                        <option value="Kg">Kilograme (Kg)</option>
                                        <option value="Tone">Tone</option>
                                        <option value="Buc">Bucăți</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>PRIORITATE</label>
                                    <select value={newRequest.priority} onChange={e => setNewRequest({...newRequest, priority: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <option value="LOW">Scăzută</option>
                                        <option value="MEDIUM">Medie</option>
                                        <option value="HIGH">Urgentă</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0284c7' }}>Trimite Cererea</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowRequestForm(false)}>Anulează</button>
                            </div>
                        </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {requests.length === 0 ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>Nu există cereri înregistrate.</p> : 
                        requests.map(req => (
                            <div key={req.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <strong style={{ fontSize: '16px' }}>{req.itemName}</strong>
                                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', ...getPriorityStyle(req.priority) }}>{req.priority}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                        Cantitate: {req.quantityRequested} {req.unitOfMeasure} | Categorie: {req.itemCategory} | Solicitat de: <strong>{req.requester?.username}</strong>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{new Date(req.dateCreated).toLocaleDateString('ro-RO')}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={getStatusStyle(req.status)}>{req.status}</div>
                                    {isManager && req.status === 'PENDING' && (
                                        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                            <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Aprobă</button>
                                            <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Respinge</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
