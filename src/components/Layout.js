import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Layout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <nav className="navbar">
                <Link className="navbar-brand fw-semibold" to="/">◈ BANKOPERATIONS</Link>
                <button
                    className="navbar-toggler"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>
                <div className={`navbar-collapse ${menuOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav">
                        <li><NavLink className="nav-link" to="/clients" onClick={() => setMenuOpen(false)}>Clients</NavLink></li>
                        <li><NavLink className="nav-link" to="/accounts" onClick={() => setMenuOpen(false)}>Accounts</NavLink></li>
                        <li><NavLink className="nav-link" to="/credits" onClick={() => setMenuOpen(false)}>Credits</NavLink></li>
                    </ul>
                </div>
            </nav>
            <main>{children}</main>
        </>
    );
}