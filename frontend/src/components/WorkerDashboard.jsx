import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [tasks, setTasks] = useState([]);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/activities/my-tasks');
            setTasks(response.data);
        } catch (error) {
            console.error("Eroare la preluarea sarcinilor:", error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleLogout = () => {
        // Aici ar trebui un apel la API pentru logout
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <h1 style={{ color: 'var(--primary-green)', margin: '0 0 10px 0' }}>Salut, {user?.username}!</h1>
                <p style={{ color: '#555', marginBottom: '30px' }}>Sarcinile tale la ferma "{user?.farmName}":</p>

                {tasks.length === 0 ? (
                    <div style={{
                        border: '2px dashed #ccc',
                        padding: '40px 20px',
                        borderRadius: '8px',
                        color: '#888',
                        marginBottom: '30px'
                    }}>
                        Nu ai nicio lucrare atribuită în acest moment.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                        {tasks.map(task => (
                            <div key={task.id} style={{
                                padding: '15px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                textAlign: 'left',
                                backgroundColor: '#fafafa'
                            }}>
                                <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-green)' }}>{task.title}</h3>
                                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                    <strong>📍 Parcelă:</strong> {task.parcel?.name} ({task.parcel?.areaHectares?.toFixed(2)} ha)
                                </p>
                                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                    <strong>📅 Data:</strong> {new Date(task.startDate).toLocaleDateString('ro-RO')}
                                </p>
                                {task.machineries && task.machineries.length > 0 && (
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                        <strong>🚜 Utilaje:</strong> {task.machineries.map(m => m.name).join(', ')}
                                    </p>
                                )}
                                {task.consumptions && task.consumptions.length > 0 && (
                                    <div style={{ margin: '5px 0', fontSize: '14px' }}>
                                        <strong>🧪 Consumabile:</strong>
                                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                            {task.consumptions.map(c => (
                                                <li key={c.id}>{c.quantityUsed} {c.inventoryItem?.unitOfMeasure} {c.inventoryItem?.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default WorkerDashboard;