import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const YieldReportPage = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [parcels, setParcels] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [parcelsRes, seasonsRes] = await Promise.all([
                apiClient.get('/api/parcels'),
                apiClient.get('/api/crop-seasons')
            ]);
            setParcels(parcelsRes.data);
            setSeasons(seasonsRes.data);
        } catch (error) {
            console.error("Eroare la preluarea datelor pentru raport:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtrăm sezoanele pentru anul selectat și mapăm cu datele parcelei
    const reportData = parcels.map(parcel => {
        const season = seasons.find(s => s.parcelId === parcel.id && s.harvestYear === Number(selectedYear));
        return {
            parcelName: parcel.name,
            area: parcel.areaHectares,
            cropType: season ? season.cropType : 'N/A',
            totalYieldKg: season ? (season.totalYieldKg || 0) : 0,
            yieldPerHa: (season && season.totalYieldKg) ? (season.totalYieldKg / parcel.areaHectares) : 0,
            hasData: !!season
        };
    }).filter(item => item.hasData); // Arătăm doar parcelele care au un sezon definit în acel an

    const totalFarmYieldKg = reportData.reduce((sum, item) => sum + item.totalYieldKg, 0);
    const totalFarmYieldTons = (totalFarmYieldKg / 1000).toFixed(2);

    const availableYears = Array.from(new Set(seasons.map(s => s.harvestYear))).sort((a, b) => b - a);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Se încarcă raportul...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BackButton />
                    <h1 style={{ marginLeft: '20px', color: 'var(--primary-green)', margin: 0 }}>Raport Producție și Recolte</h1>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Selectați Anul:</label>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '600' }}
                    >
                        {availableYears.length > 0 ? (
                            availableYears.map(year => <option key={year} value={year}>{year}</option>)
                        ) : (
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Parcelă</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Cultură</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Suprafață (ha)</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Recoltă Totală (kg)</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Producție (kg/ha)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    Nu există date de recoltă înregistrate pentru anul {selectedYear}.
                                </td>
                            </tr>
                        ) : (
                            reportData.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: '700', color: 'var(--text-main)' }}>{item.parcelName}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ backgroundColor: '#f0fdf4', color: 'var(--primary-green)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                            {item.cropType}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', color: '#555' }}>{item.area.toFixed(2)}</td>
                                    <td style={{ padding: '15px 20px', fontWeight: '600', color: item.totalYieldKg > 0 ? 'var(--text-main)' : '#94a3b8' }}>
                                        {item.totalYieldKg > 0 ? `${item.totalYieldKg.toLocaleString('ro-RO')} kg` : 'Neraportat'}
                                    </td>
                                    <td style={{ padding: '15px 20px', fontWeight: '800', color: 'var(--primary-green)' }}>
                                        {item.yieldPerHa > 0 ? `${Math.round(item.yieldPerHa).toLocaleString('ro-RO')} kg/ha` : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {reportData.length > 0 && (
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="card" style={{ padding: '20px 40px', backgroundColor: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '30px' }}>⚖️</div>
                        <div>
                            <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase' }}>Producție Totală Fermă ({selectedYear})</div>
                            <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalFarmYieldTons} tone</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YieldReportPage;
