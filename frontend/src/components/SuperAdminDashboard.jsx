import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axiosConfig';

const entityTypeOptions = [
    { value: 'parcels', label: 'Parcele' },
    { value: 'activities', label: 'Activitati agricole' },
    { value: 'inventory', label: 'Magazie / stocuri' },
    { value: 'requests', label: 'Cereri aprovizionare' },
    { value: 'machinery', label: 'Utilaje' },
    { value: 'maintenance', label: 'Mentenanta' },
    { value: 'crop-seasons', label: 'Sezoane de cultura' }
];

const entityTableColumns = {
    parcels: [
        { header: 'Parcela', render: (entity) => entity.name },
        { header: 'Ferma', render: (entity) => entity.farmName || '-' },
        { header: 'Cultura', render: (entity) => entity.category || '-' },
        { header: 'Suprafata', render: (entity) => entity.details || '-' }
    ],
    activities: [
        { header: 'Lucrare', render: (entity) => entity.name },
        { header: 'Ferma', render: (entity) => entity.farmName || '-' },
        { header: 'Tip', render: (entity) => entity.category || '-' },
        { header: 'Status', render: (entity) => entity.status || '-' },
        { header: 'Parcela', render: (entity) => entity.details || '-' },
        { header: 'Data planificata', render: (entity) => formatDisplayDate(entity.dateInfo) }
    ],
    inventory: [
        { header: 'Produs', render: (entity) => entity.name },
        { header: 'Ferma', render: (entity) => entity.farmName || '-' },
        { header: 'Categorie', render: (entity) => entity.category || '-' },
        { header: 'Cantitate', render: (entity) => entity.details || '-' },
        { header: 'Stare stoc', render: (entity) => entity.status || '-' }
    ],
    requests: [
        { header: 'Produs cerut', render: (entity) => entity.name },
        { header: 'Ferma', render: (entity) => entity.farmName || '-' },
        { header: 'Categorie', render: (entity) => entity.category || '-' },
        { header: 'Status cerere', render: (entity) => entity.status || '-' },
        { header: 'Cantitate / solicitant', render: (entity) => entity.details || '-' },
        { header: 'Data cererii', render: (entity) => formatDisplayDate(entity.dateInfo) }
    ],
    machinery: [
        { header: 'Utilaj', render: (entity) => entity.name },
        { header: 'Ferma', render: (entity) => entity.farmName || '-' },
        { header: 'Tip', render: (entity) => entity.category || '-' },
        { header: 'Status', render: (entity) => entity.status || '-' },
        { header: 'Ore / service', render: (entity) => entity.details || '-' },
        { header: 'Data achizitie', render: (entity) => formatDisplayDate(entity.dateInfo) }
    ],
    maintenance: [
        { header: 'Interventie', render: (entity) => entity.name },
        { header: 'Ferma', render: (entity) => entity.farmName || '-' },
        { header: 'Utilaj', render: (entity) => entity.category || '-' },
        { header: 'Cost / ore', render: (entity) => entity.details || '-' },
        { header: 'Data mentenanta', render: (entity) => formatDisplayDate(entity.dateInfo) }
    ],
    'crop-seasons': [
        { header: 'Cultura', render: (entity) => entity.name },
        { header: 'Ferma', render: (entity) => entity.farmName || '-' },
        { header: 'An recolta', render: (entity) => entity.category || '-' },
        { header: 'Parcela si productie', render: (entity) => entity.details || '-' }
    ]
};

