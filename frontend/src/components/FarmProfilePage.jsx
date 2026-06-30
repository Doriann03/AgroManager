import React, { useState, useEffect, useCallback } from 'react';
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
    const [saveLoading, setSaveArea] = useState(false);

    const fetchFarmData = useCallback(async () => {
        try {
            const [farmRes, parcelsRes, notesRes] = await Promise.all([
                apiClient.get('/api/farms/my-farm'),
                apiClient.get('/api/parcels'),
                apiClient.get('/api/farms/notes')
            ]);
            
            setFarm(farmRes.data);
            setNotes(notesRes.data);
            
            // Calculăm suprafața totală din parcele
            const area = parcelsRes.data.reduce((sum, p) => sum + p.areaHectares, 0);
            setTotalArea(area);
        } catch (error) {
            console.error("Eroare la încărcarea datelor profilului:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFarmData();
    }, [fetchFarmData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaveArea(true);
        try {
            const response = await apiClient.put('/api/farms/my-farm', farm);
            setFarm(response.data);
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (storedUser) {
                localStorage.setItem('user', JSON.stringify({ ...storedUser, farmName: response.data.name }));
            }
            alert("Profilul fermei a fost actualizat cu succes!");
        } catch (error) {
            console.error("Eroare la actualizarea profilului:", error);
            alert("A apărut o eroare la salvare.");
        } finally {
            setSaveArea(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.title || !newNote.content) return;
        
        try {
            const response = await apiClient.post('/api/farms/notes', newNote);
            setNotes([response.data, ...notes]);
            setNewNote({ title: '', content: '' });
            setShowNoteForm(false);
        } catch (error) {
            console.error("Eroare la adăugarea notiței:", error);
            alert("Nu s-a putut salva notița.");
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Se încarcă...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <BackButton />
                <h1 style={{ marginLeft: '20px', color: 'var(--primary-green)', margin: 0 }}>Profil Fermă</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                
                {/* Secțiunea 1: Detalii Generale */}
                <section>
                    <div className="card" style={{ height: '100%' }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '2px solid var(--primary-green)', paddingBottom: '10px' }}>
                            Detalii Generale
                        </h2>
                        
                        <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '10px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '30px' }}>🚜</div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>SUPRAFAȚĂ TOTALĂ</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-green)' }}>{totalArea.toFixed(2)} ha</div>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-muted)' }}>NUME FERMA</label>
                                <input
                                    type="text"
                                    value={farm.name || ''}
                                    onChange={e => setFarm({...farm, name: e.target.value})}
                                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    placeholder="Numele fermei"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-muted)' }}>ADRESĂ SEDIU</label>
                                <input 
                                    type="text" 
                                    value={farm.address || ''} 
                                    onChange={e => setFarm({...farm, address: e.target.value})} 
                                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                                    placeholder="Strada, Localitate, Județ..."
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-muted)' }}>EMAIL CONTACT</label>
                                <input 
                                    type="email" 
                                    value={farm.contactEmail || ''} 
                                    onChange={e => setFarm({...farm, contactEmail: e.target.value})} 
                                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                                    placeholder="office@ferma.ro"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px', color: 'var(--text-muted)' }}>VIZIUNE ȘI OBIECTIVE STRATEGICE</label>
                                <textarea 
                                    rows="5" 
                                    value={farm.visionAndGoals || ''} 
                                    onChange={e => setFarm({...farm, visionAndGoals: e.target.value})} 
                                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', resize: 'vertical' }} 
                                    placeholder="Care sunt planurile pe termen lung pentru ferma dumneavoastră?"
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={saveLoading}>
                                {saveLoading ? 'Se salvează...' : 'Salvează Modificările'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Secțiunea 2: Jurnal Decizii */}
                <section>
                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--primary-green)', paddingBottom: '10px' }}>
                            <h2 style={{ fontSize: '20px', margin: 0 }}>Jurnal Decizii & Ședințe</h2>
                            <button 
                                onClick={() => setShowNoteForm(!showNoteForm)}
                                className="btn-primary" 
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                                {showNoteForm ? 'Închide' : '+ Notiță Nouă'}
                            </button>
                        </div>

                        {showNoteForm && (
                            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                                <form onSubmit={handleAddNote}>
                                    <input 
                                        type="text" 
                                        placeholder="Titlu (ex: Ședință Investitori)" 
                                        value={newNote.title}
                                        onChange={e => setNewNote({...newNote, title: e.target.value})}
                                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        required
                                    />
                                    <textarea 
                                        placeholder="Conținutul deciziei sau notele de ședință..."
                                        value={newNote.content}
                                        onChange={e => setNewNote({...newNote, content: e.target.value})}
                                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '80px' }}
                                        required
                                    />
                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '8px' }}>Salvează în Jurnal</button>
                                </form>
                            </div>
                        )}

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {notes.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', fontStyle: 'italic' }}>
                                    Nu există încă înregistrări în jurnal.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {notes.map(note => (
                                        <div key={note.id} style={{ padding: '15px', borderLeft: '4px solid var(--primary-green)', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <strong style={{ fontSize: '15px' }}>{note.title}</strong>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {new Date(note.dateCreated).toLocaleDateString('ro-RO')}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#444', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default FarmProfilePage;
