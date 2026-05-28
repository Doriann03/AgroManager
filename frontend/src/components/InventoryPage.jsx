import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton'; // Importăm componenta BackButton

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    const [newItemId, setNewItemId] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('FERTILIZER');
    const [newItemUnit, setNewItemUnit] = useState('L');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    
    const [error, setError] = useState('');

    const fetchInventory = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/inventory');
            setInventory(response.data);
        } catch (err) {
            console.error("Eroare la preluarea magaziei:", err);
            setError("Nu s-au putut încărca stocurile.");
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const resetForm = () => {
        setNewItemId(null);
        setNewItemName('');
        setNewItemCategory('FERTILIZER');
        setNewItemUnit('L');
        setNewItemQuantity('');
        setNewItemPrice('');
        setShowForm(false);
        setError('');
    };

    const handleEditItem = (item) => {
        setNewItemId(item.id);
        setNewItemName(item.name);
        setNewItemCategory(item.category);
        setNewItemUnit(item.unitOfMeasure);
        setNewItemQuantity(item.quantityAvailable);
        setNewItemPrice(item.unitPrice || '');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        if (!newItemName || !newItemQuantity || !newItemUnit) {
            setError("Numele, unitatea și cantitatea sunt obligatorii!");
            return;
        }

        const itemPayload = {
            id: newItemId,
            name: newItemName,
            category: newItemCategory,
            unitOfMeasure: newItemUnit,
            quantityAvailable: parseFloat(newItemQuantity),
            unitPrice: newItemPrice ? parseFloat(newItemPrice) : 0
        };

        try {
            if (newItemId) {
                await apiClient.put(`/api/inventory/${newItemId}`, itemPayload);
            } else {
                await apiClient.post('/api/inventory', itemPayload);
            }
            
            await fetchInventory();
            resetForm();
        } catch (err) {
            console.error("Eroare la salvarea produsului:", err);
            setError("Nu s-a putut salva produsul.");
        }
    };

    const handleDeleteItem = async (id) => {
        if(window.confirm("Sigur dorești să ștergi acest produs din magazie?")) {
            try {
                await apiClient.delete(`/api/inventory/${id}`);
                await fetchInventory();
            } catch (err) {
                console.error("Eroare la stergere:", err);
                alert("Produsul nu a putut fi șters. Poate este deja folosit în activități trecute.");
            }
        }
    };

    const getCategoryDetails = (cat) => {
        switch(cat) {
            case 'SEED': return { icon: '🌱', label: 'Sămânță' };
            case 'FERTILIZER': return { icon: '🧪', label: 'Îngrășământ' };
            case 'PESTICIDE': return { icon: '☠️', label: 'Pesticid' };
            case 'FUEL': return { icon: '⛽', label: 'Combustibil' };
            default: return { icon: '📦', label: 'Altele' };
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: 'var(--primary-green)' }}>Magazia Fermei</h1>
                <BackButton />
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Stocuri Curente ({inventory.length})</h3>
                    {!showForm && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Adaugă Produs Nou</button>
                    )}
                </div>

                {showForm && (
                    <form onSubmit={handleSaveItem} style={{ backgroundColor: 'var(--light-gray)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{marginTop: 0, color: 'var(--primary-green)'}}>{newItemId ? 'Modifică Produs' : 'Intrare Nouă în Magazie'}</h4>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label>Nume Produs (Ex: Uree 46%):</label>
                                <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label>Categorie:</label>
                                <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                                    <option value="FERTILIZER">Îngrășământ</option>
                                    <option value="PESTICIDE">Pesticid</option>
                                    <option value="SEED">Sămânță</option>
                                    <option value="FUEL">Combustibil</option>
                                    <option value="OTHER">Altele</option>
                                </select>
                            </div>
                            <div style={{ flex: '1 1 100px' }}>
                                <label>Cantitate:</label>
                                <input type="number" step="0.01" value={newItemQuantity} onChange={e => setNewItemQuantity(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
                            </div>
                            <div style={{ flex: '1 1 80px' }}>
                                <label>Unitate Măsură:</label>
                                <select value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                                    <option value="L">Litri (L)</option>
                                    <option value="Kg">Kilograme (Kg)</option>
                                    <option value="Tone">Tone</option>
                                    <option value="Buc">Bucăți</option>
                                </select>
                            </div>
                            <div style={{ flex: '1 1 120px' }}>
                                <label>Preț per unitate (RON):</label>
                                <input type="number" step="0.01" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Opțional" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>{newItemId ? 'Salvează Modificările' : 'Salvează în Magazie'}</button>
                            <button type="button" className="btn-secondary" onClick={resetForm} style={{ padding: '10px 20px' }}>Anulează</button>
                        </div>
                    </form>
                )}

                {inventory.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Magazia este goală. Adaugă un produs pentru a-l putea folosi în lucrările agricole.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--primary-green)', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderRadius: '4px 0 0 0' }}>Categorie</th>
                                <th style={{ padding: '12px' }}>Nume Produs</th>
                                <th style={{ padding: '12px' }}>Stoc Disponibil</th>
                                <th style={{ padding: '12px' }}>Preț/Unitate</th>
                                <th style={{ padding: '12px', borderRadius: '0 4px 0 0', textAlign: 'center' }}>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item, index) => {
                                const catDetails = getCategoryDetails(item.category);
                                const isLowStock = item.quantityAvailable < 10; 
                                
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                                        <td style={{ padding: '12px' }}>{catDetails.icon} {catDetails.label}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.name}</td>
                                        <td style={{ padding: '12px', color: isLowStock ? '#d32f2f' : 'inherit', fontWeight: isLowStock ? 'bold' : 'normal' }}>
                                            {item.quantityAvailable} {item.unitOfMeasure}
                                            {isLowStock && <span style={{fontSize: '12px', marginLeft: '5px'}}> (Stoc redus!)</span>}
                                        </td>
                                        <td style={{ padding: '12px' }}>{item.unitPrice ? `${item.unitPrice} RON` : '-'}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            <button 
                                                onClick={() => handleEditItem(item)}
                                                style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }}
                                            >
                                                Editează
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteItem(item.id)}
                                                style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Șterge
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default InventoryPage;