import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, LayersControl } from 'react-leaflet';
import BackButton from './BackButton';
import apiClient from '../api/axiosConfig';
import '@geoman-io/leaflet-geoman-free';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';

const GeomanController = ({ setDrawnLayer, setCalculatedArea, setShowSaveForm, mapRef, selectedParcel, setSelectedParcel, isReadOnly }) => {
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (map.pm) {
            if (isReadOnly) {
                map.pm.removeControls();
                return;
            }

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

const getCropColor = (cropType, isSelected) => {
    if (isSelected) return '#ffeb3b';
    
    switch(cropType) {
        case 'Grâu': return '#fbc02d';
        case 'Porumb': return '#388e3c';
        case 'Rapiță': return '#fdd835';
        case 'Floarea Soarelui': return '#ff8f00';
        case 'Orz': return '#cddc39';
        case 'Soia': return '#8d6e63';
        case 'Sfeclă': return '#d32f2f';
        default: return '#4CAF50';
    }
};

function getColorForNDVI(ndvi) {
    if (ndvi < 0.1) return "#FFFF00"; // Galben - sol golaș/stres
    if (ndvi < 0.5) return "#32CD32"; // Verde deschis - vegetație medie
    return "#006400"; // Verde închis - biomasă maximă
}

// --- Funcție Helper pentru Status Activitate ---
const getStatusBadge = (status) => {
    switch(status) {
        case 'COMPLETED': return <span style={{backgroundColor: '#4CAF50', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px'}}>FINALIZAT</span>;
        case 'IN_PROGRESS': return <span style={{backgroundColor: '#FF9800', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px'}}>ÎN LUCRU</span>;
        default: return <span style={{backgroundColor: '#9e9e9e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px'}}>ÎN AȘTEPTARE</span>;
    }
};

const MapPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user?.role;
    const isManager = userRole === 'FARM_MANAGER';

    const [parcels, setParcels] = useState([]);
    const [machineryList, setMachineryList] = useState([]); 
    const [inventoryList, setInventoryList] = useState([]);
    const [employees, setEmployees] = useState([]);

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
    const [newActivityType, setNewActivityType] = useState('ALTELE');
    const [newActivityMachineryIds, setNewActivityMachineryIds] = useState([]);
    const [newActivityWorkerIds, setNewActivityWorkerIds] = useState([]);
    const [newActivityStartDate, setNewActivityStartDate] = useState('');
    
    const [showConsumptions, setShowConsumptions] = useState(false);
    const [activityConsumptions, setActivityConsumptions] = useState([]); 
    const [selectedInventoryItem, setSelectedInventoryItem] = useState('');
    const [consumptionQuantity, setConsumptionQuantity] = useState('');

    const [cropSeasons, setCropSeasons] = useState([]);
    const [showSeasonForm, setShowSeasonForm] = useState(false);
    const [newSeasonYear, setNewSeasonYear] = useState(new Date().getFullYear());
    const [newSeasonCrop, setNewSeasonCrop] = useState('Porumb');
    
    // State-uri pentru Editare Recolta
    const [editingSeasonId, setEditingSeasonId] = useState(null);
    const [editingYieldValue, setEditingYieldValue] = useState('');

    const [selectedActivityYear, setSelectedActivityYear] = useState(new Date().getFullYear());

    // --- State-uri pentru Weather Widget ---
    const [weatherData, setWeatherData] = useState(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    const [weatherError, setWeatherError] = useState('');

    // --- State-uri pentru NDVI Widget ---
    const [selectedPeriod, setSelectedPeriod] = useState("2026-05");
    const [ndviData, setNdviData] = useState(null);
    const [isNdviLoading, setIsNdviLoading] = useState(false);

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
        } catch (err) {
            console.error("Eroare la preluarea utilajelor:", err);
        }
    }, []);

    const fetchInventory = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/inventory');
            setInventoryList(response.data);
        } catch (err) {
            console.error("Eroare la preluarea inventarului:", err);
        }
    }, []);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/farms/employees');
            setEmployees(response.data);
        } catch (err) {
            console.error("Eroare la preluarea angajatilor:", err);
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

    const fetchCropSeasonsForParcel = async (parcelId) => {
        try {
            const response = await apiClient.get(`/api/crop-seasons/parcel/${parcelId}`);
            setCropSeasons(response.data);
        } catch (err) {
            console.error("Eroare la preluarea sezoanelor:", err);
            setCropSeasons([]);
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        const loadInitialData = async () => {
            if (isMounted) {
                await fetchParcels();
                await fetchMachinery();
                await fetchInventory();
                await fetchEmployees();
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, [fetchParcels, fetchMachinery, fetchInventory, fetchEmployees]);

    // --- Efect pentru Fetch Meteo ---
    useEffect(() => {
        if (showActivityForm && selectedParcel) {
            const fetchWeatherData = async () => {
                setIsLoadingWeather(true);
                setWeatherError('');
                try {
                    const coords = JSON.parse(selectedParcel.coordinatesJson);
                    if (coords && coords.length > 0) {
                        const lat = coords[0][0];
                        const lng = coords[0][1];
                        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=windspeed_10m,precipitation_probability`);
                        if (!response.ok) {
                            throw new Error('Eroare rețea');
                        }
                        const data = await response.json();
                        setWeatherData(data);
                    }
                } catch (err) {
                    console.error("Eroare preluare meteo:", err);
                    setWeatherError('Nu s-au putut încărca datele meteo.');
                } finally {
                    setIsLoadingWeather(false);
                }
            };
            fetchWeatherData();
        } else {
            setWeatherData(null);
        }
    }, [showActivityForm, selectedParcel]);

    // --- Funcție Semafor Meteo ---
    const getWeatherStatus = (windspeed) => {
        if (windspeed > 20) {
            return { color: '#d32f2f', text: 'ROȘU: Vânt puternic! Interzis erbicidare/stropire.' };
        } else if (windspeed >= 10 && windspeed <= 20) {
            return { color: '#fbc02d', text: 'GALBEN: Atenție la derivă, vânt moderat.' };
        } else {
            return { color: '#388e3c', text: 'VERDE: Condiții optime pentru tratamente.' };
        }
    };

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

    const fetchNdvi = async (parcelId, period) => {
        setIsNdviLoading(true);
        try {
            const res = await apiClient.get(`/api/ndvi/parcel/${parcelId}?period=${period}`);
            setNdviData(res.data);
        } catch (e) {
            console.error("Eroare preluare NDVI:", e);
            setNdviData(null);
        } finally {
            setIsNdviLoading(false);
        }
    };

    useEffect(() => {
        if (selectedParcel && isSidebarOpen) {
            fetchNdvi(selectedParcel.id, selectedPeriod);
        }
    }, [selectedPeriod]);

    const handleParcelClick = (parcel) => {
        setSelectedParcel(parcel);
        setIsSidebarOpen(true);
        setShowActivityForm(false);
        setShowSeasonForm(false); 
        
        const loadParcelData = async () => {
            await fetchActivitiesForParcel(parcel.id);
            await fetchCropSeasonsForParcel(parcel.id); 
            await fetchNdvi(parcel.id, selectedPeriod);
        };
        loadParcelData();
    };


    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedParcel(null);
        setShowActivityForm(false);
        setShowSeasonForm(false);
        setActivities([]);
        setCropSeasons([]);
        setActivityConsumptions([]);
        setShowConsumptions(false);
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

    const handleAddConsumptionToList = () => {
        if (!selectedInventoryItem || !consumptionQuantity) return;
        
        const item = inventoryList.find(i => i.id.toString() === selectedInventoryItem);
        if (item && parseFloat(consumptionQuantity) > item.quantityAvailable) {
             alert(`Atenție! Nu aveți suficient stoc. Disponibil: ${item.quantityAvailable} ${item.unitOfMeasure}`);
             return;
        }

        const newConsumption = {
            inventoryItemId: parseInt(selectedInventoryItem),
            quantityUsed: parseFloat(consumptionQuantity),
            itemName: item ? item.name : '',
            unit: item ? item.unitOfMeasure : ''
        };

        setActivityConsumptions([...activityConsumptions, newConsumption]);
        
        setSelectedInventoryItem('');
        setConsumptionQuantity('');
    };

    const handleRemoveConsumptionFromList = (indexToRemove) => {
        setActivityConsumptions(activityConsumptions.filter((_, index) => index !== indexToRemove));
    };

    const handleAddActivity = async () => {
        if (!newActivityTitle || !selectedParcel) {
            alert("Completați titlul activității.");
            return;
        }

        if (!newActivityWorkerIds || newActivityWorkerIds.length === 0) {
            alert("Vă rugăm să selectați cel puțin un muncitor pentru această lucrare.");
            return;
        }
        
        const consumptionsPayload = activityConsumptions.map(c => ({
            inventoryItemId: c.inventoryItemId,
            quantityUsed: c.quantityUsed
        }));

        const activityPayload = {
            title: newActivityTitle,
            type: newActivityType,
            startDate: newActivityStartDate,
            parcelId: selectedParcel.id,
            machineryIds: newActivityMachineryIds,
            assignedWorkerIds: newActivityWorkerIds,
            consumptions: consumptionsPayload
        };

        try {
            await apiClient.post('/api/activities', activityPayload);
            await fetchActivitiesForParcel(selectedParcel.id);
            await fetchInventory();

            setNewActivityTitle('');
            setNewActivityType('ALTELE');
            setNewActivityStartDate('');
            setNewActivityMachineryIds([]);
            setNewActivityWorkerIds([]);
            setActivityConsumptions([]);
            setShowConsumptions(false);
            setShowActivityForm(false);
        } catch (err) {

             console.error("Eroare la salvarea activității:", err);
             const errorMsg = err.response?.data?.message || "Nu s-a putut salva activitatea. Verificați stocurile.";
             alert(errorMsg);
        }
    };

    const handleAddCropSeason = async () => {
        if (!newSeasonYear || !newSeasonCrop || !selectedParcel) return;

        const seasonPayload = {
            harvestYear: newSeasonYear,
            cropType: newSeasonCrop,
            parcelId: selectedParcel.id
        };

        try {
            await apiClient.post('/api/crop-seasons', seasonPayload);
            await fetchCropSeasonsForParcel(selectedParcel.id); 
            setNewSeasonYear(new Date().getFullYear()); 
            setNewSeasonCrop('Porumb');
            setShowSeasonForm(false);
        } catch (err) {
            console.error("Eroare la adăugarea sezonului:", err);
            alert("Nu s-a putut salva sezonul.");
        }
    };

    const handleUpdateYield = async (seasonId) => {
        if (!editingYieldValue || !selectedParcel) return;

        try {
            await apiClient.put(`/api/crop-seasons/${seasonId}`, {
                totalYieldKg: parseFloat(editingYieldValue)
            });
            await fetchCropSeasonsForParcel(selectedParcel.id);
            setEditingSeasonId(null);
            setEditingYieldValue('');
        } catch (err) {
            console.error("Eroare la actualizarea recoltei:", err);
            alert("Nu s-a putut salva recolta.");
        }
    };

    const startEditingYield = (season) => {
        setEditingSeasonId(season.id);
        setEditingYieldValue(season.totalYieldKg || '');
    };

    const handleMachinerySelectChange = (e) => {
        const selectedOptions = Array.from(e.target.options)
                                     .filter(option => option.selected)
                                     .map(option => option.value);
        setNewActivityMachineryIds(selectedOptions);
    };

    const handleWorkerSelectChange = (e) => {
        const selectedOptions = Array.from(e.target.options)
                                     .filter(option => option.selected)
                                     .map(option => option.value);
        setNewActivityWorkerIds(selectedOptions);
    };

    const cropOptions = ['Grâu', 'Porumb', 'Rapiță', 'Floarea Soarelui', 'Orz', 'Soia', 'Sfeclă', 'Altele'];

    const activityTypeLabels = {
        'ARAT': '🚜 Arat',
        'SEMANAT': '🌱 Semănat',
        'RECOLTAT': '🌾 Recoltat',
        'IRIGAT': '💧 Irigat',
        'TRATAMENT': '🧪 Tratament',
        'ALTELE': '📋 Altele'
    };

    const sidebarStyle = {
        position: 'absolute',
        top: '0',
        right: isSidebarOpen ? '0' : '-550px',
        width: '500px',
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
            
            <BackButton style={{ position: 'absolute', top: '20px', left: '60px', zIndex: 1002 }} />

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
                    isReadOnly={isManager}
                />

                {parcels.map(parcel => {
                    try {
                        const coordinates = JSON.parse(parcel.coordinatesJson);
                        const isSelected = selectedParcel && selectedParcel.id === parcel.id;
                        let parcelColor = getCropColor(parcel.cropType, isSelected);

                        if (isSelected && ndviData && ndviData.ndviValue !== undefined) {
                            parcelColor = getColorForNDVI(ndviData.ndviValue);
                        }
                        
                        return (
                            <Polygon 
                                key={parcel.id} 
                                positions={coordinates} 
                                pathOptions={{ 
                                    color: parcelColor,
                                    weight: isSelected ? 4 : 2,
                                    fillOpacity: isSelected ? 0.6 : 0.4
                                }}
                                eventHandlers={{
                                    click: () => handleParcelClick(parcel),
                                    'pm:edit': (e) => {
                                        if (isManager) return;
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

            {(showSaveForm && !isManager) && (
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
                                disabled={isManager}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Cultură Curentă:</label>
                            <select 
                                value={selectedParcel.cropType} 
                                onChange={(e) => setSelectedParcel({...selectedParcel, cropType: e.target.value})}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                disabled={isManager}
                            >
                                {cropOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'var(--light-gray)', borderRadius: '4px', fontSize: '14px', borderLeft: '4px solid #ffeb3b' }}>
                            <strong>Suprafață calculată (Geoman):</strong> {selectedParcel.areaHectares.toFixed(4)} ha
                        </div>

                        {/* --- WIDGET NDVI --- */}
                        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px', borderLeft: '4px solid #2e7d32' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ margin: 0, color: '#2e7d32' }}>🛰️ Analiză NDVI (Satelit)</h4>
                                {isNdviLoading && <span style={{ fontSize: '12px', color: '#666' }}>Se încarcă...</span>}
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Alegeți perioada (Time-Lapse):</label>
                                <select
                                    value={selectedPeriod}
                                    onChange={e => setSelectedPeriod(e.target.value)}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' }}
                                >
                                    <option value="2026-03">Martie 2026</option>
                                    <option value="2026-04">Aprilie 2026</option>
                                    <option value="2026-05">Mai 2026</option>
                                    <option value="2026-06">Iunie 2026</option>
                                    <option value="2026-07">Iulie 2026</option>
                                    <option value="2026-08">August 2026</option>
                                    <option value="2026-09">Septembrie 2026</option>
                                    <option value="2026-10">Octombrie 2026</option>
                                </select>
                            </div>
                            {ndviData ? (
                                <div>
                                    <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                                        <strong>Valoare NDVI:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold', color: getColorForNDVI(ndviData.ndviValue) }}>{ndviData.ndviValue.toFixed(2)}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                        Sursa date: {ndviData.isMockData ? 'Cache / Estimare locală (Fallback)' : 'Live Sentinel Hub API'}
                                    </div>
                                </div>
                            ) : (
                                !isNdviLoading && <p style={{ fontSize: '12px', color: 'red', margin: 0 }}>Nu s-au putut încărca datele NDVI.</p>
                            )}
                        </div>
                        {/* --- END WIDGET NDVI --- */}


                        <div style={{ marginBottom: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0 }}>Jurnal Activități</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Anul:</label>
                                    <select 
                                        value={selectedActivityYear} 
                                        onChange={(e) => setSelectedActivityYear(parseInt(e.target.value))}
                                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                                    >
                                        {[2024, 2025, 2026, 2027].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {activities.filter(act => new Date(act.startDate).getFullYear() === selectedActivityYear).length === 0 ? (
                                <p style={{fontSize: '13px', color: '#888', fontStyle: 'italic'}}>Nu există activități înregistrate pentru anul {selectedActivityYear}.</p>
                            ) : (
                                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#444', marginBottom: '15px' }}>
                                    {activities
                                        .filter(act => new Date(act.startDate).getFullYear() === selectedActivityYear)
                                        .map((act) => (
                                        <li key={act.id} style={{marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px dashed #eee'}}>
                                            <strong style={{fontSize: '14px'}}>
                                                {activityTypeLabels[act.type] || act.type}
                                                {act.title && <span style={{fontWeight: 'normal', color: '#666'}}> - {act.title}</span>}
                                            </strong>
                                            <span style={{color: '#888', marginLeft: '5px'}}>
                                                ({new Date(act.startDate).toLocaleDateString('ro-RO')})
                                            </span>
                                            {getStatusBadge(act.status)}

                                            {act.harvestedYieldKg > 0 && (
                                                <div style={{color: 'var(--primary-green)', fontWeight: 'bold', marginTop: '4px', marginLeft: '10px', fontSize: '12px'}}>
                                                    ⚖️ Recoltă: {act.harvestedYieldKg.toLocaleString('ro-RO')} kg
                                                </div>
                                            )}
                                            {act.machineries && act.machineries.length > 0 && (
                                                 <div style={{color: '#555', marginTop: '4px', marginLeft: '10px'}}>
                                                     🚜 <span style={{fontWeight: '500'}}>Utilaje:</span> {act.machineries.map(m => `${m.name}`).join(', ')}
                                                 </div>
                                            )}

                                            {act.assignedWorkers && act.assignedWorkers.length > 0 && (
                                                 <div style={{color: '#555', marginTop: '4px', marginLeft: '10px'}}>
                                                     👥 <span style={{fontWeight: '500'}}>Muncitori:</span> {act.assignedWorkers.map(w => w.username).join(', ')}
                                                 </div>
                                            )}
                                            
                                            {act.consumptions && act.consumptions.length > 0 && (
                                                <div style={{marginTop: '4px', marginLeft: '10px'}}>
                                                    🧪 <span style={{fontWeight: '500', color: '#555'}}>Consum:</span>
                                                    <ul style={{margin: '2px 0 0 0', paddingLeft: '20px', color: '#d32f2f', fontWeight: 'bold'}}>
                                                        {act.consumptions.map(cons => (
                                                            <li key={cons.id}>
                                                                {cons.quantityUsed} {cons.inventoryItem.unitOfMeasure} de {cons.inventoryItem.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {(!showActivityForm && !isManager) && (
                                <button 
                                    onClick={() => setShowActivityForm(true)}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', fontWeight: 'bold', padding: 0, fontSize: '14px' }}
                                >
                                    + Adaugă lucrare
                                </button>
                            )}

                            {showActivityForm && (
                                <div style={{ backgroundColor: 'var(--light-gray)', padding: '15px', borderRadius: '8px', marginTop: '10px', border: '1px solid var(--border-color)' }}>
                                    
                                    {/* --- WIDGET METEO --- */}
                                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
                                        <h5 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🌤️ Fereastră Optimă Tratamente</h5>
                                        {isLoadingWeather ? (
                                            <p style={{ fontSize: '12px', margin: 0 }}>Se încarcă datele meteo pentru această parcelă...</p>
                                        ) : weatherError ? (
                                            <p style={{ fontSize: '12px', color: 'red', margin: 0 }}>{weatherError}</p>
                                        ) : weatherData && weatherData.current_weather ? (
                                            <div>
                                                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', marginBottom: '8px', color: '#333' }}>
                                                    <span><strong>Temp:</strong> {weatherData.current_weather.temperature}°C</span>
                                                    <span><strong>Vânt:</strong> {weatherData.current_weather.windspeed} km/h</span>
                                                </div>
                                                <div style={{ 
                                                    padding: '8px', 
                                                    borderRadius: '4px', 
                                                    backgroundColor: getWeatherStatus(weatherData.current_weather.windspeed).color,
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center'
                                                }}>
                                                    {getWeatherStatus(weatherData.current_weather.windspeed).text}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    {/* --- END WIDGET METEO --- */}

                                    <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                        Tip Activitate:
                                    </label>
                                    <select 
                                        value={newActivityType} 
                                        onChange={e => setNewActivityType(e.target.value)}
                                        style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                                    >
                                        {Object.entries(activityTypeLabels).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>

                                    <input 
                                        type="text" 
                                        placeholder="Detalii suplimentare (opțional)" 
                                        value={newActivityTitle} 
                                        onChange={e => setNewActivityTitle(e.target.value)}
                                        style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />

                                    <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                        📅 Data și ora planificată:
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        value={newActivityStartDate} 
                                        onChange={e => setNewActivityStartDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                    
                                    <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                        🚜 Selectați utilajele:
                                    </label>
                                    <select 
                                        multiple 
                                        value={newActivityMachineryIds} 
                                        onChange={handleMachinerySelectChange}
                                        style={{ width: '100%', padding: '6px', marginBottom: '15px', boxSizing: 'border-box', height: '60px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    >
                                        {machineryList.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.model})</option>
                                        ))}
                                    </select>

                                    <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                        👥 Alocați muncitori:
                                    </label>
                                    <select 
                                        multiple 
                                        value={newActivityWorkerIds} 
                                        onChange={handleWorkerSelectChange}
                                        style={{ width: '100%', padding: '6px', marginBottom: '15px', boxSizing: 'border-box', height: '60px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    >
                                        {employees.filter(emp => emp.role === 'WORKER').map(w => (
                                            <option key={w.id} value={w.id}>{w.username}</option>
                                        ))}
                                    </select>

                                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px', border: '1px dashed #ccc' }}>
                                        <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                            🧪 Consumabile (Erbicid, Sămânță etc.):
                                        </label>
                                        
                                        {activityConsumptions.length > 0 && (
                                            <ul style={{ paddingLeft: '20px', fontSize: '12px', marginBottom: '10px', color: '#d32f2f' }}>
                                                {activityConsumptions.map((cons, idx) => (
                                                    <li key={idx}>
                                                        {cons.quantityUsed} {cons.unit} - {cons.itemName} 
                                                        <button onClick={() => handleRemoveConsumptionFromList(idx)} style={{background:'none', border:'none', color:'red', cursor:'pointer', marginLeft:'5px'}}>✖</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {!showConsumptions ? (
                                            <button type="button" onClick={() => setShowConsumptions(true)} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                                                + Adaugă produs din Magazie
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                <select 
                                                    value={selectedInventoryItem} 
                                                    onChange={e => setSelectedInventoryItem(e.target.value)}
                                                    style={{ flex: '1 1 120px', padding: '6px', fontSize: '12px' }}
                                                >
                                                    <option value="">Alege produs...</option>
                                                    {inventoryList.map(item => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name} (Stoc: {item.quantityAvailable}{item.unitOfMeasure})
                                                        </option>
                                                    ))}
                                                </select>
                                                <input 
                                                    type="number" 
                                                    placeholder="Cantitate" 
                                                    value={consumptionQuantity} 
                                                    onChange={e => setConsumptionQuantity(e.target.value)}
                                                    style={{ flex: '0 0 70px', padding: '6px', fontSize: '12px' }}
                                                />
                                                <button type="button" onClick={handleAddConsumptionToList} style={{ padding: '6px 10px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Adaugă</button>
                                                <button type="button" onClick={() => setShowConsumptions(false)} style={{ padding: '6px 10px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Închide</button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn-primary" onClick={handleAddActivity} style={{ padding: '8px 10px', fontSize: '14px', flex: 1, fontWeight: 'bold' }}>Salvează Lucrarea</button>
                                        <button className="btn-secondary" onClick={() => setShowActivityForm(false)} style={{ padding: '8px 10px', fontSize: '14px', flex: 1 }}>Anulează</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Istoricul Culturilor (Rotație)</h4>
                            
                            {cropSeasons.length === 0 ? (
                                <p style={{fontSize: '13px', color: '#888', fontStyle: 'italic'}}>Niciun istoric înregistrat.</p>
                            ) : (
                                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#444', marginBottom: '15px' }}>
                                    {cropSeasons.map((season) => (
                                        <li key={season.id} style={{marginBottom: '10px'}}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong>Anul {season.harvestYear}:</strong> <span style={{color: 'var(--primary-green)', fontWeight: 'bold'}}>{season.cropType}</span>
                                                    {season.totalYieldKg && <span style={{marginLeft: '10px', color: '#555', fontStyle: 'italic'}}>({season.totalYieldKg} kg)</span>}
                                                </div>
                                                <button 
                                                    onClick={() => startEditingYield(season)}
                                                    style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                                                >
                                                    ⚖️ Recoltă
                                                </button>
                                            </div>

                                            {editingSeasonId === season.id && (
                                                <div style={{ marginTop: '5px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                    <input 
                                                        type="number" 
                                                        value={editingYieldValue} 
                                                        onChange={e => setEditingYieldValue(e.target.value)} 
                                                        placeholder="Kg"
                                                        style={{ width: '80px', padding: '4px', fontSize: '12px' }}
                                                    />
                                                    <button onClick={() => handleUpdateYield(season.id)} className="btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>Salvați</button>
                                                    <button onClick={() => setEditingSeasonId(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>X</button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {(!showSeasonForm && !isManager) && (
                                <button 
                                    onClick={() => setShowSeasonForm(true)}
                                    style={{ background: 'none', border: 'none', color: '#FF9800', cursor: 'pointer', fontWeight: 'bold', padding: 0, fontSize: '14px' }}
                                >
                                    + Adaugă an/cultură
                                </button>
                            )}

                            {showSeasonForm && (
                                <div style={{ backgroundColor: '#fff8e1', padding: '10px', borderRadius: '5px', marginTop: '10px', border: '1px solid #ffe082' }}>
                                    <div style={{display: 'flex', gap: '10px', marginBottom: '8px'}}>
                                        <div style={{flex: 1}}>
                                            <label style={{fontSize: '12px', color: '#555', display: 'block', marginBottom: '2px'}}>Anul Recoltei:</label>
                                            <input 
                                                type="number" 
                                                value={newSeasonYear} 
                                                onChange={e => setNewSeasonYear(e.target.value)}
                                                style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{flex: 2}}>
                                            <label style={{fontSize: '12px', color: '#555', display: 'block', marginBottom: '2px'}}>Cultura:</label>
                                            <select 
                                                value={newSeasonCrop} 
                                                onChange={e => setNewSeasonCrop(e.target.value)}
                                                style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                                            >
                                                {cropOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn-primary" onClick={handleAddCropSeason} style={{ padding: '5px 10px', fontSize: '12px', flex: 1, backgroundColor: '#FF9800', borderColor: '#FF9800' }}>Salvează Istoric</button>
                                        <button className="btn-secondary" onClick={() => setShowSeasonForm(false)} style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }}>Anulează</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isManager && (
                            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                <button className="btn-primary" onClick={handleUpdateParcel} style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
                                    Salvează Modificările Parcelei
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MapPage;
