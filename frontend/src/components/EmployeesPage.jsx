import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const money = new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat('ro-RO', {
    maximumFractionDigits: 2
});

const monthNames = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

const EmployeesPage = () => {
    const today = new Date();
    const [employees, setEmployees] = useState([]);
    const [payroll, setPayroll] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCompensation, setEditingCompensation] = useState({});
    const [savingEmployeeId, setSavingEmployeeId] = useState(null);
    const [selectedPayrollYear, setSelectedPayrollYear] = useState(today.getFullYear());
    const [selectedPayrollMonth, setSelectedPayrollMonth] = useState(today.getMonth() + 1);
    const [loadingPayroll, setLoadingPayroll] = useState(true);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'WORKER',
        hourlyRate: '',
        monthlySalary: ''
    });

    const [error, setError] = useState('');

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/farms/employees');
            setEmployees(response.data);
        } catch (err) {
            console.error('Eroare la preluarea angajatilor:', err);
        }
    }, []);

    const fetchPayroll = useCallback(async () => {
        setLoadingPayroll(true);
        try {
            const response = await apiClient.get('/api/reports/payroll', {
                params: { year: selectedPayrollYear, month: selectedPayrollMonth }
            });
            setPayroll(response.data);
        } catch (err) {
            console.error('Eroare la preluarea payroll-ului:', err);
            setPayroll(null);
        } finally {
            setLoadingPayroll(false);
        }
    }, [selectedPayrollYear, selectedPayrollMonth]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchPayroll();
    }, [fetchPayroll]);

    const yearOptions = useMemo(() => {
        const currentYear = today.getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
    }, [today]);

    const totals = useMemo(() => {
        return employees.reduce((acc, employee) => {
            if (employee.role === 'WORKER') {
                acc.hourlyWorkers += 1;
            }
            if (employee.role === 'AGRONOMIST') {
                acc.monthlySalary += Number(employee.monthlySalary || 0);
            }
            return acc;
        }, { hourlyWorkers: 0, monthlySalary: 0 });
    }, [employees]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const buildCompensationPayload = (data) => ({
        hourlyRate: data.hourlyRate === '' ? null : Number(data.hourlyRate),
        monthlySalary: data.monthlySalary === '' ? null : Number(data.monthlySalary)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await apiClient.post('/api/farms/employees', {
                username: formData.username.trim(),
                password: formData.password,
                email: formData.email.trim(),
                role: formData.role,
                ...buildCompensationPayload(formData)
            });
            resetForm();
            await fetchEmployees();
        } catch (err) {
            console.error('Eroare la adaugarea angajatului:', err);
            const message = err.response?.data?.message || err.response?.data || 'A aparut o eroare.';
            setError(message);
        }
    };

    const resetForm = () => {
        setFormData({ username: '', password: '', email: '', role: 'WORKER', hourlyRate: '', monthlySalary: '' });
        setShowForm(false);
        setError('');
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'FARM_MANAGER': return 'Manager';
            case 'AGRONOMIST': return 'Agronom';
            case 'WORKER': return 'Muncitor';
            default: return role;
        }
    };

    const startEditingCompensation = (employee) => {
        setEditingCompensation((current) => ({
            ...current,
            [employee.id]: {
                hourlyRate: employee.hourlyRate ?? '',
                monthlySalary: employee.monthlySalary ?? ''
            }
        }));
    };

    const cancelEditingCompensation = (employeeId) => {
        setEditingCompensation((current) => {
            const next = { ...current };
            delete next[employeeId];
            return next;
        });
    };

    const updateCompensationValue = (employeeId, field, value) => {
        setEditingCompensation((current) => ({
            ...current,
            [employeeId]: {
                ...current[employeeId],
                [field]: value
            }
        }));
    };

    const saveCompensation = async (employeeId) => {
        const values = editingCompensation[employeeId];
        if (!values) return;

        const payload = buildCompensationPayload(values);
        if ((payload.hourlyRate !== null && payload.hourlyRate < 0) || (payload.monthlySalary !== null && payload.monthlySalary < 0)) {
            alert('Valorile salariale nu pot fi negative.');
            return;
        }

        setSavingEmployeeId(employeeId);
        try {
            await apiClient.put(`/api/farms/employees/${employeeId}/compensation`, payload);
            cancelEditingCompensation(employeeId);
            await fetchEmployees();
        } catch (err) {
            console.error('Eroare la salvarea datelor salariale:', err);
            alert('Nu s-au putut salva datele salariale.');
        } finally {
            setSavingEmployeeId(null);
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header-left">
                    <BackButton />
                    <div>
                        <h1 className="page-title">Managementul echipei</h1>
                        <p className="page-subtitle">Date salariale folosite in payroll si in raportul de profitabilitate.</p>
                    </div>
                </div>
            </div>

            <div className="metric-grid" style={{ marginBottom: '20px' }}>
                <SummaryCard label="Angajati" value={employees.length} />
                <SummaryCard label="Muncitori cu tarif orar" value={totals.hourlyWorkers} />
                <SummaryCard label="Salarii lunare agronomi" value={money.format(totals.monthlySalary)} />
            </div>

            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Payroll lunar</h3>
                        <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Totaluri salariale pentru luna selectata.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select value={selectedPayrollMonth} onChange={(e) => setSelectedPayrollMonth(Number(e.target.value))} style={selectStyle}>
                            {monthNames.map((month, index) => (
                                <option key={month} value={index + 1}>{month}</option>
                            ))}
                        </select>
                        <select value={selectedPayrollYear} onChange={(e) => setSelectedPayrollYear(Number(e.target.value))} style={selectStyle}>
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                    <SummaryCard label="Ore muncitori" value={`${numberFormatter.format(Number(payroll?.totalWorkerHours || 0))} h`} />
                    <SummaryCard label="Plata muncitori" value={money.format(Number(payroll?.totalWorkerPay || 0))} />
                    <SummaryCard label="Salarii agronomi" value={money.format(Number(payroll?.totalAgronomistSalary || 0))} />
                    <SummaryCard label="Total payroll" value={money.format(Number(payroll?.totalPayroll || 0))} />
                </div>

                {loadingPayroll ? (
                    <p style={{ color: 'var(--text-muted)' }}>Se incarca payroll-ul...</p>
                ) : !payroll || payroll.rows.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nu exista angajati pentru aceasta ferma.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={payrollThStyle}>Angajat</th>
                                    <th style={payrollThStyle}>Rol</th>
                                    <th style={payrollThStyle}>Ore lucrate</th>
                                    <th style={payrollThStyle}>Tarif / salariu</th>
                                    <th style={payrollThStyle}>Lucrari</th>
                                    <th style={payrollThStyle}>Plata estimata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payroll.rows.map((row) => (
                                    <tr key={row.employeeId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={payrollTdStyle}><strong>{row.username}</strong></td>
                                        <td style={payrollTdStyle}>{getRoleLabel(row.role)}</td>
                                        <td style={payrollTdStyle}>{numberFormatter.format(Number(row.hoursWorked || 0))} h</td>
                                        <td style={payrollTdStyle}>
                                            {row.role === 'WORKER'
                                                ? `${money.format(Number(row.hourlyRate || 0))} / ora`
                                                : `${money.format(Number(row.monthlySalary || 0))} / luna`}
                                        </td>
                                        <td style={payrollTdStyle}>{row.completedActivities || 0}</td>
                                        <td style={payrollTdStyle}><strong>{money.format(Number(row.estimatedPay || 0))}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Angajatii Fermei ({employees.length})</h3>
                    {!showForm && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Adauga Angajat</button>
                    )}
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--light-gray)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h4 style={{ marginTop: 0 }}>Adauga un membru nou in echipa</h4>
                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                            <Field label="Nume utilizator:*">
                                <input type="text" name="username" value={formData.username} onChange={handleChange} style={inputStyle} required />
                            </Field>
                            <Field label="Parola temporara:*">
                                <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} required />
                            </Field>
                            <Field label="Email:">
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
                            </Field>
                            <Field label="Rol in ferma:*">
                                <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
                                    <option value="WORKER">Muncitor</option>
                                    <option value="AGRONOMIST">Agronom</option>
                                </select>
                            </Field>
                            <Field label="Tarif orar muncitor (RON):">
                                <input type="number" min="0" step="0.01" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} style={inputStyle} />
                            </Field>
                            <Field label="Salariu lunar agronom (RON):">
                                <input type="number" min="0" step="0.01" name="monthlySalary" value={formData.monthlySalary} onChange={handleChange} style={inputStyle} />
                            </Field>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">Adauga Angajat</button>
                            <button type="button" className="btn-secondary" onClick={resetForm}>Anuleaza</button>
                        </div>
                    </form>
                )}

                {employees.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Nu exista angajati inregistrati.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ marginTop: '10px', minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Nume Utilizator</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Rol</th>
                                    <th style={thStyle}>Tarif orar</th>
                                    <th style={thStyle}>Salariu lunar</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Actiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee, index) => {
                                    const editing = editingCompensation[employee.id];
                                    return (
                                        <tr key={employee.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{employee.username}</td>
                                            <td style={{ padding: '12px' }}>{employee.email || '-'}</td>
                                            <td style={{ padding: '12px' }}>{getRoleLabel(employee.role)}</td>
                                            <td style={{ padding: '12px' }}>
                                                {editing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={editing.hourlyRate}
                                                        onChange={(e) => updateCompensationValue(employee.id, 'hourlyRate', e.target.value)}
                                                        style={smallInputStyle}
                                                    />
                                                ) : employee.hourlyRate != null ? (
                                                    `${money.format(employee.hourlyRate)} / ora`
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {editing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={editing.monthlySalary}
                                                        onChange={(e) => updateCompensationValue(employee.id, 'monthlySalary', e.target.value)}
                                                        style={smallInputStyle}
                                                    />
                                                ) : employee.monthlySalary != null ? (
                                                    `${money.format(employee.monthlySalary)} / luna`
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {editing ? (
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                        <button className="btn-primary" style={buttonStyle} onClick={() => saveCompensation(employee.id)} disabled={savingEmployeeId === employee.id}>
                                                            {savingEmployeeId === employee.id ? 'Se salveaza...' : 'Salveaza'}
                                                        </button>
                                                        <button className="btn-secondary" style={buttonStyle} onClick={() => cancelEditingCompensation(employee.id)}>
                                                            Anuleaza
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="btn-secondary" style={buttonStyle} onClick={() => startEditingCompensation(employee)}>
                                                        Editare salarizare
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value }) => (
    <div className="card" style={{ padding: '16px 18px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
        <div style={{ color: 'var(--text-main)', fontSize: '22px', fontWeight: 800, marginTop: '6px' }}>{value}</div>
    </div>
);

const Field = ({ label, children }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
        {label}
        {children}
    </label>
);

const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    border: '1px solid var(--border-color)',
    borderRadius: '6px'
};

const smallInputStyle = {
    width: '120px',
    padding: '7px 8px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px'
};

const selectStyle = {
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontWeight: 600,
    backgroundColor: '#fff'
};

const thStyle = {
    padding: '12px'
};

const payrollThStyle = {
    padding: '12px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase'
};

const payrollTdStyle = {
    padding: '12px',
    color: '#475569',
    fontSize: '14px'
};

const buttonStyle = {
    padding: '6px 10px',
    fontSize: '12px'
};

export default EmployeesPage;
