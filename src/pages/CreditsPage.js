import { useState, useEffect, useCallback } from 'react';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';
import * as api from '../api';
import * as v from '../utils/validation';

const INST_PER_PAGE = 12;

export default function CreditsPage() {
    const [activeTab, setActiveTab] = useState('create');
    const [alert, setAlert] = useState({ message: '', type: 'success' });
    const [clients, setClients] = useState([]);

    // Issue credit
    const [creditForm, setCreditForm] = useState({ clientId: '', type: '0', amount: '', duration: '' });

    // Details
    const [detailsClientId, setDetailsClientId] = useState('');
    const [detailsCreditId, setDetailsCreditId] = useState('');
    const [clientCredits, setClientCredits] = useState([]);
    const [creditDetails, setCreditDetails] = useState(null);
    const [instPage, setInstPage] = useState(1);

    // Pay
    const [payClientId, setPayClientId] = useState('');
    const [payCreditId, setPayCreditId] = useState('');
    const [payInstallmentId, setPayInstallmentId] = useState('');
    const [payAccountId, setPayAccountId] = useState('');
    const [payCredits, setPayCredits] = useState([]);
    const [payInstallments, setPayInstallments] = useState([]);
    const [payAccounts, setPayAccounts] = useState([]);

    const showAlert = (msg, type) => setAlert({ message: msg, type });

    const loadClients = useCallback(async () => {
        try {
            const list = await api.getClients();
            setClients(list);
        } catch (e) {
            showAlert('Could not load clients.', 'danger');
        }
    }, []);

    useEffect(() => { loadClients(); }, [loadClients]);

    // --- Issue Credit ---
    const handleCreateCredit = async (e) => {
        e.preventDefault();
        const { clientId, type, amount, duration } = creditForm;
        if (!v.isPositiveInt(clientId)) return showAlert('Select a client.', 'warning');
        if (!v.isPositiveNumber(amount)) return showAlert('Amount must be > 0.', 'warning');
        if (!v.isPositiveInt(duration) || Number(duration) > 360) return showAlert('Duration 1-360 months.', 'warning');

        try {
            const data = await api.createCredit({
                clientId: parseInt(clientId),
                type: parseInt(type),
                amount: parseFloat(amount),
                durationInMonths: parseInt(duration)
            });
            showAlert(`✓ Credit issued! ID: ${data.id}. Go to Credit Details.`, 'success');
        } catch (e) {
            showAlert(e.message, 'danger');
        }
    };

    // --- Details helpers ---
    const loadCreditsForClient = async (id) => {
        if (!id) { setClientCredits([]); setDetailsCreditId(''); return; }
        try {
            const c = await api.getClientDetails(id);
            setClientCredits(c.credits || []);
            setDetailsCreditId('');
            setCreditDetails(null);
        } catch (e) {
            showAlert('Could not load credits.', 'danger');
        }
    };

    const loadCreditDetails = async (id) => {
        if (!id) { setCreditDetails(null); return; }
        try {
            const data = await api.getCreditDetails(id);
            setCreditDetails(data);
            setInstPage(1);
        } catch (e) {
            showAlert('Credit not found.', 'danger');
        }
    };

    // --- Pay helpers ---
    const loadPayData = async (clientId) => {
        if (!clientId) {
            setPayCredits([]); setPayInstallments([]); setPayAccounts([]);
            setPayCreditId(''); setPayInstallmentId(''); setPayAccountId('');
            return;
        }
        try {
            const c = await api.getClientDetails(clientId);
            setPayCredits(c.credits || []);
            setPayAccounts(c.bankAccounts?.filter(a => a.status === 0) || []);
            setPayCreditId(''); setPayInstallmentId(''); setPayAccountId('');
        } catch (e) {
            showAlert('Could not load data.', 'danger');
        }
    };

    const loadInstallmentsForPay = async (creditId) => {
        if (!creditId) { setPayInstallments([]); setPayInstallmentId(''); return; }
        try {
            const data = await api.getCreditDetails(creditId);
            setPayInstallments(data.installments.filter(i => !i.isPaid));
            setPayInstallmentId('');
        } catch (e) {
            showAlert('Could not load installments.', 'danger');
        }
    };

    const handlePay = async () => {
        if (!v.isPositiveInt(payInstallmentId)) return showAlert('Select an installment.', 'warning');
        if (!v.isPositiveInt(payAccountId)) return showAlert('Select an account to pay from.', 'warning');
        try {
            const data = await api.payInstallment(parseInt(payInstallmentId));
            showAlert(data.message, 'success');
            loadInstallmentsForPay(payCreditId);
            loadPayData(payClientId);
        } catch (e) {
            showAlert(e.message, 'danger');
        }
    };

    // Installments pagination for credit details
    const instTotalPages = creditDetails ? Math.ceil(creditDetails.installments.length / INST_PER_PAGE) : 0;
    const instSlice = creditDetails
        ? creditDetails.installments.slice((instPage - 1) * INST_PER_PAGE, instPage * INST_PER_PAGE)
        : [];

    const TabBtn = ({ tab, children }) => (
        <button className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {children}
        </button>
    );

    return (
        <div className="container">
            <div className="page-header">
                <h2>Credits</h2>
                <p>Issue credits, view repayment plans, and process payments</p>
            </div>
            <Alert message={alert.message} type={alert.type} />

            <div className="tab-bar">
                <TabBtn tab="create">Issue Credit</TabBtn>
                <TabBtn tab="details">Credit Details</TabBtn>
                <TabBtn tab="pay">Pay Installment</TabBtn>
            </div>

            {/* TAB: Issue Credit */}
            {activeTab === 'create' && (
                <div className="card p-4">
                    <h5 className="mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Issue New Credit</h5>
                    <div className="rate-note">Interest rates — Consumer: <strong>10.5% annual</strong> | Mortgage: <strong>4.5% annual</strong></div>
                    <form onSubmit={handleCreateCredit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Client</label>
                                <select className="form-control" value={creditForm.clientId} onChange={e => setCreditForm({ ...creditForm, clientId: e.target.value })}>
                                    <option value="">Select a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.email} (#{c.id})</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Credit Type</label>
                                <select className="form-select" value={creditForm.type} onChange={e => setCreditForm({ ...creditForm, type: e.target.value })}>
                                    <option value="0">Consumer (10.5%)</option>
                                    <option value="1">Mortgage (4.5%)</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Amount (BGN)</label>
                                <input type="number" className="form-control" placeholder="e.g. 10000" min="1" step="0.01"
                                       value={creditForm.amount} onChange={e => setCreditForm({ ...creditForm, amount: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Duration (months)</label>
                                <input type="number" className="form-control" placeholder="e.g. 24" min="1" max="360"
                                       value={creditForm.duration} onChange={e => setCreditForm({ ...creditForm, duration: e.target.value })} />
                            </div>
                        </div>
                        <button className="btn-bank mt-3" type="submit">Issue Credit</button>
                    </form>
                </div>
            )}

            {/* TAB: Credit Details */}
            {activeTab === 'details' && (
                <div className="card p-4">
                    <h5 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Credit Details & Repayment Plan</h5>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Step 1 — Select Client</label>
                            <select className="form-control" value={detailsClientId} onChange={e => {
                                setDetailsClientId(e.target.value);
                                loadCreditsForClient(e.target.value);
                            }}>
                                <option value="">Select a client...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.email} (#{c.id})</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Step 2 — Select Credit</label>
                            <select className="form-control" value={detailsCreditId} onChange={e => {
                                setDetailsCreditId(e.target.value);
                                loadCreditDetails(e.target.value);
                            }}>
                                <option value="">Select a credit...</option>
                                {clientCredits.map(cr => (
                                    <option key={cr.id} value={cr.id}>
                                        {cr.type === 0 ? 'Consumer' : 'Mortgage'} — {parseFloat(cr.amount).toFixed(2)} BGN — {cr.durationInMonths} months
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {creditDetails && (
                        <div>
                            <div className="credit-meta">
                                <div className="meta-badge">ID <span>#{creditDetails.id}</span></div>
                                <div className="meta-badge">Type <span>{creditDetails.type === 0 ? 'Consumer' : 'Mortgage'}</span></div>
                                <div className="meta-badge">Amount <span>{creditDetails.amount} BGN</span></div>
                                <div className="meta-badge">Duration <span>{creditDetails.durationInMonths} months</span></div>
                                <div className="meta-badge">Rate <span>{creditDetails.type === 0 ? '10.5%' : '4.5%'}</span></div>
                                <div className="meta-badge">Paid <span>{creditDetails.installments.filter(i => i.isPaid).length}/{creditDetails.installments.length}</span></div>
                            </div>
                            <h6 style={{ color: 'var(--muted)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Repayment Plan</h6>
                            <table>
                                <thead><tr><th>#</th><th>Inst. ID</th><th>Total</th><th>Principal</th><th>Interest</th><th>Remaining</th><th>Status</th></tr></thead>
                                <tbody>
                                {instSlice.map(inst => (
                                    <tr key={inst.id}>
                                        <td>{inst.monthNumber}</td>
                                        <td style={{ color: 'var(--muted)' }}>#{inst.id}</td>
                                        <td><strong>{inst.totalAmount.toFixed(2)}</strong></td>
                                        <td>{inst.principalPart.toFixed(2)}</td>
                                        <td>{inst.interestPart.toFixed(2)}</td>
                                        <td>{inst.remainingBalance.toFixed(2)}</td>
                                        <td>{inst.isPaid ? <span className="badge-paid">Paid</span> : <span className="badge-pending">Pending</span>}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <Pagination page={instPage} totalPages={instTotalPages} onPageChange={setInstPage} />
                        </div>
                    )}
                </div>
            )}

            {/* TAB: Pay Installment */}
            {activeTab === 'pay' && (
                <div className="card p-4">
                    <h5 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Pay Installment</h5>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Step 1 — Select Client</label>
                            <select className="form-control" value={payClientId} onChange={e => {
                                setPayClientId(e.target.value);
                                loadPayData(e.target.value);
                            }}>
                                <option value="">Select a client...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.email} (#{c.id})</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Step 2 — Select Credit</label>
                            <select className="form-control" value={payCreditId} onChange={e => {
                                setPayCreditId(e.target.value);
                                loadInstallmentsForPay(e.target.value);
                            }}>
                                <option value="">Select a credit...</option>
                                {payCredits.map(cr => (
                                    <option key={cr.id} value={cr.id}>
                                        {cr.type === 0 ? 'Consumer' : 'Mortgage'} — {parseFloat(cr.amount).toFixed(2)} BGN
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Step 3 — Select Installment</label>
                            <select className="form-control" value={payInstallmentId} onChange={e => setPayInstallmentId(e.target.value)}>
                                <option value="">{payInstallments.length ? 'Select an installment...' : 'No pending'}</option>
                                {payInstallments.map(i => (
                                    <option key={i.id} value={i.id}>Month {i.monthNumber} — {i.totalAmount.toFixed(2)} BGN</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Step 4 — Pay From Account</label>
                            <select className="form-control" value={payAccountId} onChange={e => setPayAccountId(e.target.value)}>
                                <option value="">Select an account...</option>
                                {payAccounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.iban} — {parseFloat(a.balance).toFixed(2)} BGN</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button className="btn-success mt-3" onClick={handlePay}>Pay</button>
                </div>
            )}
        </div>
    );
}