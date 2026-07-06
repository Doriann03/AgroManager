import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const typeLabels = {
    TRACTOR: 'Tractor',
    COMBINA: 'Combina',
    SEMANATOARE: 'Semanatoare',
    PLUG: 'Plug',
    DISC: 'Disc',
    PULVERIZATOR: 'Pulverizator',
    ALTELE: 'Altele'
};

const statusLabels = {
    DISPONIBIL: { label: 'Disponibil', className: 'badge-success' },
    IN_CURSA: { label: 'In cursa', className: 'badge-warning' },
    IN_SERVICE: { label: 'In service', className: 'badge-danger' }
};

const MachineryPage = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isReadOnly = currentUser?.role === 'AGRONOMIST';
    const [machineryList, setMachineryList] = useState([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedMachinery, setSelectedMachinery] = useState(null);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        type: 'TRACTOR',
        model: '',
        licensePlate: '',
        totalHours: 0,
        maintenanceIntervalHours: 250
    });
    const [maintenanceData, setMaintenanceData] = useState({
        date: new Date().toISOString().slice(0, 10),
        description: '',
        cost: '',
        hoursAtMaintenance: ''
    });

    const fetchMachinery = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/machinery');
            setMachineryList(response.data);
        } catch (error) {
            console.error('Eroare la preluarea utilajelor:', error);
        }
    }, []);

    useEffect(() => {
        fetchMachinery();
    }, [fetchMachinery]);

    const handleOpenAddForm = () => {
        setFormData({
            id: null,
            name: '',
            type: 'TRACTOR',
            model: '',
            licensePlate: '',
            totalHours: 0,
            maintenanceIntervalHours: 250
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

    const handleSaveMachinery = async (event) => {
        event.preventDefault();
        const payload = {
            ...formData,
            totalHours: Number(formData.totalHours),
            maintenanceIntervalHours: Number(formData.maintenanceIntervalHours)
        };

        try {
            if (formData.id) {
                await apiClient.put(`/api/machinery/${formData.id}`, payload);
            } else {
                await apiClient.post('/api/machinery', payload);
            }
            setShowFormModal(false);
            fetchMachinery();
        } catch (error) {
            console.error('Eroare la salvarea utilajului:', error);
            alert('Nu s-a putut salva utilajul.');
        }
    };

    const handleSaveMaintenance = async (event) => {
        event.preventDefault();
        if (!selectedMachinery) return;

        const payload = {
            ...maintenanceData,
            cost: Number(maintenanceData.cost || 0),
            hoursAtMaintenance: Number(maintenanceData.hoursAtMaintenance)
        };

        try {
            const response = await apiClient.post(`/api/machinery/${selectedMachinery.id}/maintenance-logs`, payload);
            setShowMaintenanceModal(false);
            setSelectedMachinery((current) => ({
                ...current,
                maintenanceLogs: [...(current.maintenanceLogs || []), response.data]
            }));
            fetchMachinery();
            setMaintenanceData({ date: new Date().toISOString().slice(0, 10), description: '', cost: '', hoursAtMaintenance: '' });
        } catch (error) {
            console.error('Eroare la salvarea interventiei:', error);
            alert('Nu s-a putut salva interventia.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Stergi acest utilaj?')) return;

        try {
            await apiClient.delete(`/api/machinery/${id}`);
            fetchMachinery();
        } catch (error) {
            console.error('Eroare la stergerea utilajului:', error);
            alert('Stergerea a esuat.');
        }
    };

    const openMaintenance = (machinery) => {
        setSelectedMachinery(machinery);
        setShowMaintenanceModal(true);
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header-left">
                    <BackButton />
                    <div>
                        <h1 className="page-title">{isReadOnly ? 'Vizualizare flota utilaje' : 'Gestiune flota utilaje'}</h1>
                        <p className="page-subtitle">
                            {isReadOnly
                                ? 'Mod consultare: status, ore de functionare si jurnal de service.'
                                : 'Administrare utilaje, ore de lucru, service si costuri de mentenanta.'}
                        </p>
                    </div>
                </div>
                {!isReadOnly && (
                    <button className="btn-primary" onClick={handleOpenAddForm}>
                        + Utilaj nou
                    </button>
                )}
            </div>

            <div className="metric-grid" style={{ marginBottom: '20px' }}>
                <Metric label="Utilaje totale" value={machineryList.length} />
                <Metric label="Disponibile" value={machineryList.filter((item) => item.status === 'DISPONIBIL').length} />
                <Metric label="In service" value={machineryList.filter((item) => item.status === 'IN_SERVICE').length} />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap">
                    <table className="data-table" style={{ minWidth: '920px' }}>
                        <thead>
                            <tr>
                                <th>Utilaj</th>
                                <th>Tip</th>
                                <th>Status</th>
                                <th>Ore motor</th>
                                <th>Progres mentenanta</th>
                                <th style={{ textAlign: 'right' }}>Actiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machineryList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">Nu exista utilaje inregistrate.</td>
                                </tr>
                            ) : machineryList.map((machinery) => (
                                <tr key={machinery.id}>
                                    <td>
                                        <strong style={{ color: 'var(--text-main)' }}>{machinery.name}</strong>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                                            {machinery.model || '-'} {machinery.licensePlate ? ` / ${machinery.licensePlate}` : ''}
                                        </div>
                                    </td>
                                    <td>{typeLabels[machinery.type] || machinery.type}</td>
                                    <td><StatusBadge status={machinery.status} /></td>
                                    <td><strong>{machinery.totalHours || 0} ore</strong></td>
                                    <td>
                                        <MaintenanceProgressBar
                                            total={machinery.totalHours}
                                            next={machinery.nextMaintenanceHours}
                                            interval={machinery.maintenanceIntervalHours}
                                        />
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                                            Revizie la {machinery.nextMaintenanceHours || '?'} ore
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            {!isReadOnly && (
                                                <button className="btn-secondary" onClick={() => handleOpenEditForm(machinery)} style={{ padding: '7px 10px', fontSize: '12px' }}>
                                                    Editeaza
                                                </button>
                                            )}
                                            <button className="btn-secondary" onClick={() => openMaintenance(machinery)} style={{ padding: '7px 10px', fontSize: '12px' }}>
                                                {isReadOnly ? 'Jurnal service' : 'Service'}
                                            </button>
                                            {!isReadOnly && (
                                                <button className="btn-danger" onClick={() => handleDelete(machinery.id)} style={{ padding: '7px 10px', fontSize: '12px' }}>
                                                    Sterge
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showFormModal && (
                <Modal onClose={() => setShowFormModal(false)} title={formData.id ? 'Editare utilaj' : 'Adaugare utilaj nou'}>
                    <form onSubmit={handleSaveMachinery}>
                        <div style={formGridStyle}>
                            <Field label="Nume utilaj">
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-control" required />
                            </Field>
                            <Field label="Tip">
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="form-control">
                                    {Object.entries(typeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Model">
                                <input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="form-control" />
                            </Field>
                            <Field label="Nr. inmatriculare">
                                <input value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} className="form-control" />
                            </Field>
                            <Field label="Ore motor curente">
                                <input type="number" value={formData.totalHours} onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })} className="form-control" />
                            </Field>
                            <Field label="Interval revizie (ore)">
                                <input type="number" value={formData.maintenanceIntervalHours} onChange={(e) => setFormData({ ...formData, maintenanceIntervalHours: e.target.value })} className="form-control" />
                            </Field>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                            <button type="submit" className="btn-primary">Salveaza utilaj</button>
                            <button type="button" className="btn-secondary" onClick={() => setShowFormModal(false)}>Anuleaza</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showMaintenanceModal && selectedMachinery && (
                <Modal onClose={() => setShowMaintenanceModal(false)} title={`Jurnal service: ${selectedMachinery.name}`} wide>
                    <div className="table-wrap" style={{ marginBottom: '20px' }}>
                        <table className="data-table" style={{ minWidth: '650px' }}>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descriere interventie</th>
                                    <th>Cost</th>
                                    <th>Ore motor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!selectedMachinery.maintenanceLogs || selectedMachinery.maintenanceLogs.length === 0) ? (
                                    <tr>
                                        <td colSpan="4" className="empty-state">Nu exista inregistrari in jurnalul de service.</td>
                                    </tr>
                                ) : selectedMachinery.maintenanceLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td><strong>{new Date(log.date).toLocaleDateString('ro-RO')}</strong></td>
                                        <td>{log.description}</td>
                                        <td><strong style={{ color: '#dc2626' }}>{log.cost ? `${log.cost} RON` : '-'}</strong></td>
                                        <td>{log.hoursAtMaintenance} ore</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!isReadOnly && (
                        <form onSubmit={handleSaveMaintenance} className="form-panel">
                            <h4 style={{ margin: '0 0 14px 0', color: 'var(--text-main)' }}>Adauga interventie noua</h4>
                            <div style={maintenanceGridStyle}>
                                <Field label="Data">
                                    <input type="date" value={maintenanceData.date} onChange={(e) => setMaintenanceData({ ...maintenanceData, date: e.target.value })} className="form-control" required />
                                </Field>
                                <Field label="Descriere">
                                    <input value={maintenanceData.description} onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })} className="form-control" required />
                                </Field>
                                <Field label="Cost (RON)">
                                    <input type="number" value={maintenanceData.cost} onChange={(e) => setMaintenanceData({ ...maintenanceData, cost: e.target.value })} className="form-control" />
                                </Field>
                                <Field label="Ore motor">
                                    <input type="number" value={maintenanceData.hoursAtMaintenance} onChange={(e) => setMaintenanceData({ ...maintenanceData, hoursAtMaintenance: e.target.value })} className="form-control" required />
                                </Field>
                                <button type="submit" className="btn-primary" style={{ alignSelf: 'end', padding: '10px 14px' }}>Salveaza</button>
                            </div>
                        </form>
                    )}
                </Modal>
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = statusLabels[status] || { label: status || '-', className: 'badge-info' };
    return <span className={`badge ${config.className}`}>{config.label}</span>;
};

const MaintenanceProgressBar = ({ total, next, interval }) => {
    if (!total || !next || !interval) {
        return <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date mentenanta incomplete</div>;
    }

    const lastMaintenanceHours = next - interval;
    const hoursSinceMaintenance = total - lastMaintenanceHours;
    const progress = Math.min((hoursSinceMaintenance / interval) * 100, 100);
    const color = progress > 90 ? '#ef4444' : progress > 70 ? '#f97316' : '#22c55e';

    return (
        <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, backgroundColor: color, height: '100%', borderRadius: '999px' }} />
        </div>
    );
};

const Metric = ({ label, value }) => (
    <div className="metric-card">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
    </div>
);

const Field = ({ label, children }) => (
    <label style={{ display: 'block' }}>
        <span className="form-label">{label}</span>
        {children}
    </label>
);

const Modal = ({ title, children, onClose, wide = false }) => (
    <div style={modalBackdropStyle}>
        <div className="card" style={{ ...modalStyle, width: wide ? '880px' : '640px' }}>
            <button onClick={onClose} className="btn-secondary" style={closeButtonStyle}>x</button>
            <h2 style={{ margin: '0 0 18px 0', color: 'var(--primary-green)' }}>{title}</h2>
            {children}
        </div>
    </div>
);

const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px'
};

const maintenanceGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(130px, 0.8fr) minmax(220px, 2fr) minmax(130px, 0.8fr) minmax(130px, 0.8fr) auto',
    gap: '12px',
    alignItems: 'end'
};

const modalBackdropStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
};

const modalStyle = {
    maxWidth: '96vw',
    maxHeight: '92vh',
    overflowY: 'auto',
    position: 'relative',
    backgroundColor: '#fff'
};

const closeButtonStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '34px',
    height: '34px',
    padding: 0
};

export default MachineryPage;
