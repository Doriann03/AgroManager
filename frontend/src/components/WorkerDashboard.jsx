import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [tasks, setTasks] = useState([]);

    const [locationError, setLocationError] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [reportingTaskId, setReportingTaskId] = useState(null);
    const [reportData, setReportData] = useState({
        startDate: '',
        endDate: '',
        comments: ''
    });

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

    // Logica veche de geofencing a fost eliminată
    const handleOpenReport = (task) => {
        setReportingTaskId(task.id);
        // Formatăm data curentă pentru input-ul datetime-local
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const defaultTime = now.toISOString().slice(0, 16);
        
        setReportData({
            startDate: task.startDate ? task.startDate.slice(0, 16) : defaultTime,
            endDate: defaultTime,
            comments: ''
        });
    };

    const handleStartWork = async (task) => {
        try {
            // Obținem data curentă locală formatată pentru ISO (fără offset/timezone-ul browserului care poate deruta)
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            const currentStartTime = now.toISOString().slice(0, 16);

            await apiClient.put(`/api/activities/${task.id}/status`, { 
                status: 'IN_PROGRESS',
                startDate: currentStartTime 
            });
            fetchTasks(); // Refresh tasks after update
        } catch (error) {
            console.error("Eroare la actualizarea statusului:", error);
            alert("A apărut o eroare la salvarea statusului.");
        }
    };

    const handleCompleteWork = (taskId) => {
        // Just an alias to open report since it's the finalization step now.
        const task = tasks.find(t => t.id === taskId);
        handleOpenReport(task);
    }

    const handleSubmitReport = async (taskId) => {
        try {
            await apiClient.put(`/api/activities/${taskId}/status`, {
                status: 'COMPLETED',
                ...reportData
            });
            setReportingTaskId(null);
            fetchTasks();
        } catch (error) {
            console.error("Eroare la raportarea lucrării:", error);
            alert("A apărut o eroare la salvare. Te rugăm să încerci din nou.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary-green)', margin: '0 0 10px 0' }}>Salut, {user?.username}!</h1>
                <p style={{ color: '#555', marginBottom: '30px' }}>Sarcinile tale la ferma "{user?.farmName}":</p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button 
                        onClick={() => navigate('/worker/history')}
                        style={{ flex: 1, padding: '12px', backgroundColor: '#607d8b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        📋 Istoric Lucrări
                    </button>
                </div>

                {locationError && (
                    <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ef9a9a', borderRadius: '8px', marginBottom: '20px' }}>
                        {locationError}
                    </div>
                )}

                {tasks.length === 0 ? (
                    <div style={{ border: '2px dashed #ccc', padding: '40px 20px', borderRadius: '8px', color: '#888', marginBottom: '30px' }}>
                        Nu ai nicio lucrare atribuită în acest moment.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                        {tasks.map(task => (
                            <div key={task.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'left', backgroundColor: '#fafafa' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-green)' }}>{task.title}</h3>
                                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                    <strong>📍 Parcelă:</strong> {task.parcel?.name} ({task.parcel?.areaHectares?.toFixed(2)} ha)
                                </p>
                                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                    <strong>📅 Data:</strong> {task.startDate ? new Date(task.startDate).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                </p>

                                {task.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleStartWork(task)} 
                                        style={{ marginTop: '15px', width: '100%', padding: '12px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        📍 Începe Lucrarea
                                    </button>
                                )}

                                {task.status === 'IN_PROGRESS' && (
                                    <button 
                                        onClick={() => handleOpenReport(task)}
                                        style={{ marginTop: '15px', width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ✅ Finalizează Lucrarea
                                    </button>
                                )}

                                {reportingTaskId === task.id && (
                                    <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ccc' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Raportează Lucrarea</h4>
                                        
                                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#555' }}>Data și ora începerii:</label>
                                        <input type="datetime-local" value={reportData.startDate} onChange={(e) => setReportData({...reportData, startDate: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />

                                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#555' }}>Data și ora finalizării:</label>
                                        <input type="datetime-local" value={reportData.endDate} onChange={(e) => setReportData({...reportData, endDate: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />

                                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#555' }}>Comentarii (opțional):</label>
                                        <textarea rows="3" value={reportData.comments} onChange={(e) => setReportData({...reportData, comments: e.target.value})} placeholder="Ex: A plouat scurt, am întârziat..." style={{ width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleSubmitReport(task.id)} style={{ flex: 1, padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Salvează</button>
                                            <button onClick={() => setReportingTaskId(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Anulează</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={handleLogout} style={{ width: '100%', padding: '15px', fontSize: '16px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Ieși din cont
                </button>
            </div>
        </div>
    );
};

export default WorkerDashboard;