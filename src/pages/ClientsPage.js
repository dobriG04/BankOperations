import { useState, useEffect, useCallback } from 'react';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';
import * as api from '../api';
import * as v from '../utils/validation';

const PER_PAGE = 8;

export default function ClientsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [alert, setAlert] = useState({ message: '', type: 'success' });

    // All Clients
    const [allClients, setAllClients] = useState([]);
    const [page, setPage] = useState(1);

    // Details dropdown clients list (shared)
    const [clientOptions, setClientOptions] = useState([]);

    // Form states
    const [phForm, setPhForm] = useState({ firstName: '', lastName: '', egn: '', email: '', phone: '' });
    const [leForm, setLeForm] = useState({ companyName: '', eik: '', representativeName: '', email: '', phone: '' });

    // Details
    const [detailsId, setDetailsId] = useState('');
    const [clientDetails, setClientDetails] = useState(null);

    const showAlert = (message, type) => setAlert({ message, type });

    const fetchClients = useCallback(async () => {
        try {
            const clients = await api.getClients();
            setAllClients(clients);
            const options = clients.map(c => ({ value: c.id, label: `${c.email} (#${c.id})` }));
            setClientOptions(options);
        } catch (e) {
            showAlert('Failed to load clients.', 'danger');
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // Pagination logic
    const totalPages = Math.ceil(allClients.length / PER_PAGE);
    const paginatedClients = allClients.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // Create Physical Person
    const handlePhysicalSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, egn, email, phone } = phForm;
        if (v.isEmpty(firstName)) return showAlert('First name is required.', 'warning');
        if (v.isEmpty(lastName)) return showAlert('Last name is required.', 'warning');
        if (!v.isDigits(egn, 10)) return showAlert('EGN must be exactly 10 digits.', 'warning');
        if (!v.isValidEmail(email)) return showAlert('Invalid email.', 'warning');
        if (v.isEmpty(phone)) return showAlert('Phone is required.', 'warning');

        try {
            const data = await api.createPhysicalPerson({ ...phForm, phoneNumber: phone });
            showAlert(`Client created successfully! ID: ${data.id}`, 'success');
            setPhForm({ firstName: '', lastName: '', egn: '', email: '', phone: '' });
            fetchClients();
        } catch (e) {
            showAlert(e.message, 'danger');
        }
    };

    // Create Legal Entity
    const handleLegalSubmit = async (e) => {
        e.preventDefault();
        const { companyName, eik, representativeName, email, phone } = leForm;
        if (v.isEmpty(companyName)) return showAlert('Company name is required.', 'warning');
        if (!v.isDigits(eik, 9)) return showAlert('EIK must be exactly 9 digits.', 'warning');
        if (v.isEmpty(representativeName)) return showAlert('Representative name is required.', 'warning');
        if (!v.isValidEmail(email)) return showAlert('Invalid email.', 'warning');
        if (v.isEmpty(phone)) return showAlert('Phone is required.', 'warning');

        try {
            const data = await api.createLegalEntity({ ...leForm, phoneNumber: phone });
            showAlert(`Legal entity created successfully! ID: ${data.id}`, 'success');
            setLeForm({ companyName: '', eik: '', representativeName: '', email: '', phone: '' });
            fetchClients();
        } catch (e) {
            showAlert(e.message, 'danger');
        }
    };

    // Load client details when selected
    const loadDetails = async (id) => {
        if (!id) {
            setClientDetails(null);
            return;
        }
        try {
            const c = await api.getClientDetails(id);
            setClientDetails(c);
        } catch (e) {
            showAlert('Client not found.', 'danger');
        }
    };

    const handleDetailsChange = (e) => {
        const id = e.target.value;
        setDetailsId(id);
        loadDetails(id);
    };

    // Tab helpers
    const TabBtn = ({ tab, children }) => (
        <button className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {children}
        </button>
    );

    return (
        <div className="container">
            <div className="page-header">
                <h2>Clients</h2>
                <p>Register and manage physical persons and legal entities</p>
            </div>
            <Alert message={alert.message} type={alert.type} />

            <div className="tab-bar">
                <TabBtn tab="all">All Clients</TabBtn>
                <TabBtn tab="physical">New Physical Person</TabBtn>
                <TabBtn tab="legal">New Legal Entity</TabBtn>
                <TabBtn tab="details">Client Details</TabBtn>
            </div>

            {/* TAB: All Clients */}
            {activeTab === 'all' && (
                <div className="card p-4">
                    {paginatedClients.length === 0 ? (
                        <p style={{ color: 'var(--muted)' }}>No clients found.</p>
                    ) : (
                        <>
                            <table>
                                <thead>
                                <tr>
                                    <th>ID</th><th>Email</th><th>Phone</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedClients.map(c => (
                                    <tr key={c.id}>
                                        <td>#{c.id}</td>
                                        <td>{c.email}</td>
                                        <td>{c.phoneNumber}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </>
                    )}
                </div>
            )}

            {/* TAB: New Physical Person */}
            {activeTab === 'physical' && (
                <div className="card p-4">
                    <h5 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Register Physical Person</h5>
                    <form onSubmit={handlePhysicalSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">First Name</label>
                                <input className="form-control" placeholder="Ivan" value={phForm.firstName} onChange={e => setPhForm({ ...phForm, firstName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Last Name</label>
                                <input className="form-control" placeholder="Petrov" value={phForm.lastName} onChange={e => setPhForm({ ...phForm, lastName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">EGN (10 digits)</label>
                                <input className="form-control" maxLength="10" placeholder="9504151234" value={phForm.egn} onChange={e => setPhForm({ ...phForm, egn: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input className="form-control" type="email" placeholder="ivan@example.com" value={phForm.email} onChange={e => setPhForm({ ...phForm, email: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Phone</label>
                                <input className="form-control" placeholder="+359888123456" value={phForm.phone} onChange={e => setPhForm({ ...phForm, phone: e.target.value })} />
                            </div>
                        </div>
                        <button className="btn-bank mt-3" type="submit">Create Client</button>
                    </form>
                </div>
            )}

            {/* TAB: New Legal Entity */}
            {activeTab === 'legal' && (
                <div className="card p-4">
                    <h5 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Register Legal Entity</h5>
                    <form onSubmit={handleLegalSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Company Name</label>
                                <input className="form-control" placeholder="ACME OOD" value={leForm.companyName} onChange={e => setLeForm({ ...leForm, companyName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">EIK (9 digits)</label>
                                <input className="form-control" maxLength="9" placeholder="123456789" value={leForm.eik} onChange={e => setLeForm({ ...leForm, eik: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Representative Name</label>
                                <input className="form-control" placeholder="Maria Ivanova" value={leForm.representativeName} onChange={e => setLeForm({ ...leForm, representativeName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input className="form-control" type="email" placeholder="office@company.bg" value={leForm.email} onChange={e => setLeForm({ ...leForm, email: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Phone</label>
                                <input className="form-control" placeholder="+35929001234" value={leForm.phone} onChange={e => setLeForm({ ...leForm, phone: e.target.value })} />
                            </div>
                        </div>
                        <button className="btn-bank mt-3" type="submit">Create Entity</button>
                    </form>
                </div>
            )}

            {/* TAB: Client Details */}
            {activeTab === 'details' && (
                <div className="card p-4">
                    <h5 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Client Details</h5>
                    <div className="col-md-6 mb-3 px-0">
                        <label className="form-label">Select Client</label>
                        <select className="form-control" value={detailsId} onChange={handleDetailsChange}>
                            <option value="">Select a client...</option>
                            {clientOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    {clientDetails && <ClientDetailsCard client={clientDetails} />}
                </div>
            )}
        </div>
    );
}

// Sub-component for displaying details (keeps logic separated)
function ClientDetailsCard({ client }) {
    const isPhysical = client.firstName !== undefined;
    return (
        <div>
            <div className="detail-section">
                <div className="detail-section-title">Client #{client.id}</div>
                {isPhysical ? (
                    <>
                        <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">Physical Person</span></div>
                        <div className="detail-row"><span className="detail-label">Full Name</span><span className="detail-value">{client.firstName} {client.lastName}</span></div>
                        <div className="detail-row"><span className="detail-label">EGN</span><span className="detail-value">{client.egn}</span></div>
                    </>
                ) : (
                    <>
                        <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value">Legal Entity</span></div>
                        <div className="detail-row"><span className="detail-label">Company</span><span className="detail-value">{client.companyName}</span></div>
                        <div className="detail-row"><span className="detail-label">EIK</span><span className="detail-value">{client.eik}</span></div>
                        <div className="detail-row"><span className="detail-label">Representative</span><span className="detail-value">{client.representativeName}</span></div>
                    </>
                )}
                <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{client.email}</span></div>
                <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{client.phoneNumber}</span></div>
            </div>

            <div className="detail-section">
                <div className="detail-section-title">Bank Accounts ({client.bankAccounts?.length ?? 0})</div>
                {client.bankAccounts?.length ? (
                    <table>
                        <thead><tr><th>ID</th><th>IBAN</th><th>Balance</th><th>Status</th></tr></thead>
                        <tbody>
                        {client.bankAccounts.map(a => (
                            <tr key={a.id}>
                                <td>#{a.id}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{a.iban}</td>
                                <td>{parseFloat(a.balance).toFixed(2)} BGN</td>
                                <td className={a.status === 0 ? 'status-active' : 'status-closed'}>{a.status === 0 ? 'Active' : 'Closed'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No bank accounts.</p>}
            </div>

            <div className="detail-section">
                <div className="detail-section-title">Credits ({client.credits?.length ?? 0})</div>
                {client.credits?.length ? (
                    <table>
                        <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Duration</th><th>Installments</th></tr></thead>
                        <tbody>
                        {client.credits.map(cr => {
                            const paid = cr.installments?.filter(i => i.isPaid).length ?? 0;
                            const total = cr.installments?.length ?? cr.durationInMonths;
                            return (
                                <tr key={cr.id}>
                                    <td>#{cr.id}</td>
                                    <td>{cr.type === 0 ? 'Consumer' : 'Mortgage'}</td>
                                    <td>{parseFloat(cr.amount).toFixed(2)} BGN</td>
                                    <td>{cr.durationInMonths} months</td>
                                    <td style={{ color: 'var(--muted)' }}>{paid}/{total} paid</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                ) : <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No credits.</p>}
            </div>
        </div>
    );
}