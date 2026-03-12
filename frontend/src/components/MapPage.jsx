import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import apiClient from '../api/axiosConfig';
import '@geoman-io/leaflet-geoman-free'; // ESENȚIAL: Importă funcționalitatea Geoman
import * as turf from '@turf/turf';

// Componentă helper pentru a integra controlul de desenare Geoman
const GeomanController = ({ setDrawnLayer, setCalculatedArea, setShowSaveForm }) => {
    const map = useMap();

    useEffect(() => {
        if (map.pm) {
            // Adaugă butoanele de control pe hartă
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
            });

            // Când se finalizează un desen
            map.on('pm:create', (e) => {
                if (e.shape === 'Polygon') {
                    const layer = e.layer;
                    
                    // Șterge alte desene temporare, permițând doar unul
                    map.eachLayer(l => {
                        if (l.options.temp) map.removeLayer(l);
                    });
                    layer.options.temp = true; // Marchează stratul ca fiind temporar

                    const geoJson = layer.toGeoJSON();
                    const areaInSquareMeters = turf.area(geoJson);
                    const areaInHectares = areaInSquareMeters / 10000;

                    setDrawnLayer(layer);
                    setCalculatedArea(areaInHectares); // Stocăm ca număr
                    setShowSaveForm(true);

                    // Recalculează suprafața la editare
                    layer.on('pm:edit', (editEvent) => {
                        const editedGeoJson = editEvent.layer.toGeoJSON();
                        const newAreaInHectares = turf.area(editedGeoJson) / 10000;
                        setCalculatedArea(newAreaInHectares); // Stocăm ca număr
                    });
                }
            });
        }

        return () => { // Funcție de cleanup
            if (map.pm) {
                map.pm.removeControls();
                map.off('pm:create');
            }
        };
    }, [map, setDrawnLayer, setCalculatedArea, setShowSaveForm]);

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
        // Folosim o funcție auto-invocată (IIFE) pentru a gestiona corect Promise-ul returnat de fetchParcels
        (async () => {
            await fetchParcels();
        })();
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
            areaHectares: calculatedArea, // Corect: calculatedArea este deja un număr
            coordinatesJson: JSON.stringify(coordinates)
        };

        try {
            await apiClient.post('/api/parcels', parcelData);
            handleCancel(); // Resetează formularul și desenul
            await fetchParcels(); // Reîncarcă parcelele de pe hartă
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
        if (drawnLayer) drawnLayer.remove();
        setDrawnLayer(null);
        setError('');
    };

    const cropOptions = ['Grâu', 'Porumb', 'Rapiță', 'Floarea Soarelui', 'Orz', 'Altele'];

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <MapContainer center={[45.9432, 24.9668]} zoom={7} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <GeomanController setDrawnLayer={setDrawnLayer} setCalculatedArea={setCalculatedArea} setShowSaveForm={setShowSaveForm} />

                {parcels.map(parcel => {
                    try {
                        const coordinates = JSON.parse(parcel.coordinatesJson);
                        return (
                            <Polygon key={parcel.id} positions={coordinates} pathOptions={{ color: 'blue' }}>
                                <Tooltip><strong>{parcel.name}</strong><br />{parcel.cropType}<br />{parcel.areaHectares} ha</Tooltip>
                            </Polygon>
                        );
                    } catch (e) {
                        console.error("Nu s-au putut parsa coordonatele pentru parcela " + parcel.id, e);
                        return null;
                    }
                })}
            </MapContainer>

            {showSaveForm && (
                <div style={{ position: 'absolute', top: '70px', right: '10px', backgroundColor: 'white', padding: '20px', borderRadius: '5px', zIndex: 1001, boxShadow: '0 2px 10px rgba(0,0,0,0.2)', width: '300px' }}>
                    <h3>Salvează Tarla Nouă</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Nume Tarla:</label>
                        <input type="text" value={newParcelName} onChange={(e) => setNewParcelName(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Tip Cultură:</label>
                        <select value={newParcelCrop} onChange={(e) => setNewParcelCrop(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                            {cropOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}><strong>Suprafață:</strong> {calculatedArea.toFixed(4)} ha</div>
                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleSave} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>Salvează</button>
                        <button onClick={handleCancel} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>Anulează</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPage;