import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, LayersControl, FeatureGroup } from 'react-leaflet';
import apiClient from '../api/axiosConfig';
import { useMap } from 'react-leaflet/hooks';
import '@geoman-io/leaflet-geoman-free';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css'; // Asigură-te că CSS-ul Leaflet este încărcat

// Componentă pentru controlul Geoman
const GeomanController = ({ setDrawnLayer, setCalculatedArea, setShowSaveForm, mapRef }) => {
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.pm) {
            map.pm.addControls({
                position: 'topleft',
                drawCircle: false,
                drawMarker: false,
                drawCircleMarker: false,
                drawPolyline: false,
                drawRectangle: false,
                cutPolygon: false,
                editMode: true,
                dragMode: true,
                removalMode: true, // Adăugat pentru a putea șterge desene greșite
            });

            const handleCreate = (e) => {
                if (e.shape === 'Polygon') {
                    const layer = e.layer;
                    
                    // Ștergem straturile temporare anterioare pentru a păstra doar unul
                    map.eachLayer(l => {
                        if (l.options && l.options.temp) map.removeLayer(l);
                    });
                    layer.options.temp = true;

                    const geoJson = layer.toGeoJSON();
                    const areaInSquareMeters = turf.area(geoJson);
                    const areaInHectares = areaInSquareMeters / 10000;

                    setDrawnLayer(layer);
                    setCalculatedArea(areaInHectares);
                    setShowSaveForm(true);

                    layer.on('pm:edit', (editEvent) => {
                        const editedGeoJson = editEvent.layer.toGeoJSON();
                        const newAreaInHectares = turf.area(editedGeoJson) / 10000;
                        setCalculatedArea(newAreaInHectares);
                    });
                }
            };

            map.on('pm:create', handleCreate);

            return () => {
                if (map.pm) {
                    map.pm.removeControls();
                    map.off('pm:create', handleCreate);
                }
            };
        }
    }, [mapRef, setDrawnLayer, setCalculatedArea, setShowSaveForm]);

    return null;
};

