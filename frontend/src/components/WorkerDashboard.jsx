import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const activityTypeLabels = {
    ARAT: 'Arat',
    SEMANAT: 'Semanat',
    RECOLTAT: 'Recoltat',
    IRIGAT: 'Irigat',
    TRATAMENT: 'Tratament',
    ALTELE: 'Altele'
};

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [tasks, setTasks] = useState([]);
    const [reportingTaskId, setReportingTaskId] = useState(null);
    const [reportData, setReportData] = useState({
        startDate: '',
        endDate: '',
        comments: '',
        harvestedYieldKg: '',
        actualConsumptions: []
    });

    const fetchTasks = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/activities/my-tasks');
            setTasks(response.data.filter((task) => task.status !== 'COMPLETED'));
        } catch (error) {
            console.error('Eroare la preluarea sarcinilor:', error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getLocalDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleStartWork = async (task) => {
        try {
            await apiClient.put(`/api/activities/${task.id}/status`, {
                status: 'IN_PROGRESS',
                startDate: getLocalDateTime()
            });
            fetchTasks();
        } catch (error) {
            console.error('Eroare la actualizarea statusului:', error);
            alert('A aparut o eroare la salvarea statusului.');
        }
    };

    const handleOpenReport = (task) => {
        const defaultTime = getLocalDateTime();
        const plannedConsumptions = (task.consumptions || [])
            .filter((consumption) => consumption.inventoryItem?.id)
            .map((consumption) => ({
                activityConsumptionId: consumption.id,
                inventoryItemId: consumption.inventoryItem.id,
                itemName: consumption.inventoryItem.name,
                unitOfMeasure: consumption.inventoryItem.unitOfMeasure,
                plannedQuantity: consumption.quantityUsed,
                quantityUsed: consumption.quantityUsed
            }));

        setReportingTaskId(task.id);
        setReportData({
            startDate: task.startDate ? task.startDate.slice(0, 16) : defaultTime,
            endDate: defaultTime,
            comments: '',
            harvestedYieldKg: '',
            actualConsumptions: plannedConsumptions
        });
    };

    const updateConsumption = (index, value) => {
        setReportData((current) => ({
            ...current,
            actualConsumptions: current.actualConsumptions.map((item, itemIndex) =>
                itemIndex === index ? { ...item, quantityUsed: value } : item
            )
        }));
    };

    const handleSubmitReport = async (taskId) => {
        const task = tasks.find((item) => item.id === taskId);
        if (task?.type === 'RECOLTAT' && !reportData.harvestedYieldKg) {
            alert('Introdu cantitatea recoltata.');
            return;
        }

        const actualConsumptions = reportData.actualConsumptions.map((consumption) => ({
            activityConsumptionId: consumption.activityConsumptionId,
            inventoryItemId: consumption.inventoryItemId,
            quantityUsed: parseFloat(consumption.quantityUsed)
        }));

        if (actualConsumptions.some((consumption) => Number.isNaN(consumption.quantityUsed) || consumption.quantityUsed <= 0)) {
            alert('Cantitatile consumate trebuie sa fie mai mari decat 0.');
            return;
        }

        try {
            await apiClient.put(`/api/activities/${taskId}/status`, {
                status: 'COMPLETED',
                startDate: reportData.startDate,
                endDate: reportData.endDate,
                comments: reportData.comments,
                harvestedYieldKg: reportData.harvestedYieldKg ? parseFloat(reportData.harvestedYieldKg) : null,
                actualConsumptions
            });
            setReportingTaskId(null);
            fetchTasks();
        } catch (error) {
            console.error('Eroare la raportarea lucrarii:', error);
            alert('A aparut o eroare la salvare. Te rugam sa incerci din nou.');
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'IN_PROGRESS') {
            return <span className="badge badge-info">In lucru</span>;
        }
        return <span className="badge badge-warning">In asteptare</span>;
    };

    return (
        <div className="page-shell" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <section className="dashboard-hero" style={{ textAlign: 'center' }}>
                <p className="metric-label" style={{ margin: '0 0 8px 0' }}>Panou muncitor</p>
                <h1 className="page-title">Salut, {user?.username}!</h1>
                <p className="page-subtitle">Ferma "{user?.farmName}"</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginTop: '22px' }}>
                    <button onClick={() => navigate('/worker/history')} className="btn-secondary" style={{ padding: '12px' }}>
                        Vezi istoric lucrari
                    </button>
                    <button onClick={() => navigate('/worker/payroll')} className="btn-secondary" style={{ padding: '12px' }}>
                        Vezi fluturas salariu
                    </button>
                </div>
            </section>

            <div className="page-header" style={{ marginBottom: '14px' }}>
                <div>
                    <h2 className="section-title">Sarcini active</h2>
                    <p className="page-subtitle" style={{ fontSize: '13px' }}>Lucrari atribuite care asteapta pornirea sau raportarea finala.</p>
                </div>
                <span className="badge badge-success">{tasks.length}</span>
            </div>

            {tasks.length === 0 ? (
                <div className="card empty-state">
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Nicio lucrare activa</h3>
                    <p style={{ margin: 0 }}>Vei primi sarcini noi cand agronomul programeaza lucrari.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {tasks.map((task) => (
                        <div key={task.id} className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>
                                        {activityTypeLabels[task.type] || task.type}
                                    </h3>
                                    {task.title && <p className="page-subtitle" style={{ fontSize: '13px' }}>{task.title}</p>}
                                </div>
                                {getStatusBadge(task.status)}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                                <InfoLine label="Parcela" value={`${task.parcel?.name || '-'} (${Number(task.parcel?.areaHectares || 0).toFixed(2)} ha)`} />
                                <InfoLine label="Planificat" value={task.startDate ? new Date(task.startDate).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'} />
                            </div>

                            {task.status === 'PENDING' && (
                                <button onClick={() => handleStartWork(task)} className="btn-primary" style={{ width: '100%', padding: '13px' }}>
                                    Incepe lucrarea
                                </button>
                            )}

                            {task.status === 'IN_PROGRESS' && (
                                <button onClick={() => handleOpenReport(task)} className="btn-primary" style={{ width: '100%', padding: '13px', backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' }}>
                                    Finalizeaza si raporteaza
                                </button>
                            )}

                            {reportingTaskId === task.id && (
                                <div className="form-panel" style={{ marginTop: '18px' }}>
                                    <h4 style={{ margin: '0 0 14px 0', color: 'var(--text-main)' }}>Raport lucrare</h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                                        <Field label="Ora inceperii">
                                            <input type="datetime-local" value={reportData.startDate} onChange={(e) => setReportData({ ...reportData, startDate: e.target.value })} className="form-control" />
                                        </Field>
                                        <Field label="Ora finalizarii">
                                            <input type="datetime-local" value={reportData.endDate} onChange={(e) => setReportData({ ...reportData, endDate: e.target.value })} className="form-control" />
                                        </Field>
                                    </div>

                                    <Field label="Comentarii">
                                        <textarea rows="3" value={reportData.comments} onChange={(e) => setReportData({ ...reportData, comments: e.target.value })} placeholder="Observatii din teren" className="form-control" />
                                    </Field>

                                    {reportData.actualConsumptions.length > 0 && (
                                        <div style={{ marginTop: '14px', padding: '14px', border: '1px solid #bbf7d0', borderRadius: '8px', background: '#f0fdf4' }}>
                                            <h5 style={{ margin: '0 0 12px 0', color: '#166534' }}>Consum real</h5>
                                            {reportData.actualConsumptions.map((consumption, index) => (
                                                <Field key={consumption.inventoryItemId} label={`${consumption.itemName} (${consumption.unitOfMeasure}) - planificat: ${consumption.plannedQuantity}`}>
                                                    <input type="number" min="0.01" step="0.01" value={consumption.quantityUsed} onChange={(e) => updateConsumption(index, e.target.value)} className="form-control" />
                                                </Field>
                                            ))}
                                        </div>
                                    )}

                                    {task.type === 'RECOLTAT' && (
                                        <div style={{ marginTop: '14px', padding: '14px', border: '1px solid #fed7aa', borderRadius: '8px', background: '#fff7ed' }}>
                                            <Field label="Cantitate recoltata (kg)">
                                                <input type="number" value={reportData.harvestedYieldKg} onChange={(e) => setReportData({ ...reportData, harvestedYieldKg: e.target.value })} placeholder="Kilograme recoltate" className="form-control" required />
                                            </Field>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                        <button onClick={() => handleSubmitReport(task.id)} className="btn-primary" style={{ flex: 2 }}>
                                            Salveaza raportul
                                        </button>
                                        <button onClick={() => setReportingTaskId(null)} className="btn-secondary" style={{ flex: 1 }}>
                                            Anuleaza
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button onClick={handleLogout} className="btn-danger" style={{ width: '100%', padding: '13px', marginTop: '20px' }}>
                Iesi din cont
            </button>
        </div>
    );
};

const InfoLine = ({ label, value }) => (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', background: '#f8fafc' }}>
        <div className="metric-label" style={{ marginBottom: '4px' }}>{label}</div>
        <div style={{ color: 'var(--text-main)', fontWeight: 750 }}>{value}</div>
    </div>
);

const Field = ({ label, children }) => (
    <label style={{ display: 'block', marginBottom: '12px' }}>
        <span className="form-label">{label}</span>
        {children}
    </label>
);

export default WorkerDashboard;
