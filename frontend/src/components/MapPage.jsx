import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, LayersControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import '@geoman-io/leaflet-geoman-free';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';

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

                    requestAnimationFrame(() => {
                        setDrawnLayer(layer);
                        setCalculatedArea(areaInHectares);
                        setShowSaveForm(true);
                    });

                    layer.on('pm:edit', (editEvent) => {
                        const editedGeoJson = editEvent.layer.toGeoJSON();
                        const newAreaInHectares = turf.area(editedGeoJson) / 10000;
                        setCalculatedArea(newAreaInHectares);
                    });
                }
            };

            map.on('pm:create', handleCreate);

            const handleGlobalEdit = (e) => {
                if (selectedParcel && e.layer) {
                    const editedLayer = e.layer;
                    const editedGeoJson = editedLayer.toGeoJSON();
                    const newAreaInHectares = turf.area(editedGeoJson) / 10000;
                    const newCoordinates = editedLayer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
                    
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
    const [machineryList, setMachineryList] = useState([]); 
    
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [newParcelName, setNewParcelName] = useState('');
    const [newParcelCrop, setNewParcelCrop] = useState('Grâu');
    const [calculatedArea, setCalculatedArea] = useState(0);
    const [drawnLayer, setDrawnLayer] = useState(null);
    const [error, setError] = useState('');
    
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [activities, setActivities] = useState([]);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [newActivityTitle, setNewActivityTitle] = useState('');
    // Am schimbat starea pentru a stoca un array de ID-uri de utilaje în loc de un singur ID
    const [newActivityMachineryIds, setNewActivityMachineryIds] = useState([]);

    const navigate = useNavigate();
    const mapRef = useRef(null);
    const selectedParcelIdRef = useRef(null);

    useEffect(() => {
        selectedParcelIdRef.current = selectedParcel ? selectedParcel.id : null;
    }, [selectedParcel]);

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
            // Am eliminat setarea utilajului implicit, deoarece folosim select multiplu
        } catch (err) {
            console.error("Eroare la preluarea utilajelor:", err);
        }
    }, []);

    const fetchActivitiesForParcel = async (parcelId) => {
        try {
            const response = await apiClient.get(`/api/activities/parcel/${parcelId}`);
            setActivities(response.data);
        } catch (err) {
            console.error("Eroare la preluarea activităților:", err);
            setActivities([]);
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        const loadInitialData = async () => {
            if (isMounted) {
                await fetchParcels();
                await fetchMachinery();
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
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
        
        const loadActivities = async () => {
            await fetchActivitiesForParcel(parcel.id);
        };
        loadActivities();
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedParcel(null);
        setShowActivityForm(false);
        setActivities([]);
    };

    const handleUpdateParcel = async () => {
        if (!selectedParcel) return;
        try {
            await apiClient.put(`/api/parcels/${selectedParcel.id}`, selectedParcel);
            alert(`S-au salvat cu succes modificările pentru ${selectedParcel.name}!`);
            await fetchParcels(); 
        } catch (err) {
            console.error("Eroare la actualizare:", err);
            alert("A apărut o eroare la salvare. Modificările nu au fost aplicate.");
        }
    };

    const handleAddActivity = async () => {
        if (!newActivityTitle || !selectedParcel || newActivityMachineryIds.length === 0) return;
        
        const activityPayload = {
            title: newActivityTitle,
            parcelId: selectedParcel.id,
            machineryIds: newActivityMachineryIds // Trimitem lista de ID-uri
        };

        try {
            await apiClient.post('/api/activities', activityPayload);
            await fetchActivitiesForParcel(selectedParcel.id);
            setNewActivityTitle('');
            setNewActivityMachineryIds([]); // Resetăm selecția după salvare
            setShowActivityForm(false);
        } catch (err) {
             console.error("Eroare la salvarea activității:", err);
             alert("Nu s-a putut salva activitatea.");
        }
    };

    // Funcție pentru a gestiona schimbările în select-ul multiplu
    const handleMachinerySelectChange = (e) => {
        // e.target.options este un obiect de tip HTMLOptionsCollection
        const selectedOptions = Array.from(e.target.options)
                                     .filter(option => option.selected)
                                     .map(option => option.value);
        setNewActivityMachineryIds(selectedOptions);
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
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden', margin: 0, padding: 0, textAlign: 'left', display: 'flex', flexGrow: 1 }}>
            
            <button 
                onClick={() => navigate('/farmer')} 
                className="btn-secondary"
                style={{ position: 'absolute', top: '20px', left: '60px', zIndex: 1002, padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', fontWeight: 'bold' }}
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
                                    click: () => handleParcelClick(parcel),
                                    'pm:edit': (e) => {
                                        const editedLayer = e.layer;
                                        const editedGeoJson = editedLayer.toGeoJSON();
                                        const newAreaInHectares = turf.area(editedGeoJson) / 10000;
                                        const newCoordinates = editedLayer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
                                        
                                        setSelectedParcel({
                                            ...parcel, 
                                            areaHectares: newAreaInHectares,
                                            coordinatesJson: JSON.stringify(newCoordinates)
                                        });
                                        
                                        setIsSidebarOpen(true);
                                        fetchActivitiesForParcel(parcel.id).catch(console.error);
                                    }
                                }}
                            >
                                <Tooltip direction="center" permanent={false}>
                                    <strong>{parcel.name}</strong><br />
                                    {parcel.cropType}<br />
                                    {parcel.areaHectares.toFixed(2)} ha
                                </Tooltip>
                            </Polygon>
                        );
                    } catch (err) {
                        console.warn("Nu s-au putut parsa coordonatele", err);
                        return null;
                    }
                })}
            </MapContainer>

            {showSaveForm && (
                <div style={{ position: 'absolute', top: '70px', left: '60px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', zIndex: 1001, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '280px' }}>
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

                        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'var(--light-gray)', borderRadius: '4px', fontSize: '14px', borderLeft: '4px solid #ffeb3b' }}>
                            <strong>Suprafață calculată (Geoman):</strong> {selectedParcel.areaHectares.toFixed(4)} ha
                        </div>

                        <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Jurnal Activități</h4>
                            
                            {activities.length === 0 ? (
                                <p style={{fontSize: '13px', color: '#888', fontStyle: 'italic'}}>Nu există activități înregistrate.</p>
                            ) : (
                                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#444', marginBottom: '15px' }}>
                                    {activities.map((act) => (
                                        <li key={act.id} style={{marginBottom: '10px'}}>
                                            <strong>{act.title}</strong> 
                                            <span style={{color: '#888', marginLeft: '5px'}}>
                                                ({new Date(act.startDate).toLocaleDateString('ro-RO')})
                                            </span>
                                            <br/>
                                            {act.machineries && act.machineries.map(m => (
                                                 <div key={m.id} style={{color: 'var(--primary-green)', marginTop: '2px'}}>
                                                     ↳ Utilaj: {m.name} ({m.model})
                                                 </div>
                                            ))}
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
                                    {/* Am transformat select-ul într-unul multiplu */}
                                    <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>
                                        Selectați utilajele (Ctrl/Cmd + click pentru mai multe):
                                    </label>
                                    <select 
                                        multiple // Permite selecția multiplă
                                        value={newActivityMachineryIds} 
                                        onChange={handleMachinerySelectChange} // Handler personalizat
                                        style={{ width: '100%', padding: '6px', marginBottom: '8px', boxSizing: 'border-box', height: '100px' }} // Am adăugat height pentru vizibilitate
                                    >
                                        {machineryList.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.model})</option>
                                        ))}
                                    </select>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn-primary" onClick={handleAddActivity} style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }}>Salvează</button>
                                        <button className="btn-secondary" onClick={() => setShowActivityForm(false)} style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }}>Anulează</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                            <button className="btn-primary" onClick={handleUpdateParcel} style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                                Salvează Modificările Parcelei
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MapPage;