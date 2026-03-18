import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, LayersControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useMap } from 'react-leaflet/hooks';
import '@geoman-io/leaflet-geoman-free';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';

// Componentă pentru controlul Geoman
const GeomanController = ({ setDrawnLayer, setCalculatedArea, setShowSaveForm, mapRef, selectedParcel, setSelectedParcel }) => {
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
                removalMode: true,
            });

            const handleCreate = (e) => {
                if (e.shape === 'Polygon') {
                    const layer = e.layer;
                    
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

                    // Pentru desene noi
                    layer.on('pm:edit', (editEvent) => {
                        const editedGeoJson = editEvent.layer.toGeoJSON();
                        const newAreaInHectares = turf.area(editedGeoJson) / 10000;
                        setCalculatedArea(newAreaInHectares);
                    });
                }
            };

            map.on('pm:create', handleCreate);

            // Handler pentru editarea parcelelor DEJA EXISTENTE (pe hartă)
            const handleGlobalEdit = (e) => {
                if (selectedParcel && e.layer) {
                    // Când o formă e modificată pe hartă
                    const editedLayer = e.layer;
                    const editedGeoJson = editedLayer.toGeoJSON();
                    
                    // Recalculează aria
                    const newAreaInHectares = turf.area(editedGeoJson) / 10000;
                    
                    // Extrage noile coordonate
                    const newCoordinates = editedLayer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
                    
                    // Actualizează state-ul selectedParcel (pentru ca butonul Salvare din sidebar sa ia noile date)
                    setSelectedParcel(prev => {
                        if (prev) {
                            return {
                                ...prev,
                                areaHectares: newAreaInHectares,
                                coordinatesJson: JSON.stringify(newCoordinates)
                            };
                        }
                        return prev;
                    });
                }
            };
            
            map.on('pm:globaledit', handleGlobalEdit);

            return () => {
                if (map.pm) {
                    map.pm.removeControls();
                    map.off('pm:create', handleCreate);
                    map.off('pm:globaledit', handleGlobalEdit);
                }
            };
        }
    }, [mapRef, setDrawnLayer, setCalculatedArea, setShowSaveForm, selectedParcel, setSelectedParcel]);

    return null;
};

