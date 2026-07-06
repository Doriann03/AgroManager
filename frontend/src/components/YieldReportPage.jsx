import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const numberFormatter = new Intl.NumberFormat('ro-RO', {
    maximumFractionDigits: 2
});

const currencyFormatter = new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2
});

const safeNumber = (value) => Number(value || 0);

const formatNumber = (value) => numberFormatter.format(safeNumber(value));
const formatCurrency = (value) => currencyFormatter.format(safeNumber(value));

const defaultSubsidyForm = (year) => ({
    parcelId: '',
    year,
    subsidyType: 'APIA - plata de baza',
    amountPerHectare: '',
    totalAmount: '',
    status: 'ESTIMATED',
    notes: ''
});

const subsidyStatusLabels = {
    ESTIMATED: 'Estimata',
    APPROVED: 'Aprobata',
    PAID: 'Incasata'
};

const YieldReportPage = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [seasons, setSeasons] = useState([]);
    const [parcels, setParcels] = useState([]);
    const [subsidies, setSubsidies] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingFinancials, setEditingFinancials] = useState({});
    const [savingSeasonId, setSavingSeasonId] = useState(null);
    const [subsidyForm, setSubsidyForm] = useState(() => defaultSubsidyForm(new Date().getFullYear()));
    const [editingSubsidyId, setEditingSubsidyId] = useState(null);
    const [savingSubsidy, setSavingSubsidy] = useState(false);

    const availableYears = useMemo(() => {
        const years = Array.from(new Set(seasons.map((season) => season.harvestYear).filter(Boolean)));
        years.sort((a, b) => b - a);
        return years;
    }, [seasons]);

    const fetchSeasons = useCallback(async () => {
        const response = await apiClient.get('/api/crop-seasons');
        setSeasons(response.data);
    }, []);

    const fetchParcels = useCallback(async () => {
        const response = await apiClient.get('/api/parcels');
        setParcels(response.data);
    }, []);

    const fetchSubsidies = useCallback(async () => {
        const response = await apiClient.get('/api/subsidies', {
            params: { year: selectedYear }
        });
        setSubsidies(response.data);
    }, [selectedYear]);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.get('/api/reports/financial', {
                params: { year: selectedYear }
            });
            setReport(response.data);
        } catch (err) {
            console.error('Eroare la preluarea raportului financiar:', err);
            setError('Nu s-a putut incarca raportul financiar.');
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        Promise.all([fetchSeasons(), fetchParcels()]).catch((err) => {
            console.error('Eroare la preluarea datelor initiale:', err);
            setError('Nu s-au putut incarca datele initiale pentru raport.');
        });
    }, [fetchParcels, fetchSeasons]);

    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(Number(selectedYear))) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    useEffect(() => {
        fetchReport();
        fetchSubsidies().catch((err) => {
            console.error('Eroare la preluarea subventiilor:', err);
            setError('Nu s-au putut incarca subventiile pentru anul selectat.');
        });
        setSubsidyForm((current) => ({ ...current, year: selectedYear }));
        setEditingSubsidyId(null);
    }, [fetchReport, fetchSubsidies, selectedYear]);

    const startEditingFinancials = (row) => {
        setEditingFinancials((current) => ({
            ...current,
            [row.seasonId]: {
                salePricePerKg: row.salePricePerKg ?? '',
                revenueOverride: row.revenueOverride ?? ''
            }
        }));
    };

    const cancelEditingFinancials = (seasonId) => {
        setEditingFinancials((current) => {
            const next = { ...current };
            delete next[seasonId];
            return next;
        });
    };

    const updateEditingFinancialValue = (seasonId, field, value) => {
        setEditingFinancials((current) => ({
            ...current,
            [seasonId]: {
                ...current[seasonId],
                [field]: value
            }
        }));
    };

    const saveFinancials = async (seasonId) => {
        const values = editingFinancials[seasonId];
        if (!values) return;

        const salePricePerKg = values.salePricePerKg === '' ? null : Number(values.salePricePerKg);
        const revenueOverride = values.revenueOverride === '' ? null : Number(values.revenueOverride);

        if ((salePricePerKg !== null && salePricePerKg < 0) || (revenueOverride !== null && revenueOverride < 0)) {
            alert('Valorile financiare nu pot fi negative.');
            return;
        }

        setSavingSeasonId(seasonId);
        try {
            await apiClient.put(`/api/crop-seasons/${seasonId}/financials`, {
                salePricePerKg,
                revenueOverride
            });
            cancelEditingFinancials(seasonId);
            await Promise.all([fetchSeasons(), fetchReport()]);
        } catch (err) {
            console.error('Eroare la salvarea datelor financiare:', err);
            alert('Nu s-au putut salva datele financiare.');
        } finally {
            setSavingSeasonId(null);
        }
    };

    const updateSubsidyForm = (field, value) => {
        setSubsidyForm((current) => ({
            ...current,
            [field]: value
        }));
    };

    const resetSubsidyForm = () => {
        setEditingSubsidyId(null);
        setSubsidyForm(defaultSubsidyForm(selectedYear));
    };

    const startEditingSubsidy = (subsidy) => {
        setEditingSubsidyId(subsidy.id);
        setSubsidyForm({
            parcelId: subsidy.parcelId || '',
            year: subsidy.year || selectedYear,
            subsidyType: subsidy.subsidyType || '',
            amountPerHectare: subsidy.amountPerHectare ?? '',
            totalAmount: subsidy.totalAmount ?? '',
            status: subsidy.status || 'ESTIMATED',
            notes: subsidy.notes || ''
        });
    };

    const saveSubsidy = async (event) => {
        event.preventDefault();

        if (!subsidyForm.parcelId) {
            alert('Selecteaza parcela pentru subventie.');
            return;
        }

        const amountPerHectare = subsidyForm.amountPerHectare === '' ? 0 : Number(subsidyForm.amountPerHectare);
        const totalAmount = subsidyForm.totalAmount === '' ? null : Number(subsidyForm.totalAmount);

        if (amountPerHectare < 0 || (totalAmount !== null && totalAmount < 0)) {
            alert('Valorile subventiei nu pot fi negative.');
            return;
        }

        const payload = {
            parcelId: Number(subsidyForm.parcelId),
            year: Number(selectedYear),
            subsidyType: subsidyForm.subsidyType.trim(),
            amountPerHectare,
            totalAmount,
            status: subsidyForm.status,
            notes: subsidyForm.notes.trim() || null
        };

        if (!payload.subsidyType) {
            alert('Completeaza tipul subventiei.');
            return;
        }

        setSavingSubsidy(true);
        try {
            if (editingSubsidyId) {
                await apiClient.put(`/api/subsidies/${editingSubsidyId}`, payload);
            } else {
                await apiClient.post('/api/subsidies', payload);
            }
            resetSubsidyForm();
            await Promise.all([fetchSubsidies(), fetchReport()]);
        } catch (err) {
            console.error('Eroare la salvarea subventiei:', err);
            alert('Nu s-a putut salva subventia.');
        } finally {
            setSavingSubsidy(false);
        }
    };

    const deleteSubsidy = async (subsidy) => {
        const confirmed = window.confirm(`Stergi definitiv subventia "${subsidy.subsidyType}" pentru parcela ${subsidy.parcelName}?`);
        if (!confirmed) return;

        try {
            await apiClient.delete(`/api/subsidies/${subsidy.id}`);
            if (editingSubsidyId === subsidy.id) {
                resetSubsidyForm();
            }
            await Promise.all([fetchSubsidies(), fetchReport()]);
        } catch (err) {
            console.error('Eroare la stergerea subventiei:', err);
            alert('Nu s-a putut sterge subventia.');
        }
    };

    const rows = report?.rows || [];
    const currentYearOption = new Date().getFullYear();
    const yearOptions = Array.from(new Set([
        ...availableYears,
        currentYearOption,
        currentYearOption - 1,
        currentYearOption - 2,
        currentYearOption - 3,
        currentYearOption - 4
    ])).sort((a, b) => b - a);
    const expenseBreakdown = [
        { label: 'Materiale', scope: 'Direct pe parcela', value: report?.totalInputCost, accent: '#f59e0b' },
        { label: 'Munca muncitori', scope: 'Direct pe parcela', value: report?.totalWorkerLaborCost, accent: '#8b5cf6' },
        { label: 'Salarii agronomi', scope: 'Indirect la nivel de ferma', value: report?.administrativeSalaryCost, accent: '#64748b' },
        { label: 'Mentenanta utilaje', scope: 'Indirect la nivel de ferma', value: report?.maintenanceCost, accent: '#ef4444' }
    ];

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header-left">
                    <BackButton />
                    <div>
                        <h1 className="page-title">Productie si profitabilitate</h1>
                        <p className="page-subtitle">
                            Indicatori pe parcela, cultura si an agricol.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>An:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '600' }}
                    >
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', marginBottom: '20px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            <div className="metric-grid" style={{ marginBottom: '24px' }}>
                <SummaryCard title="Recolta totala" value={`${formatNumber(report?.totalYieldKg)} kg`} accent="#10b981" />
                <SummaryCard title="Costuri materiale" value={formatCurrency(report?.totalInputCost)} accent="#f59e0b" />
                <SummaryCard title="Munca muncitori" value={formatCurrency(report?.totalWorkerLaborCost)} accent="#8b5cf6" />
                <SummaryCard title="Salarii agronomi" value={formatCurrency(report?.administrativeSalaryCost)} accent="#64748b" />
                <SummaryCard title="Mentenanta utilaje" value={formatCurrency(report?.maintenanceCost)} accent="#ef4444" />
                <SummaryCard title="Cheltuieli ferma" value={formatCurrency(report?.totalExpenses)} accent="#0f172a" />
                <SummaryCard title="Venit recolta" value={formatCurrency(report?.totalCropRevenue)} accent="#0ea5e9" />
                <SummaryCard title="Subventii APIA" value={formatCurrency(report?.totalSubsidyRevenue)} accent="#22c55e" />
                <SummaryCard title="Venit total" value={formatCurrency(report?.totalRevenue)} accent="#3b82f6" />
                <SummaryCard title="Profit ferma" value={formatCurrency(report?.totalProfit)} accent={safeNumber(report?.totalProfit) >= 0 ? '#16a34a' : '#dc2626'} />
                <SummaryCard title="Profit / ha" value={formatCurrency(report?.profitPerHectare)} accent={safeNumber(report?.profitPerHectare) >= 0 ? '#16a34a' : '#dc2626'} />
            </div>

            <div className="card" style={{ padding: '18px 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px' }}>Structura cheltuielilor</h3>
                    <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(report?.totalExpenses)}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {expenseBreakdown.map((item) => (
                        <div key={item.label} style={{ border: '1px solid var(--border-color)', borderLeft: `4px solid ${item.accent}`, borderRadius: '8px', padding: '12px 14px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>{item.label}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.scope}</div>
                                </div>
                                <strong style={{ whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{formatCurrency(item.value)}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px' }}>Subventii APIA pe parcele</h3>
                        <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Sumele introduse aici sunt adaugate automat la veniturile parcelei pentru anul {selectedYear}.
                        </p>
                    </div>
                    <strong style={{ color: 'var(--primary-green)', fontSize: '18px' }}>{formatCurrency(report?.totalSubsidyRevenue)}</strong>
                </div>

                <form onSubmit={saveSubsidy} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.2fr) minmax(170px, 1fr) repeat(3, minmax(130px, 0.8fr)) auto', gap: '10px', alignItems: 'end', marginBottom: '18px' }}>
                    <Field label="Parcela">
                        <select value={subsidyForm.parcelId} onChange={(e) => updateSubsidyForm('parcelId', e.target.value)} style={formControlStyle}>
                            <option value="">Selecteaza parcela</option>
                            {parcels.map((parcel) => (
                                <option key={parcel.id} value={parcel.id}>
                                    {parcel.name} ({formatNumber(parcel.areaHectares)} ha)
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Tip subventie">
                        <input value={subsidyForm.subsidyType} onChange={(e) => updateSubsidyForm('subsidyType', e.target.value)} style={formControlStyle} />
                    </Field>
                    <Field label="RON / ha">
                        <input type="number" min="0" step="0.01" value={subsidyForm.amountPerHectare} onChange={(e) => updateSubsidyForm('amountPerHectare', e.target.value)} placeholder="calcul automat" style={formControlStyle} />
                    </Field>
                    <Field label="Total RON">
                        <input type="number" min="0" step="0.01" value={subsidyForm.totalAmount} onChange={(e) => updateSubsidyForm('totalAmount', e.target.value)} placeholder="auto din RON/ha" style={formControlStyle} />
                    </Field>
                    <Field label="Status">
                        <select value={subsidyForm.status} onChange={(e) => updateSubsidyForm('status', e.target.value)} style={formControlStyle}>
                            <option value="ESTIMATED">Estimata</option>
                            <option value="APPROVED">Aprobata</option>
                            <option value="PAID">Incasata</option>
                        </select>
                    </Field>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="submit" className="btn-primary" disabled={savingSubsidy} style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                            {savingSubsidy ? 'Se salveaza...' : editingSubsidyId ? 'Actualizeaza' : 'Adauga'}
                        </button>
                        {editingSubsidyId && (
                            <button type="button" className="btn-secondary" onClick={resetSubsidyForm} style={{ padding: '9px 12px' }}>
                                Anuleaza
                            </button>
                        )}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <input value={subsidyForm.notes} onChange={(e) => updateSubsidyForm('notes', e.target.value)} placeholder="Observatii optionale" style={{ ...formControlStyle, width: '100%' }} />
                    </div>
                </form>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <HeaderCell>Parcela</HeaderCell>
                                <HeaderCell>Tip</HeaderCell>
                                <HeaderCell>RON / ha</HeaderCell>
                                <HeaderCell>Total</HeaderCell>
                                <HeaderCell>Status</HeaderCell>
                                <HeaderCell>Actiuni</HeaderCell>
                            </tr>
                        </thead>
                        <tbody>
                            {subsidies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '18px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                        Nu exista subventii APIA inregistrate pentru anul {selectedYear}.
                                    </td>
                                </tr>
                            ) : subsidies.map((subsidy) => (
                                <tr key={subsidy.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <BodyCell>
                                        <strong>{subsidy.parcelName}</strong>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{formatNumber(subsidy.parcelAreaHectares)} ha</div>
                                    </BodyCell>
                                    <BodyCell>
                                        {subsidy.subsidyType}
                                        {subsidy.notes && <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{subsidy.notes}</div>}
                                    </BodyCell>
                                    <BodyCell>{formatCurrency(subsidy.amountPerHectare)}</BodyCell>
                                    <BodyCell><strong>{formatCurrency(subsidy.totalAmount)}</strong></BodyCell>
                                    <BodyCell>{subsidyStatusLabels[subsidy.status] || subsidy.status}</BodyCell>
                                    <BodyCell>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button className="btn-secondary" onClick={() => startEditingSubsidy(subsidy)} style={{ padding: '6px 10px', fontSize: '12px' }}>Editeaza</button>
                                            <button onClick={() => deleteSubsidy(subsidy)} style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #fecaca', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Sterge</button>
                                        </div>
                                    </BodyCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '1450px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                        <tr>
                            <HeaderCell>Parcela</HeaderCell>
                            <HeaderCell>Cultura</HeaderCell>
                            <HeaderCell>Suprafata</HeaderCell>
                            <HeaderCell>Recolta</HeaderCell>
                            <HeaderCell>Productie/ha</HeaderCell>
                            <HeaderCell>Pret vanzare</HeaderCell>
                            <HeaderCell>Materiale</HeaderCell>
                            <HeaderCell>Munca</HeaderCell>
                            <HeaderCell>Cost parcela</HeaderCell>
                            <HeaderCell>Subventii</HeaderCell>
                            <HeaderCell>Venit</HeaderCell>
                            <HeaderCell>Profit</HeaderCell>
                            <HeaderCell>Actiuni</HeaderCell>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="13" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Se incarca raportul...
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan="13" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    Nu exista sezoane, venituri sau costuri inregistrate pentru anul {selectedYear}.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => {
                                const editing = editingFinancials[row.seasonId];
                                const profitColor = safeNumber(row.profit) >= 0 ? '#15803d' : '#dc2626';

                                return (
                                    <tr key={row.seasonId || `parcel-${row.parcelId}`} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                                        <BodyCell>
                                            <strong style={{ color: 'var(--text-main)' }}>{row.parcelName}</strong>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{formatNumber(row.areaHectares)} ha</div>
                                        </BodyCell>
                                        <BodyCell>
                                            <span style={{ backgroundColor: '#f0fdf4', color: 'var(--primary-green)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                                {row.cropType || 'Nespecificat'}
                                            </span>
                                            {!row.seasonId && (
                                                <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '6px', fontWeight: 700 }}>
                                                    Fara sezon/recolta in anul selectat
                                                </div>
                                            )}
                                        </BodyCell>
                                        <BodyCell>{formatNumber(row.areaHectares)} ha</BodyCell>
                                        <BodyCell>{formatNumber(row.totalYieldKg)} kg</BodyCell>
                                        <BodyCell>{formatNumber(row.yieldPerHectareKg)} kg/ha</BodyCell>
                                        <BodyCell>
                                            {!row.seasonId ? (
                                                <span style={{ color: '#94a3b8' }}>-</span>
                                            ) : editing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={editing.salePricePerKg}
                                                    onChange={(e) => updateEditingFinancialValue(row.seasonId, 'salePricePerKg', e.target.value)}
                                                    placeholder="RON/kg"
                                                    style={inputStyle}
                                                />
                                            ) : row.salePricePerKg != null ? (
                                                `${formatNumber(row.salePricePerKg)} RON/kg`
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>-</span>
                                            )}
                                        </BodyCell>
                                        <BodyCell>
                                            <strong>{formatCurrency(row.totalInputCost)}</strong>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>consumuri reale</div>
                                        </BodyCell>
                                        <BodyCell>
                                            <strong>{formatCurrency(row.workerLaborCost)}</strong>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>ore lucrate</div>
                                        </BodyCell>
                                        <BodyCell>
                                            <strong>{formatCurrency(row.totalDirectCost)}</strong>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{formatCurrency(row.costPerHectare)} / ha</div>
                                        </BodyCell>
                                        <BodyCell>
                                            <strong>{formatCurrency(row.subsidyRevenue)}</strong>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>APIA / alte plati</div>
                                        </BodyCell>
                                        <BodyCell>
                                            {!row.seasonId ? (
                                                <>
                                                    <strong>{formatCurrency(row.totalRevenue)}</strong>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>doar subventii</div>
                                                </>
                                            ) : editing ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={editing.revenueOverride}
                                                        onChange={(e) => updateEditingFinancialValue(row.seasonId, 'revenueOverride', e.target.value)}
                                                        placeholder="Venit manual"
                                                        style={inputStyle}
                                                    />
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                                                        Gol = calculat din pret/kg
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <strong>{formatCurrency(row.totalRevenue)}</strong>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{formatCurrency(row.revenuePerHectare)} / ha</div>
                                                    {safeNumber(row.subsidyRevenue) > 0 && (
                                                        <div style={{ color: '#16a34a', fontSize: '11px', marginTop: '4px' }}>
                                                            recolta {formatCurrency(row.cropRevenue)} + APIA {formatCurrency(row.subsidyRevenue)}
                                                        </div>
                                                    )}
                                                    {row.revenueOverride != null && (
                                                        <div style={{ color: '#2563eb', fontSize: '11px', marginTop: '4px' }}>venit introdus manual</div>
                                                    )}
                                                </>
                                            )}
                                        </BodyCell>
                                        <BodyCell>
                                            <strong style={{ color: profitColor }}>{formatCurrency(row.profit)}</strong>
                                            <div style={{ color: profitColor, fontSize: '12px', marginTop: '4px', fontWeight: 700 }}>{formatCurrency(row.profitPerHectare)} / ha</div>
                                        </BodyCell>
                                        <BodyCell>
                                            {!row.seasonId ? (
                                                <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                                                    Adauga sezon pentru venit
                                                </span>
                                            ) : editing ? (
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => saveFinancials(row.seasonId)}
                                                        disabled={savingSeasonId === row.seasonId}
                                                        className="btn-primary"
                                                        style={{ padding: '6px 10px', fontSize: '12px' }}
                                                    >
                                                        {savingSeasonId === row.seasonId ? 'Se salveaza...' : 'Salveaza'}
                                                    </button>
                                                    <button
                                                        onClick={() => cancelEditingFinancials(row.seasonId)}
                                                        className="btn-secondary"
                                                        style={{ padding: '6px 10px', fontSize: '12px' }}
                                                    >
                                                        Anuleaza
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditingFinancials(row)}
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 10px', fontSize: '12px' }}
                                                >
                                                    Editeaza venit
                                                </button>
                                            )}
                                        </BodyCell>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, accent }) => (
    <div className="card" style={{ padding: '18px 20px', borderTop: `4px solid ${accent}` }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>{title}</div>
        <div style={{ color: 'var(--text-main)', fontSize: '22px', fontWeight: 800, lineHeight: 1.2 }}>{value}</div>
    </div>
);

const HeaderCell = ({ children }) => (
    <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {children}
    </th>
);

const BodyCell = ({ children }) => (
    <td style={{ padding: '15px 16px', color: '#475569', fontSize: '14px' }}>
        {children}
    </td>
);

const Field = ({ label, children }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
        {label}
        {children}
    </label>
);

const inputStyle = {
    width: '120px',
    padding: '7px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '12px'
};

const formControlStyle = {
    width: '100%',
    padding: '9px 10px',
    borderRadius: '7px',
    border: '1px solid var(--border-color)',
    fontSize: '13px',
    boxSizing: 'border-box'
};

export default YieldReportPage;
