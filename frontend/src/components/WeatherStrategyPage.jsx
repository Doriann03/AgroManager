import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const WeatherStrategyPage = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState({ lat: 44.4268, lon: 26.1025 });

    const fetchStrategyData = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/api/weather/strategy?lat=${lat}&lon=${lon}`);
            if (response.data && response.data.forecast) {
                setWeatherData(response.data.forecast);
                setRecommendations(response.data.recommendations);
            } else {
                setError("Datele meteo sunt incomplete.");
            }
        } catch (err) {
            console.error("Eroare la preluarea strategiei meteo:", err);
            setError("Nu s-au putut contacta serviciile meteo. Verificați conexiunea.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchParcelsAndWeather = useCallback(async () => {
        try {
            const parcelsRes = await apiClient.get('/api/parcels');
            if (parcelsRes.data && parcelsRes.data.length > 0) {
                try {
                    const coords = JSON.parse(parcelsRes.data[0].coordinatesJson);
                    if (coords && coords.length > 0) {
                        const lat = coords[0][0];
                        const lon = coords[0][1];
                        setLocation({ lat, lon });
                        fetchStrategyData(lat, lon);
                        return;
                    }
                } catch (e) {
                    console.warn("Eroare la parsarea coordonatelor primei parcele.");
                }
            }
            fetchStrategyData(location.lat, location.lon);
        } catch (err) {
            fetchStrategyData(location.lat, location.lon);
        }
    }, [fetchStrategyData, location.lat, location.lon]);

    useEffect(() => {
        fetchParcelsAndWeather();
    }, [fetchParcelsAndWeather]);

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>🔄 Se analizează datele climatice ultra-locale...</div>;

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <BackButton />
                <div className="card" style={{ marginTop: '20px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
                    <h2 style={{ color: '#dc2626' }}>⚠️ Problemă Tehnică</h2>
                    <p>{error}</p>
                    <button className="btn-primary" onClick={() => fetchParcelsAndWeather()} style={{ marginTop: '20px' }}>Reîncearcă</button>
                </div>
            </div>
        );
    }

    const current = weatherData?.hourly;
    const daily = weatherData?.daily;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <BackButton />
                <h1 style={{ marginLeft: '20px', color: 'var(--primary-green)', margin: 0 }}>Weather Intelligence & Strategie</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                
                {/* Card Sugestii Agricole */}
                <div className="card" style={{ borderLeft: '6px solid #0ea5e9' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        💡 Recomandări Operative
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1', marginBottom: '4px' }}>FEREASTRĂ ERBICIDARE</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{recommendations?.sprayingWindow}</div>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#9a3412', marginBottom: '4px' }}>NECESAR IRIGAȚII</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{recommendations?.irrigationNeed}</div>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginBottom: '4px' }}>CONDIȚII RECOLTARE</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{recommendations?.harvestCondition}</div>
                        </div>
                    </div>
                </div>

                {/* Card Strategie pe Termen Lung */}
                <div className="card" style={{ borderLeft: '6px solid var(--primary-green)' }}>
                    <h3 style={{ marginTop: 0 }}>🧠 Analiză Strategică</h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', fontWeight: '500' }}>
                        {recommendations?.strategicAnalysis || "Analiză în curs de procesare..."}
                    </p>
                    <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', fontSize: '13px', border: '1px solid #dcfce7' }}>
                        ℹ️ <strong>Sfat Expert:</strong> Corelați aceste date cu stadiul de vegetație al culturii. Zilele cu UV ridicat necesită biostimulatori pentru a preveni avortarea florilor.
                    </div>
                </div>
            </div>

            {/* Tabel Prognoza 7 Zile */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                    <h3 style={{ margin: 0 }}>Prognoză Detaliată (7 Zile)</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'white', borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>DATA</th>
                                <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>TEMP (MAX)</th>
                                <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>PRECIPITAȚII</th>
                                <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>UV INDEX</th>
                                <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>CONDIȚIE LUCRU</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!daily?.time ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                        Nu s-au putut procesa rândurile de prognoză.
                                    </td>
                                </tr>
                            ) : (
                                daily.time.map((date, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{new Date(date).toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                                        <td style={{ padding: '15px 20px' }}>{current?.temperature_2m ? `${Math.round(current.temperature_2m[idx * 24 + 14])}°C` : 'N/A'}</td>
                                        <td style={{ padding: '15px 20px' }}>
                                            {daily.precipitation_sum[idx] > 0 ? (
                                                <span style={{ color: '#0284c7', fontWeight: 'bold' }}>💧 {daily.precipitation_sum[idx]} mm</span>
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>Fără precipitații</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <span style={{ 
                                                padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold',
                                                backgroundColor: daily.uv_index_max[idx] > 6 ? '#fee2e2' : '#f0fdf4',
                                                color: daily.uv_index_max[idx] > 6 ? '#991b1b' : '#166534'
                                            }}>
                                                {daily.uv_index_max[idx]}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            {(daily.precipitation_sum[idx] < 1 && current?.wind_speed_10m && current.wind_speed_10m[idx * 24 + 10] < 15) ? (
                                                <span style={{ color: '#16a34a' }}>✅ Favorabilă</span>
                                            ) : (
                                                <span style={{ color: '#dc2626' }}>⚠️ Restricționată</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WeatherStrategyPage;