const MapPage = () => {
    const [parcels, setParcels] = useState([]);
    const [machineryList, setMachineryList] = useState([]); // State pentru utilajele utilizatorului
    
    // State pentru Tarla Noua
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [newParcelName, setNewParcelName] = useState('');
    const [newParcelCrop, setNewParcelCrop] = useState('Grâu');
    const [calculatedArea, setCalculatedArea] = useState(0);
    const [drawnLayer, setDrawnLayer] = useState(null);
    const [error, setError] = useState('');
    
    // State pentru Sidebar (Inspecție Virtuală / Editare)
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // State pentru Activități Locale (Simulare în memorie până va exista tabelul Activities)
    // Va avea forma: { parcelId: [{ title, date, machineryId }] }
    const [localActivities, setLocalActivities] = useState({});
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [newActivityTitle, setNewActivityTitle] = useState('');
    const [newActivityMachinery, setNewActivityMachinery] = useState('');

    const navigate = useNavigate();
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

    const fetchMachinery = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/machinery');
            setMachineryList(response.data);
            if(response.data.length > 0) {
                 setNewActivityMachinery(response.data[0].id); // Setează implicit primul utilaj
            }
        } catch (err) {
            console.error("Eroare la preluarea utilajelor:", err);
        }
    }, []);

    useEffect(() => {
        fetchParcels();
        fetchMachinery();
    }, [fetchParcels, fetchMachinery]);

    const handleSaveNewParcel = async () => {
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
            handleCancelNewParcel();
            await fetchParcels();
        } catch (err) {
            console.error("Eroare la salvarea parcelei:", err);
            setError("Salvarea a eșuat. Asigurați-vă că sunteți autentificat.");
        }
    };

    const handleCancelNewParcel = () => {
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
        setShowActivityForm(false);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedParcel(null);
        setShowActivityForm(false);
    };

    // Funcția REALĂ pentru salvarea modificărilor din sidebar către Baza de Date
    const handleUpdateParcel = async () => {
        if (!selectedParcel) return;
        try {
            await apiClient.put(`/api/parcels/${selectedParcel.id}`, selectedParcel);
            alert(`S-au salvat cu succes modificările pentru ${selectedParcel.name}!`);
            await fetchParcels(); // Reîncărcăm harta pentru a asigura sincronizarea
        } catch (err) {
            console.error("Eroare la actualizare:", err);
            alert("A apărut o eroare la salvare. Modificările nu au fost aplicate.");
        }
    };

    // Funcție pentru adăugarea unei activități în lista locală
    const handleAddActivity = () => {
        if (!newActivityTitle || !selectedParcel) return;
        
        const activity = {
            title: newActivityTitle,
            date: new Date().toLocaleDateString('ro-RO'),
            machineryId: newActivityMachinery
        };

        setLocalActivities(prev => {
            const currentList = prev[selectedParcel.id] || [];
            return {
                ...prev,
                [selectedParcel.id]: [...currentList, activity]
            };
        });

        setNewActivityTitle('');
        setShowActivityForm(false);
    };

    const getMachineryName = (id) => {
        const mach = machineryList.find(m => m.id.toString() === id.toString());
        return mach ? `${mach.brandModel} (${mach.licensePlate})` : 'Utilaj necunoscut';
    };

    const cropOptions = ['Grâu', 'Porumb', 'Rapiță', 'Floarea Soarelui', 'Orz', 'Soia', 'Altele'];

    const sidebarStyle = {
        position: 'absolute',
        top: '0',
        right: isSidebarOpen ? '0' : '-450px',
        width: '400px',
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
            
            {/* Buton Înapoi */}
            <button 
                onClick={() => navigate('/farmer')} 
                className="btn-secondary"
                style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1002, padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                &#8592; Înapoi la Dashboard
            </button>

            <MapContainer 
                center={[45.9432, 24.9668]} 
                zoom={7} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                ref={mapRef}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Satelit (Esri)">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri &mdash; Source: Esri...'
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Harta Rutieră (OSM)">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                    </LayersControl.BaseLayer>
                    <LayersControl.Overlay name="Index NDVI (Mock)">
                        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" opacity={0.4} />
                    </LayersControl.Overlay>
                </LayersControl>

                <GeomanController 
                    setDrawnLayer={setDrawnLayer} 
                    setCalculatedArea={setCalculatedArea} 
                    setShowSaveForm={setShowSaveForm} 
                    mapRef={mapRef}
                    selectedParcel={selectedParcel}
                    setSelectedParcel={setSelectedParcel}
                />

                {parcels.map(parcel => {
                    try {
                        const coordinates = JSON.parse(parcel.coordinatesJson);
                        const isSelected = selectedParcel && selectedParcel.id === parcel.id;
                        
                        return (
                            <Polygon 
                                key={parcel.id} 
                                positions={coordinates} 
                                pathOptions={{ 
                                    color: isSelected ? '#ffeb3b' : '#4CAF50',
                                    weight: isSelected ? 4 : 2,
                                    fillOpacity: isSelected ? 0.4 : 0.2
                                }}
                                eventHandlers={{
                                    click: () => handleParcelClick(parcel)
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
                        return null;
                    }
                })}
            </MapContainer>

            {/* Formular Tarla Nouă */}
            {showSaveForm && (
                <div style={{ position: 'absolute', top: '70px', left: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', zIndex: 1001, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '280px' }}>
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
                        <button className="btn-primary" onClick={handleSaveNewParcel} style={{ flex: 1, padding: '8px' }}>Salvează</button>
                        <button className="btn-secondary" onClick={handleCancelNewParcel} style={{ flex: 1, padding: '8px' }}>Anulează</button>
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

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Nume:</label>
                            <input 
                                type="text" 
                                value={selectedParcel.name} 
                                onChange={(e) => setSelectedParcel({...selectedParcel, name: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Cultură Curentă:</label>
                            <select 
                                value={selectedParcel.cropType} 
                                onChange={(e) => setSelectedParcel({...selectedParcel, cropType: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                            >
                                {cropOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'var(--light-gray)', borderRadius: '4px', fontSize: '14px' }}>
                            <strong>Suprafață calculată (Geoman):</strong> {selectedParcel.areaHectares.toFixed(4)} ha
                            <div style={{fontSize:'12px', color: '#666', marginTop:'5px'}}>
                                <em>Dacă folosești uneltele din stânga pentru a trage de colțurile tarlalei pe hartă, suprafața se va actualiza automat aici.</em>
                            </div>
                        </div>

                        {/* Secțiunea de Activități - GOLĂ INIȚIAL ȘI INTERACTIVĂ */}
                        <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Jurnal Activități</h4>
                            
                            {(!localActivities[selectedParcel.id] || localActivities[selectedParcel.id].length === 0) ? (
                                <p style={{fontSize: '13px', color: '#888', fontStyle: 'italic'}}>Nu există activități înregistrate.</p>
                            ) : (
                                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#444', marginBottom: '15px' }}>
                                    {localActivities[selectedParcel.id].map((act, index) => (
                                        <li key={index} style={{marginBottom: '5px'}}>
                                            <strong>{act.title}</strong> ({act.date}) <br/>
                                            <span style={{color: 'var(--primary-green)'}}>↳ {getMachineryName(act.machineryId)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {!showActivityForm ? (
                                <button 
                                    onClick={() => setShowActivityForm(true)}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', fontWeight: 'bold', padding: 0, fontSize: '14px' }}
                                >
                                    + Adaugă lucrare
                                </button>
                            ) : (
                                <div style={{ backgroundColor: 'var(--light-gray)', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Arat, Erbicidat, Recoltat" 
                                        value={newActivityTitle} 
                                        onChange={e => setNewActivityTitle(e.target.value)}
                                        style={{ width: '100%', padding: '6px', marginBottom: '8px', boxSizing: 'border-box' }}
                                    />
                                    <select 
                                        value={newActivityMachinery} 
                                        onChange={e => setNewActivityMachinery(e.target.value)}
                                        style={{ width: '100%', padding: '6px', marginBottom: '8px', boxSizing: 'border-box' }}
                                    >
                                        <option value="" disabled>Alegeți utilajul...</option>
                                        {machineryList.map(m => (
                                            <option key={m.id} value={m.id}>{m.brandModel} ({m.licensePlate})</option>
                                        ))}
                                    </select>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn-primary" onClick={handleAddActivity} style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }}>Adaugă</button>
                                        <button className="btn-secondary" onClick={() => setShowActivityForm(false)} style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }}>Anulează</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                            <button className="btn-primary" onClick={handleUpdateParcel} style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                                Salvează Modificările în DB
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MapPage;