import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const AgronomistHistoryPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

    const filteredActivities = activities.filter(act => {
        const date = act.startDate ? new Date(act.startDate) : null;
        return date && date.getFullYear() === parseInt(selectedYear);
    });

    const years = Array.from(new Set(activities.map(act => 
        act.startDate ? new Date(act.startDate).getFullYear() : null
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

            {filteredActivities.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Nu există activități înregistrate pentru anul {selectedYear}.</p>
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
                                    {act.status}
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
