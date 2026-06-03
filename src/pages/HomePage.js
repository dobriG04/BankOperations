import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="container py-5">
            <p className="text-uppercase mb-1" style={{ color: 'var(--accent)', fontSize: '0.75rem', letterSpacing: '0.3em' }}>
                Internal Banking System
            </p>
            <h1 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3.5rem', fontWeight: 300 }}>
                BankOperations
            </h1>

            <div className="row g-4">
                <div className="col-md-4">
                    <Link to="/clients" className="card p-4" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="fs-2 mb-2">👤</div>
                        <h5>Clients</h5>
                        <p className="mb-0" style={{ color: 'var(--muted)' }}>Register and manage physical persons and legal entities.</p>
                    </Link>
                </div>
                <div className="col-md-4">
                    <Link to="/accounts" className="card p-4" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="fs-2 mb-2">🏦</div>
                        <h5>Bank Accounts</h5>
                        <p className="mb-0" style={{ color: 'var(--muted)' }}>Open new IBAN accounts and close existing ones.</p>
                    </Link>
                </div>
                <div className="col-md-4">
                    <Link to="/credits" className="card p-4" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="fs-2 mb-2">💳</div>
                        <h5>Credits</h5>
                        <p className="mb-0" style={{ color: 'var(--muted)' }}>Issue consumer and mortgage credits, track installments.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}