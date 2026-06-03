import { useState, useEffect, useCallback } from 'react';
import Alert from '../components/Alert';
import * as api from '../api';
import * as v from '../utils/validation';

export default function AccountsPage() {
    const [activeTab, setActiveTab] = useState('create');
    const [alert, setAlert] = useState({ message: '', type: 'success' });
    const [clients, setClients] = useState([]);

    // Create form
    const [createClientId, setCreateClientId] = useState('');
    const [createBalance, setCreateBalance] = useState('');
    const [ibanResult, setIbanResult] = useState('');

    // Close form
    const [closeClientId, setCloseClientId] = useState('');
    const [closeAccountId, setCloseAccountId] = useState('');
    const [closeAccounts, setCloseAccounts] = useState([]);

    const showAlert = (msg, type) => setAlert({ message: msg, type });

    const loadClients = useCallback(async () => {
        try {
            const list = await api.getClients();
            setClients(list);
        } catch (e) {
            showAlert('Could not load clients.', 'danger');
        }
    }, []);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const loadAccountsForClose = async (clientId) => {
        if (!clientId) {
            setCloseAccounts([]);
            setCloseAccountId('');
            return;
        }
        try {
            const c = await api.getClientDetails(clientId);
            const active = c.bankAccounts.filter(a => a.status === 0);
            setCloseAccounts(active);
            setCloseAccountId('');
        } catch (e) {
            showAlert('Could not load accounts.', 'danger');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!v.isPositiveInt(createClientId)) return showAlert('Please select a client.', 'warning');
        if (!v.isNonNegativeNumber(createBalance)) return showAlert('Balance must be 0 or more.', 'warning');

        try {
            const data = await api.createBankAccount({
                clientId: parseInt(createClientId),
                initialBalance: parseFloat(createBalance)
            });
            setIbanResult(data.iban);
            showAlert('Account opened successfully!', 'success');
        } catch (e) {
            showAlert(e.message, 'danger');
        }
    };

    const handleClose = async () => {
        if (!v.isPositiveInt(closeAccountId)) return showAlert('Select an account to close.', 'warning');
        const acc = closeAccounts.find(a => a.id === parseInt(closeAccountId));
        if (!window.confirm(`Close account ${acc?.iban}? This cannot be undone.`)) return;

        try {
            const data = await api.closeBankAccount(closeAccountId);
            showAlert(data.message, 'success');
            loadAccountsForClose(closeClientId);
        } catch (e) {
            showAlert(e.message, 'danger');
        }
    };

    const TabBtn = ({ tab, children }) => (
        <button className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {children}
        </button>
    );

    return (
        <div className="container">
            <div className="page-header">
                <h2>Bank Accounts</h2>
                <p>Open new accounts and manage existing ones</p>
            </div>
            <Alert message={alert.message} type={alert.type} />

            <div className="tab-bar">
                <TabBtn tab="create">Create Account</TabBtn>
                <TabBtn tab="close">Close Account</TabBtn>
            </div>

            {activeTab === 'create' && (
                <div className="card p-4">
                    <h5 className="mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Open New Account</h5>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }} className="mb-3">An IBAN will be generated automatically.</p>
                    <form onSubmit={handleCreate}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Client</label>
                                <select className="form-control" value={createClientId} onChange={e => setCreateClientId(e.target.value)}>
                                    <option value="">Select a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.email} (#{c.id})</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Initial Balance (BGN)</label>
                                <input type="number" className="form-control" placeholder="e.g. 1000" step="0.01" min="0"
                                       value={createBalance} onChange={e => setCreateBalance(e.target.value)} />
                            </div>
                        </div>
                        <button className="btn-bank mt-3" type="submit">Open Account</button>
                    </form>
                    {ibanResult && (
                        <div className="iban-result" style={{ display: 'block' }}>
                            <div className="iban-label">IBAN Generated</div>
                            <div className="iban-value">{ibanResult}</div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'close' && (
                <div className="card p-4">
                    <h5 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Close Account</h5>
                    <div className="info-note">⚠️ The account balance must be <strong>zero</strong> before closing.</div>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Step 1 — Select Client</label>
                            <select className="form-control" value={closeClientId} onChange={e => {
                                setCloseClientId(e.target.value);
                                loadAccountsForClose(e.target.value);
                            }}>
                                <option value="">Select a client...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.email} (#{c.id})</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Step 2 — Select Account</label>
                            <select className="form-control" value={closeAccountId} onChange={e => setCloseAccountId(e.target.value)}>
                                <option value="">{closeAccounts.length ? 'Select an account...' : 'No active accounts'}</option>
                                {closeAccounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.iban} — {parseFloat(a.balance).toFixed(2)} BGN</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button className="btn-danger mt-3" onClick={handleClose}>Close Account</button>
                </div>
            )}
        </div>
    );
}