const MapPage = () => {
    const [parcels, setParcels] = useState([]);
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [newParcelName, setNewParcelName] = useState('');
    const [newParcelCrop, setNewParcelCrop] = useState('Grâu');
    const [calculatedArea, setCalculatedArea] = useState(0);
    const [drawnLayer, setDrawnLayer] = useState(null);
    const [error, setError] = useState('');
    
    // State pentru Sidebar (Inspecție Virtuală)
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Ref pentru hartă pentru a-l pasa la Geoman
    const mapRef = useRef(null);

    const fetchParcels = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/parcels');
            setParcels(response.data);
        } catch (err) {
            console.error("Eroare la preluarea parcelelor:", err);
            setError("Nu s-au putut încărca parcelele existente.");
        }
    }, []);

    useEffect(() => {
        fetchParcels();
    }, [fetchParcels]);

    const handleSave = async () => {
        if (!newParcelName || !drawnLayer) {
            setError("Numele tarlalei și un poligon desenat sunt obligatorii.");
            return;
        }
        setError('');

        const coordinates = drawnLayer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);

        const parcelData = {
            name: newParcelName,
            cropType: newParcelCrop,
            areaHectares: calculatedArea,
            coordinatesJson: JSON.stringify(coordinates)
        };

        try {
            await apiClient.post('/api/parcels', parcelData);
            handleCancel();
            await fetchParcels();
        } catch (err) {
            console.error("Eroare la salvarea parcelei:", err);
            setError("Salvarea a eșuat. Asigurați-vă că sunteți autentificat.");
        }
    };

    const handleCancel = () => {
        setShowSaveForm(false);
        setNewParcelName('');
        setNewParcelCrop('Grâu');
        setCalculatedArea(0);
        if (drawnLayer && mapRef.current) {
             mapRef.current.removeLayer(drawnLayer);
        }
        setDrawnLayer(null);
        setError('');
    };

    const handleParcelClick = (parcel) => {
        setSelectedParcel(parcel);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedParcel(null);
    };

    // Funcție provizorie pentru salvarea modificărilor din sidebar
    const handleUpdateParcel = async () => {
        try {
            // Aici ar trebui un apel PUT/PATCH către backend: apiClient.put(`/api/parcels/${selectedParcel.id}`, selectedParcel)
            // Momentan doar simulăm și închidem
            alert(`S-au salvat modificările pentru ${selectedParcel.name} (Simulare)`);
            fetchParcels(); // Reîncărcăm pentru a vedea eventualele schimbări (dacă ar fi fost salvate pe server)
        } catch (err) {
            console.error("Eroare la actualizare:", err);
        }
    };

    const cropOptions = ['Grâu', 'Porumb', 'Rapiță', 'Floarea Soarelui', 'Orz', 'Soia', 'Altele'];

    // Stiluri pentru Sidebar
    const sidebarStyle = {
        position: 'absolute',
        top: '0',
        right: isSidebarOpen ? '0' : '-400px',
        width: '350px',
        height: '100%',
        backgroundColor: 'var(--white-color)',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease-in-out',
        zIndex: 1000,
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            
            <MapContainer 
                center={[45.9432, 24.9668]} 
                zoom={7} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                ref={mapRef}
            >
                {/* 1. Straturi Satelitare și Rutiere folosing LayersControl */}
                <LayersControl position="topright">
                    
                    {/* Stratul Satelitar (Google Maps Hybrid ca exemplu gratuit, sau Esri) */}
                    <LayersControl.BaseLayer checked name="Satelit (Esri)">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        />
                    </LayersControl.BaseLayer>

                    {/* Stratul Rutier (OpenStreetMap clasic) */}
                    <LayersControl.BaseLayer name="Harta Rutieră (OSM)">
                        <TileLayer 
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                            attribution='&copy; OpenStreetMap' 
                        />
                    </LayersControl.BaseLayer>

                    {/* Exemplu Mock pentru viitorul Strat NDVI */}
                    <LayersControl.Overlay name="Index NDVI (Mock)">
                        <TileLayer
                            // Acesta este doar un placeholder. În realitate va fi un WMS sau tiles generate dinamic
                            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                            opacity={0.4}
                        />
                    </LayersControl.Overlay>

                </LayersControl>

                <GeomanController 
                    setDrawnLayer={setDrawnLayer} 
                    setCalculatedArea={setCalculatedArea} 
                    setShowSaveForm={setShowSaveForm} 
                    mapRef={mapRef}
                />

                {parcels.map(parcel => {
                    try {
                        const coordinates = JSON.parse(parcel.coordinatesJson);
                        // Culoare diferită în funcție de starea selecției
                        const isSelected = selectedParcel && selectedParcel.id === parcel.id;
                        
                        return (
                            <Polygon 
                                key={parcel.id} 
                                positions={coordinates} 
                                pathOptions={{ 
                                    color: isSelected ? '#ffeb3b' : '#4CAF50', // Galben dacă e selectat, Verde altfel
                                    weight: isSelected ? 4 : 2,
                                    fillOpacity: isSelected ? 0.4 : 0.2
                                }}
                                eventHandlers={{
                                    click: () => handleParcelClick(parcel) // Deschide sidebar-ul la click
                                }}
                            >
                                <Tooltip direction="center" permanent={false}>
                                    <strong>{parcel.name}</strong><br />
                                    {parcel.cropType}<br />
                                    {parcel.areaHectares.toFixed(2)} ha
                                </Tooltip>
                            </Polygon>
                        );
                    } catch (e) {
                        console.error("Nu s-au putut parsa coordonatele pentru parcela " + parcel.id, e);
                        return null;
                    }
                })}
            </MapContainer>

            {/* Formularul pentru adăugare parcelă nouă (rămâne deasupra hărții) */}
            {showSaveForm && (
                <div style={{ position: 'absolute', top: '20px', left: '60px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', zIndex: 1001, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '280px' }}>
                    <h3 style={{marginTop: 0, color: 'var(--primary-green)'}}>Tarla Nouă</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{fontSize: '14px', color: '#555'}}>Nume:</label>
                        <input type="text" value={newParcelName} onChange={(e) => setNewParcelName(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{fontSize: '14px', color: '#555'}}>Cultură:</label>
                        <select value={newParcelCrop} onChange={(e) => setNewParcelCrop(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            {cropOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px', fontSize: '14px' }}><strong>Suprafață:</strong> {calculatedArea.toFixed(2)} ha</div>
                    {error && <p style={{ color: 'red', fontSize: '12px', margin: '5px 0' }}>{error}</p>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" onClick={handleSave} style={{ flex: 1, padding: '8px' }}>Salvează</button>
                        <button className="btn-secondary" onClick={handleCancel} style={{ flex: 1, padding: '8px' }}>Anulează</button>
                    </div>
                </div>
            )}

            {/* Sidebar-ul pentru Inspecție Virtuală */}
            <div style={sidebarStyle}>
                {selectedParcel && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-green)', paddingBottom: '10px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: 'var(--text-color)' }}>Inspecție Tarla</h2>
                            <button onClick={closeSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
                        </div>

                        {/* Detalii de bază editabile */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nume:</label>
                            <input 
                                type="text" 
                                value={selectedParcel.name} 
                                onChange={(e) => setSelectedParcel({...selectedParcel, name: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Cultură Curentă:</label>
                            <select 
                                value={selectedParcel.cropType} 
                                onChange={(e) => setSelectedParcel({...selectedParcel, cropType: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                            >
                                {cropOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'var(--light-gray)', borderRadius: '4px' }}>
                            <strong>Suprafață totală:</strong> {selectedParcel.areaHectares.toFixed(2)} ha
                        </div>

                        {/* Secțiunea de Activități (Simulare) */}
                        <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Activități Recente</h4>
                            <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                                <li>Semănat - 15 Aprilie</li>
                                <li>Erbicidat - 5 Mai</li>
                                <li style={{color: 'var(--primary-green)', cursor: 'pointer'}}>+ Adaugă activitate nouă</li>
                            </ul>
                        </div>

                        {/* Secțiunea Indici (Mock pentru NDVI etc.) */}
                        <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Sănătate Cultură (Mock)</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>NDVI Mediu:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-green)' }}>0.78 (Optim)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Umiditate (NDMI):</span>
                                <span style={{ fontWeight: 'bold', color: '#FFC107' }}>0.45 (Atenție)</span>
                            </div>
                            <button className="btn-secondary" style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}>Vezi Grafic Evoluție</button>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                            <button className="btn-primary" onClick={handleUpdateParcel} style={{ width: '100%', padding: '12px' }}>
                                Salvează Modificările
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MapPage;