const editableEntityTypes = ['parcels', 'inventory', 'machinery'];
const roleOptions = ['SUPER_ADMIN', 'FARM_MANAGER', 'AGRONOMIST', 'WORKER'];
const itemCategoryOptions = ['SEED', 'FERTILIZER', 'HERBICIDE', 'FUNGICIDE', 'INSECTICIDE', 'PESTICIDE', 'FUEL', 'SPARE_PARTS', 'OTHER'];
const machineryTypeOptions = ['TRACTOR', 'COMBINA', 'SEMANATOARE', 'PLUG', 'DISC', 'PULVERIZATOR', 'ALTELE'];
const machineryStatusOptions = ['DISPONIBIL', 'IN_CURSA', 'IN_SERVICE'];

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [farms, setFarms] = useState([]);
    const [users, setUsers] = useState([]);
    const [managedEntities, setManagedEntities] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEntities, setLoadingEntities] = useState(false);
    const [farmFilter, setFarmFilter] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('ALL');
    const [userFarmFilter, setUserFarmFilter] = useState('ALL');
    const [entityType, setEntityType] = useState(null);
    const [entityFarmFilter, setEntityFarmFilter] = useState('ALL');
    const [entitySearch, setEntitySearch] = useState('');
    const [savingKey, setSavingKey] = useState('');
    const [editingMode, setEditingMode] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, farmsRes, usersRes, auditRes] = await Promise.all([
                apiClient.get('/api/admin/stats'),
                apiClient.get('/api/admin/farms'),
                apiClient.get('/api/admin/users'),
                apiClient.get('/api/admin/audit-logs')
            ]);
            setStats(statsRes.data);
            setFarms(farmsRes.data);
            setUsers(usersRes.data);
            setAuditLogs(auditRes.data);
        } catch (error) {
            console.error('Eroare la preluarea datelor Super Admin:', error);
            alert('Nu s-au putut incarca datele de administrare.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const fetchManagedEntities = useCallback(async () => {
        if (!entityType) return;

        setLoadingEntities(true);
        try {
            const response = await apiClient.get(`/api/admin/entities/${entityType}`);
            setManagedEntities(response.data);
        } catch (error) {
            console.error('Eroare la preluarea entitatilor administrabile:', error);
            alert('Nu s-au putut incarca entitatile selectate.');
        } finally {
            setLoadingEntities(false);
        }
    }, [entityType]);

    useEffect(() => {
        if (entityTypeOptions.some((option) => option.value === activeTab)) {
            setEntityType(activeTab);
            setEntitySearch('');
            setEntityFarmFilter('ALL');
        }
    }, [activeTab]);

    useEffect(() => {
        if (entityTypeOptions.some((option) => option.value === activeTab) && entityType) {
            fetchManagedEntities();
        }
    }, [activeTab, entityType, fetchManagedEntities]);

    const filteredFarms = useMemo(() => {
        const term = farmFilter.trim().toLowerCase();
        if (!term) return farms;

        return farms.filter((farm) =>
            [farm.name, farm.address, farm.contactEmail, farm.managerUsername]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term))
        );
    }, [farms, farmFilter]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const roleMatches = userRoleFilter === 'ALL' || user.role === userRoleFilter;
            const farmMatches = userFarmFilter === 'ALL' || String(user.farmId || 'NONE') === userFarmFilter;
            return roleMatches && farmMatches;
        });
    }, [users, userRoleFilter, userFarmFilter]);

    const farmOptions = useMemo(() => {
        return farms.map((farm) => ({ id: String(farm.id), name: farm.name }));
    }, [farms]);

    const currentEntityColumns = entityTableColumns[activeTab] || [];

    const filteredManagedEntities = useMemo(() => {
        const term = entitySearch.trim().toLowerCase();

        return managedEntities.filter((entity) => {
            const farmMatches = entityFarmFilter === 'ALL' || String(entity.farmId || 'NONE') === entityFarmFilter;
            const textMatches = !term || [entity.name, entity.farmName, entity.category, entity.status, entity.details, entity.dateInfo]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term));
            return farmMatches && textMatches;
        });
    }, [managedEntities, entityFarmFilter, entitySearch]);

    const updateEditField = (field, value) => {
        setEditForm((current) => ({ ...current, [field]: value }));
    };

    const beginFarmEdit = (farm) => {
        setEditingMode({ scope: 'farm', title: `Editare ferma: ${farm.name}`, item: farm });
        setEditForm({
            name: farm.name || '',
            address: farm.address || '',
            contactEmail: farm.contactEmail || ''
        });
    };

    const beginUserEdit = (user) => {
        setEditingMode({ scope: 'user', title: `Editare utilizator: ${user.username}`, item: user });
        setEditForm({
            username: user.username || '',
            email: user.email || '',
            role: user.role || 'WORKER',
            farmId: user.farmId ? String(user.farmId) : ''
        });
    };

    const beginEntityEdit = (entity) => {
        const attributes = entity.attributes || {};
        setEditingMode({ scope: 'entity', title: `Editare ${entityTypeLabel(entity.entityType)}: ${entity.name}`, item: entity });

        if (entity.entityType === 'parcels') {
            setEditForm({
                name: attributes.name || entity.name || '',
                cropType: attributes.cropType || entity.category || '',
                areaHectares: attributes.areaHectares ?? ''
            });
            return;
        }

        if (entity.entityType === 'inventory') {
            setEditForm({
                name: attributes.name || entity.name || '',
                category: attributes.category || entity.category || 'OTHER',
                quantityAvailable: attributes.quantityAvailable ?? '',
                unitOfMeasure: attributes.unitOfMeasure || '',
                minimumStockThreshold: attributes.minimumStockThreshold ?? '',
                unitPrice: attributes.unitPrice ?? ''
            });
            return;
        }

        setEditForm({
            name: attributes.name || entity.name || '',
            model: attributes.model || '',
            licensePlate: attributes.licensePlate || '',
            type: attributes.type || entity.category || 'ALTELE',
            status: attributes.status || entity.status || 'DISPONIBIL',
            totalHours: attributes.totalHours ?? '',
            maintenanceIntervalHours: attributes.maintenanceIntervalHours ?? ''
        });
    };

    const closeEditModal = () => {
        setEditingMode(null);
        setEditForm({});
    };

    const saveEdit = async (event) => {
        event.preventDefault();
        if (!editingMode) return;

        const { scope, item } = editingMode;
        const saveKey = `edit-${scope}-${item.id}`;
        setSavingKey(saveKey);

        try {
            if (scope === 'farm') {
                await apiClient.put(`/api/admin/farms/${item.id}`, {
                    name: editForm.name,
                    address: editForm.address,
                    contactEmail: editForm.contactEmail
                });
                await fetchAdminData();
                closeEditModal();
                return;
            }

            if (scope === 'user') {
                if (editForm.role !== 'SUPER_ADMIN' && !editForm.farmId) {
                    alert('Selecteaza o ferma pentru rolurile operationale.');
                    return;
                }
                await apiClient.put(`/api/admin/users/${item.id}`, {
                    username: editForm.username,
                    email: editForm.email,
                    role: editForm.role,
                    farmId: editForm.role === 'SUPER_ADMIN' ? null : Number(editForm.farmId)
                });
                await fetchAdminData();
                closeEditModal();
                return;
            }

            await apiClient.put(`/api/admin/entities/${item.entityType}/${item.id}`, buildEntityUpdatePayload(item.entityType, editForm));
            await Promise.all([fetchManagedEntities(), fetchAdminData()]);
            closeEditModal();
        } catch (error) {
            console.error('Eroare la editare:', error);
            const message = error.response?.data?.message || error.response?.data || 'Nu s-a putut salva modificarea.';
            alert(message);
        } finally {
            setSavingKey('');
        }
    };

    const deleteFarm = async (farm) => {
        const confirmed = window.confirm(
            `Sunteti absolut sigur ca doriti sa stergeti ferma "${farm.name}"?\n\nAceasta operatiune este definitiva si va sterge utilizatorii, parcelele, lucrarile, magazia, utilajele si toate datele asociate fermei.`
        );
        if (!confirmed) return;

        setSavingKey(`farm-${farm.id}`);
        try {
            await apiClient.delete(`/api/admin/farms/${farm.id}`);
            await fetchAdminData();
        } catch (error) {
            console.error('Eroare la stergerea fermei:', error);
            const message = error.response?.data?.message || error.response?.data || 'Nu s-a putut sterge ferma.';
            alert(message);
        } finally {
            setSavingKey('');
        }
    };

    const deleteUser = async (user) => {
        const confirmed = window.confirm(
            `Sunteti absolut sigur ca doriti sa stergeti utilizatorul "${user.username}"?\n\nAceasta operatiune este definitiva si va elimina contul din platforma.`
        );
        if (!confirmed) return;

        setSavingKey(`user-${user.id}`);
        try {
            await apiClient.delete(`/api/admin/users/${user.id}`);
            await fetchAdminData();
        } catch (error) {
            console.error('Eroare la stergerea utilizatorului:', error);
            const message = error.response?.data?.message || error.response?.data || 'Nu s-a putut sterge utilizatorul.';
            alert(message);
        } finally {
            setSavingKey('');
        }
    };

    const deleteManagedEntity = async (entity) => {
        const confirmed = window.confirm(
            `Sunteti absolut sigur ca doriti sa stergeti "${entity.name}"?\n\nTip entitate: ${entityTypeLabel(entity.entityType)}\nFerma: ${entity.farmName || '-'}\n\nOperatiunea este definitiva si va elimina si legaturile tehnice necesare.`
        );
        if (!confirmed) return;

        setSavingKey(`entity-${entity.entityType}-${entity.id}`);
        try {
            await apiClient.delete(`/api/admin/entities/${entity.entityType}/${entity.id}`);
            await Promise.all([fetchManagedEntities(), fetchAdminData()]);
        } catch (error) {
            console.error('Eroare la stergerea entitatii:', error);
            const message = error.response?.data?.message || error.response?.data || 'Nu s-a putut sterge entitatea.';
            alert(message);
        } finally {
            setSavingKey('');
        }
    };

    const formatDateTime = (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Panou Super Admin</h1>
                    <p className="page-subtitle">
                    Administrare globala platforma, ferme, utilizatori si audit.
                    </p>
                </div>
            </div>

            <div className="toolbar-tabs">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                <TabButton active={activeTab === 'farms'} onClick={() => setActiveTab('farms')}>Ferme</TabButton>
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Utilizatori</TabButton>
                {entityTypeOptions.map((option) => (
                    <TabButton key={option.value} active={activeTab === option.value} onClick={() => setActiveTab(option.value)}>
                        {option.label}
                    </TabButton>
                ))}
                <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>Audit log</TabButton>
            </div>

            {loading ? (
                <div className="card" style={{ padding: '30px', color: 'var(--text-muted)' }}>Se incarca datele...</div>
            ) : (
                <>
                    {activeTab === 'overview' && (
                        <div>
                            <div className="metric-grid" style={{ marginBottom: '24px' }}>
                                <SummaryCard label="Ferme totale" value={stats?.totalFarms} />
                                <SummaryCard label="Utilizatori" value={stats?.totalUsers} />
                                <SummaryCard label="Manageri" value={stats?.managers} />
                                <SummaryCard label="Agronomi" value={stats?.agronomists} />
                                <SummaryCard label="Muncitori" value={stats?.workers} />
                                <SummaryCard label="Parcele totale" value={stats?.totalParcels} />
                            </div>

                            <div className="card" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 14px 0', color: 'var(--text-main)' }}>Ferme recente</h3>
                                <AdminTable
                                    headers={['Ferma', 'Manager', 'Utilizatori', 'Parcele']}
                                    emptyMessage="Nu exista ferme inregistrate."
                                >
                                    {(stats?.recentFarms || []).map((farm) => (
                                        <tr key={farm.id} style={rowStyle}>
                                            <td style={tdStyle}><strong>{farm.name}</strong></td>
                                            <td style={tdStyle}>{farm.managerUsername || '-'}</td>
                                            <td style={tdStyle}>{farm.userCount}</td>
                                            <td style={tdStyle}>{farm.parcelCount}</td>
                                        </tr>
                                    ))}
                                </AdminTable>
                            </div>
                        </div>
                    )}

                    {activeTab === 'farms' && (
                        <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Gestionare ferme</h3>
                                <input
                                    value={farmFilter}
                                    onChange={(e) => setFarmFilter(e.target.value)}
                                    placeholder="Cauta ferma, manager, email..."
                                    style={inputStyle}
                                />
                            </div>
                            <AdminTable
                                headers={['Ferma', 'Contact', 'Manager', 'Utilizatori', 'Parcele', 'Actiuni']}
                                emptyMessage="Nu exista ferme pentru filtrul selectat."
                            >
                                {filteredFarms.map((farm) => (
                                    <tr key={farm.id} style={rowStyle}>
                                        <td style={tdStyle}>
                                            <strong>{farm.name}</strong>
                                            <div style={mutedSmall}>{farm.address || '-'}</div>
                                        </td>
                                        <td style={tdStyle}>{farm.contactEmail || '-'}</td>
                                        <td style={tdStyle}>{farm.managerUsername || '-'}</td>
                                        <td style={tdStyle}>{farm.userCount}</td>
                                        <td style={tdStyle}>{farm.parcelCount}</td>
                                        <td style={tdStyle}>
                                            <div style={actionGroupStyle}>
                                                <button
                                                    style={secondaryButtonStyle}
                                                    disabled={Boolean(savingKey)}
                                                    onClick={() => beginFarmEdit(farm)}
                                                >
                                                    Editeaza
                                                </button>
                                            <button
                                                style={dangerButtonStyle}
                                                disabled={savingKey === `farm-${farm.id}`}
                                                onClick={() => deleteFarm(farm)}
                                            >
                                                {savingKey === `farm-${farm.id}` ? 'Se sterge...' : 'Sterge ferma'}
                                            </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Gestionare utilizatori</h3>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} style={selectStyle}>
                                        <option value="ALL">Toate rolurile</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                        <option value="FARM_MANAGER">Manager</option>
                                        <option value="AGRONOMIST">Agronom</option>
                                        <option value="WORKER">Muncitor</option>
                                    </select>
                                    <select value={userFarmFilter} onChange={(e) => setUserFarmFilter(e.target.value)} style={selectStyle}>
                                        <option value="ALL">Toate fermele</option>
                                        <option value="NONE">Fara ferma</option>
                                        {farmOptions.map((farm) => (
                                            <option key={farm.id} value={farm.id}>{farm.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <AdminTable
                                headers={['Utilizator', 'Rol', 'Ferma', 'Actiuni']}
                                emptyMessage="Nu exista utilizatori pentru filtrele selectate."
                            >
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} style={rowStyle}>
                                        <td style={tdStyle}>
                                            <strong>{user.username}</strong>
                                            <div style={mutedSmall}>{user.email || '-'}</div>
                                        </td>
                                        <td style={tdStyle}>{roleLabel(user.role)}</td>
                                        <td style={tdStyle}>{user.farmName || '-'}</td>
                                        <td style={tdStyle}>
                                            <div style={actionGroupStyle}>
                                                <button
                                                    style={secondaryButtonStyle}
                                                    disabled={Boolean(savingKey)}
                                                    onClick={() => beginUserEdit(user)}
                                                >
                                                    Editeaza
                                                </button>
                                            <button
                                                style={dangerButtonStyle}
                                                disabled={savingKey === `user-${user.id}`}
                                                onClick={() => deleteUser(user)}
                                            >
                                                {savingKey === `user-${user.id}` ? 'Se sterge...' : 'Sterge utilizator'}
                                            </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </div>
                    )}

                    {entityTypeOptions.some((option) => option.value === activeTab) && (
                        <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{entityTypeLabel(activeTab)}</h3>
                                    <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        Vizualizare globala si stergere controlata pentru datele operationale principale.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <select value={entityFarmFilter} onChange={(e) => setEntityFarmFilter(e.target.value)} style={selectStyle}>
                                        <option value="ALL">Toate fermele</option>
                                        <option value="NONE">Fara ferma</option>
                                        {farmOptions.map((farm) => (
                                            <option key={farm.id} value={farm.id}>{farm.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        value={entitySearch}
                                        onChange={(e) => setEntitySearch(e.target.value)}
                                        placeholder="Cauta in entitati..."
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {loadingEntities ? (
                                <p style={{ color: 'var(--text-muted)' }}>Se incarca entitatile...</p>
                            ) : (
                                <AdminTable
                                    headers={[...currentEntityColumns.map((column) => column.header), 'Actiuni']}
                                    emptyMessage="Nu exista entitati pentru filtrele selectate."
                                >
                                    {filteredManagedEntities.map((entity) => (
                                        <tr key={`${entity.entityType}-${entity.id}`} style={rowStyle}>
                                            {currentEntityColumns.map((column, index) => (
                                                <td key={column.header} style={tdStyle}>
                                                    {index === 0 ? (
                                                        <>
                                                            <strong>{column.render(entity)}</strong>
                                                            <div style={mutedSmall}>#{entity.id}</div>
                                                        </>
                                                    ) : column.render(entity)}
                                                </td>
                                            ))}
                                            <td style={tdStyle}>
                                                <div style={actionGroupStyle}>
                                                    {editableEntityTypes.includes(entity.entityType) && (
                                                        <button
                                                            style={secondaryButtonStyle}
                                                            disabled={Boolean(savingKey)}
                                                            onClick={() => beginEntityEdit(entity)}
                                                        >
                                                            Editeaza
                                                        </button>
                                                    )}
                                                <button
                                                    style={dangerButtonStyle}
                                                    disabled={savingKey === `entity-${entity.entityType}-${entity.id}`}
                                                    onClick={() => deleteManagedEntity(entity)}
                                                >
                                                    {savingKey === `entity-${entity.entityType}-${entity.id}` ? 'Se sterge...' : 'Sterge'}
                                                </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </AdminTable>
                            )}
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="card" style={{ padding: '20px' }}>
                            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Audit log</h3>
                            <AdminTable
                                headers={['Data', 'Actor', 'Actiune', 'Tinta', 'Detalii']}
                                emptyMessage="Nu exista actiuni in audit log."
                            >
                                {auditLogs.map((log) => (
                                    <tr key={log.id} style={rowStyle}>
                                        <td style={tdStyle}>{formatDateTime(log.createdAt)}</td>
                                        <td style={tdStyle}>{log.actorUsername || '-'}</td>
                                        <td style={tdStyle}><strong>{auditActionLabel(log.action)}</strong></td>
                                        <td style={tdStyle}>{log.targetType} #{log.targetId}<div style={mutedSmall}>{log.targetName}</div></td>
                                        <td style={tdStyle}>{log.details || '-'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </div>
                    )}
                </>
            )}

            {editingMode && (
                <div style={modalBackdropStyle} onClick={closeEditModal}>
                    <form style={modalStyle} onClick={(event) => event.stopPropagation()} onSubmit={saveEdit}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{editingMode.title}</h3>
                            <button type="button" style={closeButtonStyle} onClick={closeEditModal}>x</button>
                        </div>

                        <div style={formGridStyle}>
                            {renderEditFields(editingMode, editForm, updateEditField, farms)}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button type="button" style={secondaryButtonStyle} onClick={closeEditModal}>Anuleaza</button>
                            <button type="submit" style={primaryButtonStyle} disabled={savingKey === `edit-${editingMode.scope}-${editingMode.item.id}`}>
                                {savingKey === `edit-${editingMode.scope}-${editingMode.item.id}` ? 'Se salveaza...' : 'Salveaza'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const renderEditFields = (editingMode, form, onChange, farms) => {
    if (editingMode.scope === 'farm') {
        return (
            <>
                <FormField label="Nume ferma">
                    <input value={form.name || ''} onChange={(e) => onChange('name', e.target.value)} style={wideInputStyle} required />
                </FormField>
                <FormField label="Adresa">
                    <input value={form.address || ''} onChange={(e) => onChange('address', e.target.value)} style={wideInputStyle} />
                </FormField>
                <FormField label="Email contact">
                    <input type="email" value={form.contactEmail || ''} onChange={(e) => onChange('contactEmail', e.target.value)} style={wideInputStyle} />
                </FormField>
            </>
        );
    }

    if (editingMode.scope === 'user') {
        return (
            <>
                <FormField label="Nume utilizator">
                    <input value={form.username || ''} onChange={(e) => onChange('username', e.target.value)} style={wideInputStyle} required />
                </FormField>
                <FormField label="Email">
                    <input type="email" value={form.email || ''} onChange={(e) => onChange('email', e.target.value)} style={wideInputStyle} />
                </FormField>
                <FormField label="Rol">
                    <select value={form.role || 'WORKER'} onChange={(e) => onChange('role', e.target.value)} style={wideInputStyle}>
                        {roleOptions.map((role) => (
                            <option key={role} value={role}>{roleLabel(role)}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Ferma">
                    <select
                        value={form.role === 'SUPER_ADMIN' ? '' : (form.farmId || '')}
                        onChange={(e) => onChange('farmId', e.target.value)}
                        style={wideInputStyle}
                        disabled={form.role === 'SUPER_ADMIN'}
                    >
                        <option value="">Fara ferma</option>
                        {farms.map((farm) => (
                            <option key={farm.id} value={farm.id}>{farm.name}</option>
                        ))}
                    </select>
                </FormField>
            </>
        );
    }

    if (editingMode.item.entityType === 'parcels') {
        return (
            <>
                <FormField label="Nume parcela">
                    <input value={form.name || ''} onChange={(e) => onChange('name', e.target.value)} style={wideInputStyle} required />
                </FormField>
                <FormField label="Cultura curenta">
                    <input value={form.cropType || ''} onChange={(e) => onChange('cropType', e.target.value)} style={wideInputStyle} />
                </FormField>
                <FormField label="Suprafata ha">
                    <input type="number" min="0.01" step="0.01" value={form.areaHectares} onChange={(e) => onChange('areaHectares', e.target.value)} style={wideInputStyle} required />
                </FormField>
            </>
        );
    }

    if (editingMode.item.entityType === 'inventory') {
        return (
            <>
                <FormField label="Produs">
                    <input value={form.name || ''} onChange={(e) => onChange('name', e.target.value)} style={wideInputStyle} required />
                </FormField>
                <FormField label="Categorie">
                    <select value={form.category || 'OTHER'} onChange={(e) => onChange('category', e.target.value)} style={wideInputStyle}>
                        {itemCategoryOptions.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Cantitate disponibila">
                    <input type="number" min="0" step="0.01" value={form.quantityAvailable} onChange={(e) => onChange('quantityAvailable', e.target.value)} style={wideInputStyle} required />
                </FormField>
                <FormField label="Unitate masura">
                    <input value={form.unitOfMeasure || ''} onChange={(e) => onChange('unitOfMeasure', e.target.value)} style={wideInputStyle} required />
                </FormField>
                <FormField label="Prag minim">
                    <input type="number" min="0" step="0.01" value={form.minimumStockThreshold} onChange={(e) => onChange('minimumStockThreshold', e.target.value)} style={wideInputStyle} />
                </FormField>
                <FormField label="Pret unitar">
                    <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => onChange('unitPrice', e.target.value)} style={wideInputStyle} />
                </FormField>
            </>
        );
    }

    return (
        <>
            <FormField label="Nume utilaj">
                <input value={form.name || ''} onChange={(e) => onChange('name', e.target.value)} style={wideInputStyle} required />
            </FormField>
            <FormField label="Model">
                <input value={form.model || ''} onChange={(e) => onChange('model', e.target.value)} style={wideInputStyle} />
            </FormField>
            <FormField label="Numar inmatriculare">
                <input value={form.licensePlate || ''} onChange={(e) => onChange('licensePlate', e.target.value)} style={wideInputStyle} />
            </FormField>
            <FormField label="Tip">
                <select value={form.type || 'ALTELE'} onChange={(e) => onChange('type', e.target.value)} style={wideInputStyle}>
                    {machineryTypeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </FormField>
            <FormField label="Status">
                <select value={form.status || 'DISPONIBIL'} onChange={(e) => onChange('status', e.target.value)} style={wideInputStyle}>
                    {machineryStatusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </FormField>
            <FormField label="Ore totale">
                <input type="number" min="0" step="1" value={form.totalHours} onChange={(e) => onChange('totalHours', e.target.value)} style={wideInputStyle} />
            </FormField>
            <FormField label="Interval mentenanta ore">
                <input type="number" min="0" step="1" value={form.maintenanceIntervalHours} onChange={(e) => onChange('maintenanceIntervalHours', e.target.value)} style={wideInputStyle} />
            </FormField>
        </>
    );
};

const buildEntityUpdatePayload = (entityType, form) => {
    if (entityType === 'parcels') {
        return {
            name: form.name,
            cropType: form.cropType,
            areaHectares: toNumber(form.areaHectares)
        };
    }

    if (entityType === 'inventory') {
        return {
            name: form.name,
            category: form.category,
            quantityAvailable: toNumber(form.quantityAvailable),
            unitOfMeasure: form.unitOfMeasure,
            minimumStockThreshold: toNumber(form.minimumStockThreshold),
            unitPrice: form.unitPrice === '' ? null : toNumber(form.unitPrice)
        };
    }

    return {
        name: form.name,
        model: form.model,
        licensePlate: form.licensePlate,
        type: form.type,
        status: form.status,
        totalHours: toInteger(form.totalHours),
        maintenanceIntervalHours: toInteger(form.maintenanceIntervalHours)
    };
};

const toNumber = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    return Number(value);
};

const toInteger = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    return Number.parseInt(value, 10);
};

const AdminTable = ({ headers, children, emptyMessage }) => {
    const rows = React.Children.toArray(children).filter(Boolean);

    return (
        <div className="table-wrap">
            <table className="data-table" style={{ minWidth: '850px' }}>
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} style={thStyle}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} style={{ ...tdStyle, padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : rows}
                </tbody>
            </table>
        </div>
    );
};

const FormField = ({ label, children }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-main)', fontWeight: 700, fontSize: '13px' }}>
        {label}
        {children}
    </label>
);

const TabButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`tab-button ${active ? 'is-active' : ''}`}
    >
        {children}
    </button>
);

const SummaryCard = ({ label, value, accent = '#0f172a' }) => (
    <div className="card" style={{ padding: '16px 18px', borderTop: `4px solid ${accent}` }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
        <div style={{ color: 'var(--text-main)', fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>{value ?? 0}</div>
    </div>
);

const roleLabel = (role) => {
    switch (role) {
        case 'SUPER_ADMIN': return 'Super Admin';
        case 'FARM_MANAGER': return 'Manager';
        case 'AGRONOMIST': return 'Agronom';
        case 'WORKER': return 'Muncitor';
        default: return role || '-';
    }
};

const auditActionLabel = (action) => {
    switch (action) {
        case 'FARM_UPDATED': return 'Ferma actualizata';
        case 'FARM_DELETED': return 'Ferma stearsa';
        case 'USER_UPDATED': return 'Utilizator actualizat';
        case 'USER_DELETED': return 'Utilizator sters';
        case 'ENTITY_UPDATED': return 'Entitate actualizata';
        case 'ENTITY_DELETED': return 'Entitate stearsa';
        default: return action || '-';
    }
};

const entityTypeLabel = (entityType) => {
    return entityTypeOptions.find((option) => option.value === entityType)?.label || entityType || '-';
};

const formatDisplayDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const inputStyle = {
    width: '280px',
    maxWidth: '100%',
    padding: '9px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px'
};

const selectStyle = {
    padding: '9px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontWeight: 600
};

const dangerButtonStyle = {
    padding: '7px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontWeight: 800,
    cursor: 'pointer'
};

const secondaryButtonStyle = {
    padding: '7px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    color: 'var(--text-main)',
    fontWeight: 800,
    cursor: 'pointer'
};

const primaryButtonStyle = {
    padding: '9px 14px',
    borderRadius: '8px',
    border: '1px solid var(--primary-green)',
    backgroundColor: 'var(--primary-green)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer'
};

const actionGroupStyle = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
};

const modalBackdropStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000
};

const modalStyle = {
    width: 'min(720px, 100%)',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '22px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.2)'
};

const closeButtonStyle = {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 800
};

const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px'
};

const wideInputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxSizing: 'border-box'
};

const thStyle = {
    padding: '12px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap'
};

const tdStyle = {
    padding: '12px',
    color: '#475569',
    fontSize: '14px',
    verticalAlign: 'top',
    borderBottom: '1px solid #f1f5f9'
};

const rowStyle = {
    verticalAlign: 'top'
};

const mutedSmall = {
    color: 'var(--text-muted)',
    fontSize: '12px',
    marginTop: '4px'
};

export default SuperAdminDashboard;
