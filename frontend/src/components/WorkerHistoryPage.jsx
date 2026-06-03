import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const WorkerHistoryPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/activities/my-tasks');
            // Sortăm activitățile după data de început, cele mai recente primele
            const sortedActivities = response.data.sort((a, b) => {
                const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
                const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
                return dateB - dateA;
            });
            setActivities(sortedActivities);
        } catch (error) {
            console.error("Eroare la preluarea istoricului:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        return new Date(dateTimeStr).toLocaleString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const activityTypeLabels = {
        'ARAT': '🚜 Arat',
        'SEMANAT': '🌱 Semănat',
        'RECOLTAT': '🌾 Recoltat',
        'IRIGAT': '💧 Irigat',
        'TRATAMENT': '🧪 Tratament',
        'ALTELE': '📋 Altele'
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return { color: '#4CAF50', fontWeight: 'bold' };
            case 'IN_PROGRESS': return { color: '#1976d2', fontWeight: 'bold' };
            case 'PENDING': return { color: '#f57c00', fontWeight: 'bold' };
            default: return {};
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <BackButton />
                <h1 style={{ marginLeft: '20px', color: 'var(--primary-green)' }}>Istoric Lucrări</h1>
            </div>

            {loading ? (
                <p>Se încarcă...</p>
            ) : activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p>Nu există nicio lucrare înregistrată.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {activities.map(activity => (
                        <div key={activity.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: `5px solid ${activity.status === 'COMPLETED' ? '#4CAF50' : activity.status === 'IN_PROGRESS' ? '#1976d2' : '#f57c00'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, color: '#333' }}>
                                    {activityTypeLabels[activity.type] || activity.type}
                                    {activity.title && <span style={{ fontWeight: '400', fontSize: '14px', color: '#666', marginLeft: '10px' }}>- {activity.title}</span>}
                                </h3>
                                <span style={getStatusStyle(activity.status)}>{activity.status}</span>
                            </div>

                            {activity.harvestedYieldKg > 0 && (
                                <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #dcfce7', display: 'inline-block' }}>
                                    <strong style={{ color: 'var(--primary-green)' }}>⚖️ Cantitate recoltată: {activity.harvestedYieldKg.toLocaleString('ro-RO')} kg</strong>
                                </div>
                            )}
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '14px' }}>
                                <div>
                                    <strong>📍 Parcelă:</strong> {activity.parcel?.name}
                                </div>
                                <div>
                                    <strong>📅 Început:</strong> {formatDateTime(activity.startDate)}
                                </div>
                                <div>
                                    <strong>🏁 Finalizat:</strong> {formatDateTime(activity.endDate)}
                                </div>
                            </div>

                            {activity.comments && (
                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', fontStyle: 'italic', fontSize: '14px' }}>
                                    <strong>Comentarii:</strong> {activity.comments}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkerHistoryPage;
