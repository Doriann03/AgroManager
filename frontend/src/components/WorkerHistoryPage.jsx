import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const numberFormatter = new Intl.NumberFormat('ro-RO', {
    maximumFractionDigits: 2
});

const WorkerHistoryPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/activities/my-tasks');
            const sortedActivities = response.data.sort((a, b) => {
                const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
                const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
                return dateB - dateA;
            });
            setActivities(sortedActivities);
        } catch (error) {
            console.error('Eroare la preluarea istoricului:', error);
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

    const formatNumber = (value) => numberFormatter.format(Number(value || 0));

    const activityTypeLabels = {
        ARAT: 'Arat',
        SEMANAT: 'Semanat',
        RECOLTAT: 'Recoltat',
        IRIGAT: 'Irigat',
        TRATAMENT: 'Tratament',
        ALTELE: 'Altele'
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return { color: '#16a34a', fontWeight: 'bold' };
            case 'IN_PROGRESS': return { color: '#1976d2', fontWeight: 'bold' };
            case 'PENDING': return { color: '#d97706', fontWeight: 'bold' };
            default: return {};
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <BackButton />
                <h1 style={{ marginLeft: '20px', color: 'var(--primary-green)' }}>Istoric lucrari</h1>
            </div>

            {loading ? (
                <p>Se incarca...</p>
            ) : activities.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Nu exista nicio lucrare inregistrata.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {activities.map((activity) => (
                        <div key={activity.id} className="card" style={{ padding: '20px', borderLeft: `5px solid ${activity.status === 'COMPLETED' ? '#16a34a' : activity.status === 'IN_PROGRESS' ? '#1976d2' : '#d97706'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>
                                    {activityTypeLabels[activity.type] || activity.type}
                                    {activity.title && <span style={{ fontWeight: 400, fontSize: '14px', color: 'var(--text-muted)', marginLeft: '10px' }}>- {activity.title}</span>}
                                </h3>
                                <span style={getStatusStyle(activity.status)}>{activity.status}</span>
                            </div>

                            {activity.harvestedYieldKg > 0 && (
                                <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #dcfce7', display: 'inline-block' }}>
                                    <strong style={{ color: 'var(--primary-green)' }}>Cantitate recoltata: {formatNumber(activity.harvestedYieldKg)} kg</strong>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', fontSize: '14px' }}>
                                <div><strong>Parcela:</strong> {activity.parcel?.name || 'N/A'}</div>
                                <div><strong>Inceput:</strong> {formatDateTime(activity.startDate)}</div>
                                <div><strong>Finalizat:</strong> {formatDateTime(activity.endDate)}</div>
                            </div>

                            {activity.comments && (
                                <div style={{ marginTop: '14px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', fontStyle: 'italic', fontSize: '14px' }}>
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
