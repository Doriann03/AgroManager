import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const getStatusBadge = (status) => {
    switch(status) {
        case 'DISPONIBIL': return <span style={{backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>✅ Disponibil</span>;
        case 'IN_CURSA': return <span style={{backgroundColor: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>🚜 În Cursă</span>;
        case 'IN_SERVICE': return <span style={{backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>🔧 În Service</span>;
        default: return <span style={{backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}>{status}</span>;
    }
};

const MachineryPage = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isReadOnly = currentUser?.role === 'AGRONOMIST';
    const [machineryList, setMachineryList] = useState([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedMachinery, setSelectedMachinery] = useState(null);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    const [formData, setFormData] = useState({ 
        id: null, name: '', type: 'TRACTOR', model: '', licensePlate: '',
        totalHours: 0, maintenanceIntervalHours: 250
    });
    
    const [maintenanceData, setMaintenanceData] = useState({
        date: new Date().toISOString().slice(0,10), description: '', cost: '', hoursAtMaintenance: ''
    });

    const fetchMachinery = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/machinery');
            setMachineryList(response.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        fetchMachinery();
    }, [fetchMachinery]);

    const handleOpenAddForm = () => {
        setFormData({ 
            id: null, name: '', type: 'TRACTOR', model: '', licensePlate: '',
            totalHours: 0, maintenanceIntervalHours: 250
        });
        setShowFormModal(true);
    };

    const handleOpenEditForm = (machinery) => {
        setFormData({
            id: machinery.id,
            name: machinery.name,
            type: machinery.type,
            model: machinery.model || '',
            licensePlate: machinery.licensePlate || '',
            totalHours: machinery.totalHours || 0,
            maintenanceIntervalHours: machinery.maintenanceIntervalHours || 250
        });
        setShowFormModal(true);
    };

    const handleSaveMachinery = async (e) => {
        e.preventDefault();
        const payload = { ...formData, totalHours: Number(formData.totalHours), maintenanceIntervalHours: Number(formData.maintenanceIntervalHours) };
        try {
            if (formData.id) {
                await apiClient.put(`/api/machinery/${formData.id}`, payload);
            } else {
                await apiClient.post('/api/machinery', payload);
            }
            setShowFormModal(false);
            fetchMachinery();
        } catch (err) { console.error(err); }
    };

    const handleSaveMaintenance = async (e) => {
        e.preventDefault();
        if (!selectedMachinery) return;
        const payload = { ...maintenanceData, cost: Number(maintenanceData.cost), hoursAtMaintenance: Number(maintenanceData.hoursAtMaintenance) };
        try {
            const response = await apiClient.post(`/api/machinery/${selectedMachinery.id}/maintenance-logs`, payload);
            setShowMaintenanceModal(false);
            setSelectedMachinery(prev => ({...prev, maintenanceLogs: [...(prev.maintenanceLogs || []), response.data]}));
            fetchMachinery();
            setMaintenanceData({ date: new Date().toISOString().slice(0,10), description: '', cost: '', hoursAtMaintenance: '' });
        } catch (err) { console.error(err); }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm("Ștergi acest utilaj?")) {
            try {
                await apiClient.delete(`/api/machinery/${id}`);
                fetchMachinery();
            } catch(err) { alert("Ștergerea a eșuat.")}
        }
    };

    const MaintenanceProgressBar = ({ total, next, interval }) => {
        if (!total || !next || !interval) return <div style={{fontSize: '11px', color: '#94a3b8'}}>Date mentenanță incomplete</div>;
        const lastMaintHours = next - interval;
        const hoursSinceMaint = total - lastMaintHours;
        const progress = Math.min((hoursSinceMaint / interval) * 100, 100);
        const color = progress > 90 ? '#ef4444' : progress > 70 ? '#f97316' : '#22c55e';
        
        return (
             <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, backgroundColor: color, height: '10px', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: 'var(--primary-green)', margin: 0 }}>
                        {isReadOnly ? 'Vizualizare Flota Utilaje' : 'Gestiune Flota Utilaje'}
                    </h1>
                    {isReadOnly && (
                        <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
                            Modul consultare: stare, ore de functionare si jurnal de service.
                        </p>
                    )}
                </div>
                <BackButton />
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                 <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                    <h3 style={{ margin: 0 }}>Flota Mea ({machineryList.length})</h3>
                    {!isReadOnly && <button className="btn-primary" onClick={handleOpenAddForm}>+ Utilaj Nou</button>}
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '15px' }}>UTILAJ</th>
                                <th style={{ padding: '15px' }}>TIP</th>
                                <th style={{ padding: '15px' }}>STATUS</th>
                                <th style={{ padding: '15px' }}>ORE MOTOR</th>
                                <th style={{ padding: '15px', minWidth: '200px' }}>PROGRES MENTENANȚĂ</th>
                                <th style={{ padding: '15px', textAlign: 'right' }}>ACȚIUNI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machineryList.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{m.name} {m.model ? `- ${m.model}` : ''}</td>
                                    <td style={{ padding: '15px' }}>{m.type}</td>
                                    <td style={{ padding: '15px' }}>{getStatusBadge(m.status)}</td>
                                    <td style={{ padding: '15px', fontWeight: '600' }}>{m.totalHours || 0} ore</td>
                                    <td style={{ padding: '15px' }}>
                                        <MaintenanceProgressBar total={m.totalHours} next={m.nextMaintenanceHours} interval={m.maintenanceIntervalHours} />
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Revizie la {m.nextMaintenanceHours || '?'} ore</div>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        {!isReadOnly && (
                                            <button onClick={() => handleOpenEditForm(m)} style={{marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}} title="Editeaza">Editeaza</button>
                                        )}
                                        <button className="btn-secondary" onClick={() => { setSelectedMachinery(m); setShowMaintenanceModal(true); }}>
                                            {isReadOnly ? 'Jurnal service' : 'Detalii & Service'}
                                        </button>
                                        {!isReadOnly && (
                                            <button onClick={() => handleDelete(m.id)} style={{marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px'}} title="Sterge">Sterge</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* MODAL PENTRU ADĂUGARE/EDITARE UTILAJ */}
            {showFormModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div className="card" style={{width: '600px', backgroundColor: 'white', padding: '30px'}}>
                        <h2 style={{marginTop: 0, color: 'var(--primary-green)'}}>{formData.id ? 'Editare Utilaj' : 'Adăugare Utilaj Nou'}</h2>
                        <form onSubmit={handleSaveMachinery}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold'}}>NUME UTILAJ</label>
                                    <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}} required />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold'}}>TIP</label>
                                    <select name="type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}>
                                        <option value="TRACTOR">Tractor</option>
                                        <option value="COMBINA">Combină</option>
                                        <option value="SEMANATOARE">Semănătoare</option>
                                        <option value="PLUG">Plug</option>
                                        <option value="DISC">Disc</option>
                                        <option value="PULVERIZATOR">Pulverizator</option>
                                        <option value="ALTELE">Altele</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold'}}>MODEL</label>
                                    <input name="model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold'}}>NR. ÎNMATRICULARE</label>
                                    <input name="licensePlate" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold'}}>ORE MOTOR CURENTE</label>
                                    <input name="totalHours" type="number" value={formData.totalHours} onChange={e => setFormData({...formData, totalHours: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                                </div>
                                <div>
                                    <label style={{fontSize: '12px', fontWeight: 'bold'}}>INTERVAL REVIZIE (ORE)</label>
                                    <input name="maintenanceIntervalHours" type="number" value={formData.maintenanceIntervalHours} onChange={e => setFormData({...formData, maintenanceIntervalHours: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button type="submit" className="btn-primary">Salvează Utilaj</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowFormModal(false)}>Anulează</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PENTRU DETALII & JURNAL SERVICE */}
            {showMaintenanceModal && selectedMachinery && (
                 <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div className="card" style={{width: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white', padding: '30px', position: 'relative'}}>
                        <button onClick={() => setShowMaintenanceModal(false)} style={{position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b'}}>×</button>
                        <h2 style={{ marginTop: 0, color: 'var(--primary-green)' }}>Jurnal Service: {selectedMachinery.name}</h2>
                        
                        <div style={{flex: '1', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                                <thead>
                                    <tr style={{borderBottom: '2px solid #e2e8f0', color: '#64748b'}}>
                                        <th style={{padding: '10px'}}>DATA</th>
                                        <th style={{padding: '10px'}}>DESCRIERE INTERVENȚIE</th>
                                        <th style={{padding: '10px'}}>COST</th>
                                        <th style={{padding: '10px'}}>ORE MOTOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!selectedMachinery.maintenanceLogs || selectedMachinery.maintenanceLogs.length === 0) ? (
                                        <tr>
                                            <td colSpan="4" style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic'}}>Nu există înregistrări în jurnalul de service.</td>
                                        </tr>
                                    ) : (
                                        selectedMachinery.maintenanceLogs.map(log => (
                                            <tr key={log.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                                <td style={{padding: '15px 10px', fontWeight: 'bold'}}>{new Date(log.date).toLocaleDateString('ro-RO')}</td>
                                                <td style={{padding: '15px 10px'}}>{log.description}</td>
                                                <td style={{padding: '15px 10px', color: '#dc2626', fontWeight: 'bold'}}>{log.cost ? `${log.cost} RON` : '-'}</td>
                                                <td style={{padding: '15px 10px'}}>{log.hoursAtMaintenance} ore</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {!isReadOnly && (
                        <form onSubmit={handleSaveMaintenance} style={{paddingTop: '20px', borderTop: '2px solid #e2e8f0'}}>
                            <h4 style={{marginTop: 0, color: '#0369a1'}}>+ Adaugă Intervenție Nouă</h4>
                            <div style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '11px', fontWeight: 'bold'}}>DATA</label>
                                    <input type="date" value={maintenanceData.date} onChange={e => setMaintenanceData({...maintenanceData, date: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}} required />
                                </div>
                                <div style={{flex: 3}}>
                                    <label style={{fontSize: '11px', fontWeight: 'bold'}}>DESCRIERE</label>
                                    <input type="text" placeholder="Ex: Schimb ulei și filtre" value={maintenanceData.description} onChange={e => setMaintenanceData({...maintenanceData, description: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}} required />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '11px', fontWeight: 'bold'}}>COST (RON)</label>
                                    <input type="number" value={maintenanceData.cost} onChange={e => setMaintenanceData({...maintenanceData, cost: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '11px', fontWeight: 'bold'}}>ORE MOTOR</label>
                                    <input type="number" value={maintenanceData.hoursAtMaintenance} onChange={e => setMaintenanceData({...maintenanceData, hoursAtMaintenance: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1'}} required />
                                </div>
                                <button type="submit" className="btn-primary" style={{padding: '9px 15px', whiteSpace: 'nowrap'}}>Salvează</button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MachineryPage;
