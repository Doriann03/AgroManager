import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const categoryLabels = {
    SEED: 'Samanta',
    FERTILIZER: 'Ingrasamant',
    HERBICIDE: 'Erbicid',
    FUNGICIDE: 'Fungicid',
    INSECTICIDE: 'Insecticid',
    PESTICIDE: 'Pesticid',
    FUEL: 'Combustibil',
    SPARE_PARTS: 'Piese utilaje',
    OTHER: 'Altele'
};

const categoryOptions = [
    'FERTILIZER',
    'HERBICIDE',
    'FUNGICIDE',
    'INSECTICIDE',
    'PESTICIDE',
    'SEED',
    'FUEL',
    'SPARE_PARTS',
    'OTHER'
];

const moneyFormatter = new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON'
});

const InventoryPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isManager = user?.role === 'FARM_MANAGER';
    const isAgronomist = user?.role === 'AGRONOMIST';

    const [activeTab, setActiveTab] = useState('inventory');
    const [inventory, setInventory] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newItemId, setNewItemId] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('FERTILIZER');
    const [newItemUnit, setNewItemUnit] = useState('L');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemThreshold, setNewItemThreshold] = useState('');

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

    const fetchInventory = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/inventory');
            setInventory(response.data);
        } catch (err) {
            console.error('Eroare la preluarea magaziei:', err);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/inventory-requests');
            setRequests(response.data);
        } catch (err) {
            console.error('Eroare la preluarea cererilor:', err);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
        fetchRequests();
    }, [fetchInventory, fetchRequests]);

    const resetInventoryForm = () => {
        setNewItemId(null);
        setNewItemName('');
        setNewItemCategory('FERTILIZER');
        setNewItemUnit('L');
        setNewItemQuantity('');
        setNewItemPrice('');
        setNewItemThreshold('');
        setShowForm(false);
        setError('');
    };

    const openEditForm = (item) => {
        setNewItemId(item.id);
        setNewItemName(item.name);
        setNewItemCategory(item.category);
        setNewItemUnit(item.unitOfMeasure);
        setNewItemQuantity(item.quantityAvailable);
        setNewItemPrice(item.unitPrice ?? '');
        setNewItemThreshold(item.minimumStockThreshold ?? 0);
        setShowForm(true);
        setError('');
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();

        const payload = {
            name: newItemName,
            category: newItemCategory,
            unitOfMeasure: newItemUnit,
            quantityAvailable: parseFloat(newItemQuantity),
            unitPrice: newItemPrice ? parseFloat(newItemPrice) : 0,
            minimumStockThreshold: newItemThreshold ? parseFloat(newItemThreshold) : 0
        };

        try {
            if (newItemId) {
                await apiClient.put(`/api/inventory/${newItemId}`, payload);
            } else {
                await apiClient.post('/api/inventory', payload);
            }
            await fetchInventory();
            resetInventoryForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la salvarea produsului.');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Stergi acest produs?')) return;

        try {
            await apiClient.delete(`/api/inventory/${id}`);
            await fetchInventory();
        } catch (err) {
            alert('Nu s-a putut sterge.');
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/api/inventory-requests', newRequest);
            await fetchRequests();
            setNewRequest({ itemName: '', itemCategory: 'FERTILIZER', quantityRequested: '', unitOfMeasure: 'L', priority: 'MEDIUM' });
            setShowRequestForm(false);
            alert('Cererea a fost trimisa managerului.');
        } catch (err) {
            alert('Eroare la trimiterea cererii.');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await apiClient.put(`/api/inventory-requests/${id}/status`, { status });
            await fetchRequests();
        } catch (err) {
            alert('Eroare la actualizarea statusului.');
        }
    };

    const isLowStock = (item) => {
        const threshold = item.minimumStockThreshold ?? 0;
        return item.quantityAvailable <= threshold;
    };

    const statusBadge = (item) => {
        if (isLowStock(item)) {
            return (
                <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold' }}>
                    Stoc redus
                </span>
            );
        }

        return (
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold' }}>
                OK
            </span>
        );
    };

    const getUnitPrice = (item) => Number(item.unitPrice || 0);

    const getStockValue = (item) => {
        const quantity = Number(item.quantityAvailable || 0);
        return quantity * getUnitPrice(item);
    };

    const totalStockValue = inventory.reduce((sum, item) => sum + getStockValue(item), 0);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { color: '#16a34a', fontWeight: 'bold' };
            case 'REJECTED': return { color: '#dc2626', fontWeight: 'bold' };
            default: return { color: '#d97706', fontWeight: 'bold' };
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'HIGH': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            case 'LOW': return { backgroundColor: '#f0fdf4', color: '#166534' };
            default: return { backgroundColor: '#fef3c7', color: '#92400e' };
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header-left">
                    <BackButton />
                    <div>
                        <h1 className="page-title">Magazie si stocuri</h1>
                        <p className="page-subtitle">Consumabile, preturi unitare, valori de stoc si cereri de aprovizionare.</p>
                    </div>
                </div>
            </div>

            <div className="metric-grid" style={{ marginBottom: '20px' }}>
                <SummaryCard label="Produse in magazie" value={inventory.length} />
                <SummaryCard label="Stocuri reduse" value={inventory.filter(isLowStock).length} />
                <SummaryCard label="Valoare totala stoc" value={moneyFormatter.format(totalStockValue)} />
            </div>

            <div className="toolbar-tabs">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`tab-button ${activeTab === 'inventory' ? 'is-active' : ''}`}
                >
                    Stocuri Magazie
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`tab-button ${activeTab === 'requests' ? 'is-active' : ''}`}
                >
                    Cereri Aprovizionare
                </button>
            </div>

            {activeTab === 'inventory' ? (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Stocuri Curente</h3>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                                Valoare totala stoc: <strong style={{ color: 'var(--text-main)' }}>{moneyFormatter.format(totalStockValue)}</strong>
                            </div>
                        </div>
                        {isManager && !showForm && (
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Adauga Produs</button>
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
                                        {categoryOptions.map(category => (
                                            <option key={category} value={category}>{categoryLabels[category]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>CANTITATE</label>
                                    <input type="number" min="0" step="0.01" value={newItemQuantity} onChange={e => setNewItemQuantity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>PRAG MINIM</label>
                                    <input type="number" min="0" step="0.01" value={newItemThreshold} onChange={e => setNewItemThreshold(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>UNITATE</label>
                                    <select value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <option value="L">Litri (L)</option>
                                        <option value="Kg">Kilograme (Kg)</option>
                                        <option value="Tone">Tone</option>
                                        <option value="Buc">Bucati</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>PRET UNITAR</label>
                                    <input type="number" min="0" step="0.01" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>
                            {error && <p style={{ color: '#dc2626', margin: '0 0 12px 0' }}>{error}</p>}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary">Salveaza</button>
                                <button type="button" className="btn-secondary" onClick={resetInventoryForm}>Anuleaza</button>
                            </div>
                        </form>
                    )}

                    <div className="table-wrap">
                    <table className="data-table" style={{ minWidth: '960px' }}>
                        <thead>
                            <tr>
                                <th>Produs</th>
                                <th>Categorie</th>
                                <th>Stoc</th>
                                <th>Pret/unitate</th>
                                <th>Valoare stoc</th>
                                <th>Prag minim</th>
                                <th>Status</th>
                                {isManager && <th style={{ textAlign: 'right' }}>Actiuni</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id}>
                                    <td><strong style={{ color: 'var(--text-main)' }}>{item.name}</strong></td>
                                    <td>{categoryLabels[item.category] || item.category}</td>
                                    <td>{item.quantityAvailable} {item.unitOfMeasure}</td>
                                    <td><strong>{moneyFormatter.format(getUnitPrice(item))}</strong></td>
                                    <td><strong>{moneyFormatter.format(getStockValue(item))}</strong></td>
                                    <td>{item.minimumStockThreshold ?? 0} {item.unitOfMeasure}</td>
                                    <td>{statusBadge(item)}</td>
                                    {isManager && (
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-secondary" onClick={() => openEditForm(item)} style={{ padding: '6px 10px', fontSize: '12px', marginRight: '8px' }}>Edit</button>
                                            <button className="btn-danger" onClick={() => handleDeleteItem(item.id)} style={{ padding: '6px 10px', fontSize: '12px' }}>Sterge</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Cereri Aprovizionare</h3>
                        {isAgronomist && !showRequestForm && (
                            <button className="btn-primary" onClick={() => setShowRequestForm(true)}>+ Cerere Noua</button>
                        )}
                    </div>

                    {showRequestForm && (
                        <form onSubmit={handleCreateRequest} style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>Trimite cerere catre manager</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>CE AVEM NEVOIE?</label>
                                    <input type="text" placeholder="Ex: Azotat, seminte porumb..." value={newRequest.itemName} onChange={e => setNewRequest({...newRequest, itemName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>CATEGORIE</label>
                                    <select value={newRequest.itemCategory} onChange={e => setNewRequest({...newRequest, itemCategory: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        {categoryOptions.map(category => (
                                            <option key={category} value={category}>{categoryLabels[category]}</option>
                                        ))}
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
                                        <option value="Buc">Bucati</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>PRIORITATE</label>
                                    <select value={newRequest.priority} onChange={e => setNewRequest({...newRequest, priority: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <option value="LOW">Scazuta</option>
                                        <option value="MEDIUM">Medie</option>
                                        <option value="HIGH">Urgenta</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0284c7' }}>Trimite Cererea</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowRequestForm(false)}>Anuleaza</button>
                            </div>
                        </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {requests.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Nu exista cereri inregistrate.</p>
                        ) : requests.map(req => (
                            <div key={req.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <strong style={{ fontSize: '16px' }}>{req.itemName}</strong>
                                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', ...getPriorityStyle(req.priority) }}>{req.priority}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                        Cantitate: {req.quantityRequested} {req.unitOfMeasure} | Categorie: {categoryLabels[req.itemCategory] || req.itemCategory} | Solicitat de: <strong>{req.requester?.username}</strong>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{new Date(req.dateCreated).toLocaleDateString('ro-RO')}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={getStatusStyle(req.status)}>{req.status}</div>
                                    {isManager && req.status === 'PENDING' && (
                                        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                            <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Aproba</button>
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

const SummaryCard = ({ label, value }) => (
    <div className="metric-card">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
    </div>
);

export default InventoryPage;
