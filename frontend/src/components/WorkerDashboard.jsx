import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [tasks, setTasks] = useState([]);

    const [locationError, setLocationError] = useState('');
    const [reportingTaskId, setReportingTaskId] = useState(null);
    const [reportData, setReportData] = useState({
        startDate: '',
        endDate: '',
        comments: '',
        harvestedYieldKg: '',
        actualConsumptions: []
    });

    const activityTypeLabels = {
        'ARAT': '🚜 Arat',
        'SEMANAT': '🌱 Semănat',
        'RECOLTAT': '🌾 Recoltat',
        'IRIGAT': '💧 Irigat',
        'TRATAMENT': '🧪 Tratament',
        'ALTELE': '📋 Altele'
    };

    const fetchTasks = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/activities/my-tasks');
            // Filtrăm pentru a arăta doar sarcinile care NU sunt finalizate
            const activeTasks = response.data.filter(task => task.status !== 'COMPLETED');
            setTasks(activeTasks);
        } catch (error) {
            console.error("Eroare la preluarea sarcinilor:", error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleOpenReport = (task) => {
        setReportingTaskId(task.id);
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const defaultTime = now.toISOString().slice(0, 16);
        const plannedConsumptions = (task.consumptions || [])
            .filter(cons => cons.inventoryItem?.id)
            .map(cons => ({
                activityConsumptionId: cons.id,
                inventoryItemId: cons.inventoryItem.id,
                itemName: cons.inventoryItem.name,
                unitOfMeasure: cons.inventoryItem.unitOfMeasure,
                plannedQuantity: cons.quantityUsed,
                quantityUsed: cons.quantityUsed
            }));
        
        setReportData({
            startDate: task.startDate ? task.startDate.slice(0, 16) : defaultTime,
            endDate: defaultTime,
            comments: '',
            harvestedYieldKg: '',
            actualConsumptions: plannedConsumptions
        });
    };

    const handleStartWork = async (task) => {
        try {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            const currentStartTime = now.toISOString().slice(0, 16);

            await apiClient.put(`/api/activities/${task.id}/status`, { 
                status: 'IN_PROGRESS',
                startDate: currentStartTime 
            });
            fetchTasks();
        } catch (error) {
            console.error("Eroare la actualizarea statusului:", error);
            alert("A apărut o eroare la salvarea statusului.");
        }
    };

    const handleSubmitReport = async (taskId) => {
        try {
            const actualConsumptions = reportData.actualConsumptions.map(consumption => ({
                activityConsumptionId: consumption.activityConsumptionId,
                inventoryItemId: consumption.inventoryItemId,
                quantityUsed: parseFloat(consumption.quantityUsed)
            }));

            if (actualConsumptions.some(consumption => Number.isNaN(consumption.quantityUsed) || consumption.quantityUsed <= 0)) {
                alert("Cantitatile consumate trebuie sa fie mai mari decat 0.");
                return;
            }

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
            console.error("Eroare la raportarea lucrării:", error);
            alert("A apărut o eroare la salvare. Te rugăm să încerci din nou.");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        };
        
        if (status === 'IN_PROGRESS') {
            return <span style={{ ...styles, backgroundColor: '#e0f2fe', color: '#0284c7' }}>În Lucru</span>;
        }
        return <span style={{ ...styles, backgroundColor: '#fef3c7', color: '#d97706' }}>În Așteptare</span>;
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚜</div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 5px 0' }}>Salut, {user?.username}!</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Ferma "{user?.farmName}"</p>
                    
                    <button 
                        onClick={() => navigate('/worker/history')}
                        className="btn-secondary"
                        style={{ marginTop: '20px', width: '100%', gap: '10px', padding: '12px' }}
                    >
                        📋 Vezi Istoric Lucrări
                    </button>
                </header>

                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Sarcini Active <span style={{ backgroundColor: 'var(--primary-green)', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '10px' }}>{tasks.length}</span>
                </h2>

                {tasks.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '50px', marginBottom: '20px' }}>☕</div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Nicio lucrare pentru azi</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Relaxează-te! Te vom anunța când primești sarcini noi.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                        {tasks.map(task => (
                            <div key={task.id} className="card" style={{ padding: '20px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', flex: 1 }}>
                                        {activityTypeLabels[task.type] || task.type}
                                        {task.title && <span style={{ fontWeight: '400', fontSize: '14px', color: '#666', display: 'block' }}>{task.title}</span>}
                                    </h3>
                                    {getStatusBadge(task.status)}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>📍</span> <strong>Parcelă:</strong> {task.parcel?.name} ({task.parcel?.areaHectares?.toFixed(2)} ha)
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>📅</span> <strong>Planificat:</strong> {task.startDate ? new Date(task.startDate).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                    </div>
                                </div>

                                {task.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleStartWork(task)} 
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '14px' }}
                                    >
                                        🚀 Începe Lucrarea
                                    </button>
                                )}

                                {task.status === 'IN_PROGRESS' && (
                                    <button 
                                        onClick={() => handleOpenReport(task)}
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '14px', backgroundColor: '#0ea5e9' }}
                                    >
                                        ✅ Finalizează și Raportează
                                    </button>
                                )}

                                {reportingTaskId === task.id && (
                                    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Raport Lucrare</h4>
                                        
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-muted)' }}>ORA ÎNCEPERII:</label>
                                            <input type="datetime-local" value={reportData.startDate} onChange={(e) => setReportData({...reportData, startDate: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px' }} />
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-muted)' }}>ORA FINALIZĂRII:</label>
                                            <input type="datetime-local" value={reportData.endDate} onChange={(e) => setReportData({...reportData, endDate: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px' }} />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-muted)' }}>COMENTARII (OPȚIONAL):</label>
                                            <textarea rows="3" value={reportData.comments} onChange={(e) => setReportData({...reportData, comments: e.target.value})} placeholder="Ex: Probleme tehnice la tractor..." style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} />
                                        </div>

                                        {reportData.actualConsumptions.length > 0 && (
                                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#166534', textTransform: 'uppercase' }}>Consum real</h5>
                                                {reportData.actualConsumptions.map((consumption, index) => (
                                                    <div key={consumption.inventoryItemId} style={{ marginBottom: '12px' }}>
                                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px', color: '#166534' }}>
                                                            {consumption.itemName} ({consumption.unitOfMeasure}) - planificat: {consumption.plannedQuantity}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={consumption.quantityUsed}
                                                            onChange={(e) => setReportData(prev => ({
                                                                ...prev,
                                                                actualConsumptions: prev.actualConsumptions.map((item, itemIndex) =>
                                                                    itemIndex === index ? { ...item, quantityUsed: e.target.value } : item
                                                                )
                                                            }))}
                                                            style={{ width: '100%', padding: '12px', border: '1px solid #86efac', borderRadius: '8px', fontSize: '14px' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {tasks.find(t => t.id === reportingTaskId)?.type === 'RECOLTAT' && (
                                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px', color: '#9a3412' }}>CANTITATE RECOLTATĂ (KG) *</label>
                                                <input 
                                                    type="number" 
                                                    value={reportData.harvestedYieldKg} 
                                                    onChange={(e) => setReportData({...reportData, harvestedYieldKg: e.target.value})} 
                                                    placeholder="Introduceți kilogramele recoltate"
                                                    style={{ width: '100%', padding: '12px', border: '2px solid #fdba74', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }} 
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => {
                                                const task = tasks.find(t => t.id === reportingTaskId);
                                                if (task?.type === 'RECOLTAT' && !reportData.harvestedYieldKg) {
                                                    alert("Vă rugăm să introduceți cantitatea recoltată!");
                                                    return;
                                                }
                                                handleSubmitReport(task.id);
                                            }} className="btn-primary" style={{ flex: 2 }}>Salvează</button>
                                            <button onClick={() => setReportingTaskId(null)} className="btn-secondary" style={{ flex: 1 }}>Anulează</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    onClick={handleLogout}
                    style={{ width: '100%', padding: '15px', marginTop: '20px', color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #fee2e2', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                >
                    Ieși din cont
                </button>
            </div>
        </div>
    );
};

export default WorkerDashboard;
