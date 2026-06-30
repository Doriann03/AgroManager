import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const AgronomistHistoryPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    const fetchActivities = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/activities');
            setActivities(response.data);
        } catch (error) {
            console.error("Eroare la preluarea istoricului general:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const activityTypeLabels = {
        'ARAT': '🚜 Arat',
        'SEMANAT': '🌱 Semănat',
        'RECOLTAT': '🌾 Recoltat',
        'IRIGAT': '💧 Irigat',
        'TRATAMENT': '🧪 Tratament',
        'ALTELE': '📋 Altele'
    };

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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return { backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' };
            case 'IN_PROGRESS': return { backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe' };
            case 'PENDING': return { backgroundColor: '#fff7ed', color: '#f59e0b', border: '1px solid #ffedd5' };
            default: return {};
        }
    };

    const statusLabels = {
        ALL: 'Toate',
        PENDING: 'Programate',
        IN_PROGRESS: 'In lucru',
        COMPLETED: 'Finalizate'
    };

    const getActivityYear = (activity) => {
        const dateValue = activity.startDate || activity.endDate;
        if (dateValue) {
            return new Date(dateValue).getFullYear();
        }
        return activity.status === 'PENDING' ? new Date().getFullYear() : null;
    };

    const filteredActivities = activities
        .filter(act => {
            const yearMatches = getActivityYear(act) === parseInt(selectedYear);
            const statusMatches = selectedStatus === 'ALL' || act.status === selectedStatus;
            return yearMatches && statusMatches;
        })
        .sort((a, b) => {
            const aDate = new Date(a.startDate || a.endDate || 0).getTime();
            const bDate = new Date(b.startDate || b.endDate || 0).getTime();
            return bDate - aDate;
        });

    const statusCounts = activities
        .filter(act => getActivityYear(act) === parseInt(selectedYear))
        .reduce((counts, act) => {
            counts.ALL += 1;
            counts[act.status] = (counts[act.status] || 0) + 1;
            return counts;
        }, { ALL: 0, PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 });

    const years = Array.from(new Set(activities.map(act =>
        getActivityYear(act)
    ).filter(y => y))).sort((a, b) => b - a);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Se încarcă istoricul...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BackButton />
                    <h1 style={{ marginLeft: '20px', color: 'var(--primary-green)', margin: 0 }}>Istoric Activități Fermă</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Filtrare An:</label>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    >
                        {years.length > 0 ? years.map(y => <option key={y} value={y}>{y}</option>) : <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: selectedStatus === status ? '1px solid var(--primary-green)' : '1px solid var(--border-color)',
                            backgroundColor: selectedStatus === status ? 'var(--primary-green)' : '#fff',
                            color: selectedStatus === status ? '#fff' : 'var(--text-main)',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {statusLabels[status]} ({statusCounts[status] || 0})
                    </button>
                ))}
            </div>

            {filteredActivities.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Nu exista lucrari pentru anul {selectedYear} si filtrul selectat.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {filteredActivities.map(act => (
                        <div key={act.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>
                                        {activityTypeLabels[act.type] || act.type}
                                    </h3>
                                    {act.title && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{act.title}</div>}
                                </div>
                                <span style={{ ...getStatusStyle(act.status), padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                                    {statusLabels[act.status] || act.status}
                                </span>
                            </div>

                            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div><strong>📍 Parcelă:</strong> {act.parcel?.name}</div>
                                <div><strong>📅 Început:</strong> {formatDateTime(act.startDate)}</div>
                                <div><strong>🏁 Finalizat:</strong> {formatDateTime(act.endDate)}</div>
                                <div><strong>👥 Muncitori:</strong> {act.assignedWorkers?.map(w => w.username).join(', ') || 'N/A'}</div>
                            </div>

                            {act.harvestedYieldKg > 0 && (
                                <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7', color: '#16a34a', fontWeight: '700' }}>
                                    ⚖️ Recoltă: {act.harvestedYieldKg.toLocaleString('ro-RO')} kg
                                </div>
                            )}

                            {act.comments && (
                                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                    "{act.comments}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgronomistHistoryPage;
