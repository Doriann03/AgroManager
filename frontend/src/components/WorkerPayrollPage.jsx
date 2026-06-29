import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axiosConfig';
import BackButton from './BackButton';

const moneyFormatter = new Intl.NumberFormat('ro-RO', {
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

const WorkerPayrollPage = () => {
    const today = new Date();
    const [payroll, setPayroll] = useState(null);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [loading, setLoading] = useState(true);

    const yearOptions = useMemo(() => {
        const currentYear = today.getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
    }, [today]);

    const fetchPayroll = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/reports/worker-payroll', {
                params: { year: selectedYear, month: selectedMonth }
            });
            setPayroll(response.data);
        } catch (error) {
            console.error('Eroare la preluarea fluturasului:', error);
            setPayroll(null);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchPayroll();
    }, [fetchPayroll]);

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        return new Date(dateTimeStr).toLocaleString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMoney = (value) => moneyFormatter.format(Number(value || 0));
    const formatNumber = (value) => numberFormatter.format(Number(value || 0));

    const activityTypeLabels = {
        ARAT: 'Arat',
        SEMANAT: 'Semanat',
        RECOLTAT: 'Recoltat',
        IRIGAT: 'Irigat',
        TRATAMENT: 'Tratament',
        ALTELE: 'Altele'
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '22px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BackButton />
                    <div style={{ marginLeft: '20px' }}>
                        <h1 style={{ margin: 0, color: 'var(--primary-green)' }}>Fluturas lunar</h1>
                        <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>Ore lucrate, tarif orar si plata estimata.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} style={selectStyle}>
                        {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={selectStyle}>
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px' }}>Fluturas {monthNames[selectedMonth - 1]} {selectedYear}</h2>
                        <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>Calculat din lucrarile finalizate in luna selectata.</p>
                    </div>
                    <strong style={{ color: 'var(--primary-green)', fontSize: '22px' }}>{formatMoney(payroll?.totalPay)}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                    <SummaryCard label="Ore lucrate" value={`${formatNumber(payroll?.totalHours)} h`} />
                    <SummaryCard label="Tarif orar" value={`${formatMoney(payroll?.hourlyRate)} / ora`} />
                    <SummaryCard label="Lucrari finalizate" value={payroll?.completedActivities || 0} />
                </div>

                {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Se incarca fluturasul...</p>
                ) : !payroll || payroll.tasks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nu exista lucrari finalizate in aceasta luna.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={thStyle}>Lucrare</th>
                                    <th style={thStyle}>Parcela</th>
                                    <th style={thStyle}>Interval</th>
                                    <th style={thStyle}>Ore</th>
                                    <th style={thStyle}>Plata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payroll.tasks.map((task) => (
                                    <tr key={task.activityId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={tdStyle}>
                                            <strong>{activityTypeLabels[task.type] || task.type}</strong>
                                            {task.title && <div style={mutedSmall}>{task.title}</div>}
                                        </td>
                                        <td style={tdStyle}>{task.parcelName}</td>
                                        <td style={tdStyle}>
                                            <div>{formatDateTime(task.startDate)}</div>
                                            <div style={mutedSmall}>{formatDateTime(task.endDate)}</div>
                                        </td>
                                        <td style={tdStyle}>{formatNumber(task.hoursWorked)} h</td>
                                        <td style={tdStyle}><strong>{formatMoney(task.estimatedPay)}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value }) => (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', backgroundColor: '#fff' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
        <div style={{ color: 'var(--text-main)', fontSize: '20px', fontWeight: 800, marginTop: '6px' }}>{value}</div>
    </div>
);

const selectStyle = {
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontWeight: 600,
    backgroundColor: '#fff'
};

const thStyle = {
    padding: '12px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase'
};

const tdStyle = {
    padding: '12px',
    color: '#475569',
    fontSize: '14px',
    verticalAlign: 'top'
};

const mutedSmall = {
    color: 'var(--text-muted)',
    fontSize: '12px',
    marginTop: '4px'
};

export default WorkerPayrollPage;
