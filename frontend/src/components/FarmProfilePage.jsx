import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const FarmProfilePage = () => {
    const [farm, setFarm] = useState({
        name: '',
        address: '',
        contactEmail: '',
        visionAndGoals: ''
    });
    const [totalArea, setTotalArea] = useState(0);
    const [notes, setNotes] = useState([]);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    const fetchFarmData = useCallback(async () => {
        setLoading(true);

        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        const [farmResult, parcelsResult, notesResult] = await Promise.allSettled([
            apiClient.get('/api/farms/my-farm'),
            apiClient.get('/api/parcels'),
            apiClient.get('/api/farms/notes')
        ]);

        if (farmResult.status === 'fulfilled') {
            setFarm(farmResult.value.data);
        } else {
            console.error('Eroare la incarcarea profilului fermei:', farmResult.reason);
            if (storedUser?.farmName) {
                setFarm((current) => ({ ...current, name: storedUser.farmName }));
            }
        }

        if (parcelsResult.status === 'fulfilled' && Array.isArray(parcelsResult.value.data)) {
            setTotalArea(calculateTotalArea(parcelsResult.value.data));
        } else {
            console.error('Eroare la incarcarea parcelelor pentru suprafata totala:', parcelsResult.reason);
            setTotalArea(0);
        }

        if (notesResult.status === 'fulfilled' && Array.isArray(notesResult.value.data)) {
            setNotes(notesResult.value.data);
        } else {
            console.error('Eroare la incarcarea notitelor fermei:', notesResult.reason);
            setNotes([]);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFarmData();
    }, [fetchFarmData]);

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        setSaveLoading(true);
        try {
            const response = await apiClient.put('/api/farms/my-farm', farm);
            setFarm(response.data);
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (storedUser) {
                localStorage.setItem('user', JSON.stringify({ ...storedUser, farmName: response.data.name }));
            }
            alert('Profilul fermei a fost actualizat.');
        } catch (error) {
            console.error('Eroare la actualizarea profilului:', error);
            alert('A aparut o eroare la salvare.');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleAddNote = async (event) => {
        event.preventDefault();
        if (!newNote.title || !newNote.content) return;

        try {
            const response = await apiClient.post('/api/farms/notes', newNote);
            setNotes([response.data, ...notes]);
            setNewNote({ title: '', content: '' });
            setShowNoteForm(false);
        } catch (error) {
            console.error('Eroare la adaugarea notei:', error);
            alert('Nu s-a putut salva nota.');
        }
    };

    if (loading) {
        return <div className="empty-state">Se incarca profilul fermei...</div>;
    }

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header-left">
                    <BackButton />
                    <div>
                        <h1 className="page-title">Profil ferma</h1>
                        <p className="page-subtitle">Date generale, obiective strategice si jurnal de decizii.</p>
                    </div>
                </div>
            </div>

            <div className="metric-grid" style={{ marginBottom: '22px' }}>
                <Metric label="Suprafata totala" value={`${totalArea.toFixed(2)} ha`} />
                <Metric label="Inregistrari jurnal" value={notes.length} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px', alignItems: 'start' }}>
                <section className="card">
                    <h2 className="section-title" style={{ marginBottom: '18px' }}>Detalii generale</h2>

                    <form onSubmit={handleUpdateProfile}>
                        <Field label="Nume ferma">
                            <input
                                type="text"
                                value={farm.name || ''}
                                onChange={(event) => setFarm({ ...farm, name: event.target.value })}
                                className="form-control"
                                placeholder="Numele fermei"
                                required
                            />
                        </Field>

                        <Field label="Adresa sediu">
                            <input
                                type="text"
                                value={farm.address || ''}
                                onChange={(event) => setFarm({ ...farm, address: event.target.value })}
                                className="form-control"
                                placeholder="Strada, localitate, judet"
                            />
                        </Field>

                        <Field label="Email contact">
                            <input
                                type="email"
                                value={farm.contactEmail || ''}
                                onChange={(event) => setFarm({ ...farm, contactEmail: event.target.value })}
                                className="form-control"
                                placeholder="office@ferma.ro"
                            />
                        </Field>

                        <Field label="Viziune si obiective strategice">
                            <textarea
                                rows="6"
                                value={farm.visionAndGoals || ''}
                                onChange={(event) => setFarm({ ...farm, visionAndGoals: event.target.value })}
                                className="form-control"
                                placeholder="Planuri pe termen lung, investitii, obiective de productie"
                            />
                        </Field>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }} disabled={saveLoading}>
                            {saveLoading ? 'Se salveaza...' : 'Salveaza modificarile'}
                        </button>
                    </form>
                </section>

                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
                        <div>
                            <h2 className="section-title">Jurnal decizii si sedinte</h2>
                            <p className="page-subtitle" style={{ fontSize: '13px' }}>Note interne pentru managementul fermei.</p>
                        </div>
                        <button onClick={() => setShowNoteForm((current) => !current)} className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px' }}>
                            {showNoteForm ? 'Inchide' : '+ Nota noua'}
                        </button>
                    </div>

                    {showNoteForm && (
                        <form onSubmit={handleAddNote} className="form-panel" style={{ marginBottom: '18px' }}>
                            <Field label="Titlu">
                                <input
                                    value={newNote.title}
                                    onChange={(event) => setNewNote({ ...newNote, title: event.target.value })}
                                    className="form-control"
                                    placeholder="Ex: Sedinta productie"
                                    required
                                />
                            </Field>
                            <Field label="Continut">
                                <textarea
                                    value={newNote.content}
                                    onChange={(event) => setNewNote({ ...newNote, content: event.target.value })}
                                    className="form-control"
                                    placeholder="Decizii, concluzii sau observatii"
                                    rows="4"
                                    required
                                />
                            </Field>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Salveaza in jurnal</button>
                        </form>
                    )}

                    {notes.length === 0 ? (
                        <div className="empty-state">Nu exista inregistrari in jurnal.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {notes.map((note) => (
                                <article key={note.id} style={{ padding: '14px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--primary-green)', borderRadius: '8px', background: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                                        <strong style={{ color: 'var(--text-main)' }}>{note.title}</strong>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {new Date(note.dateCreated).toLocaleDateString('ro-RO')}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{note.content}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const Metric = ({ label, value }) => (
    <div className="metric-card">
        <div className="metric-label">{label}</div>
        <div className="metric-value" style={{ fontSize: String(value).length > 18 ? '17px' : undefined }}>{value}</div>
    </div>
);

const calculateTotalArea = (parcels) => {
    return parcels.reduce((sum, parcel) => sum + parseArea(parcel.areaHectares ?? parcel.area ?? parcel.surface), 0);
};

const parseArea = (value) => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    const parsed = typeof value === 'string'
        ? Number(value.replace(',', '.'))
        : Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
};

const Field = ({ label, children }) => (
    <label style={{ display: 'block', marginBottom: '14px' }}>
        <span className="form-label">{label}</span>
        {children}
    </label>
);

export default FarmProfilePage;
