import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/provider.jsx';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 1030,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderBottom: '1px solid var(--border)',
  };

  const brandStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '1.25rem',
    letterSpacing: '0.25em',
    color: 'var(--accent)',
    textDecoration: 'none',
    textTransform: 'uppercase',
  };

  const getLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--accent)' : 'var(--muted)',
    textDecoration: 'none',
    fontSize: '.88rem',
    letterSpacing: '.04em',
    paddingBottom: '3px',
    borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
    transition: 'color .2s, border-color .2s',
  });

  return (
    <nav style={navStyle}>
      <div className="container d-flex align-items-center py-3">
        <Link to="/" style={brandStyle}>BladeRunner</Link>

        <div className="ms-auto d-flex align-items-center gap-4 flex-wrap">
          {!user && (
            <NavLink style={getLinkStyle} to="/salons">Szalonok</NavLink>
          )}

          {user ? (
            <>
              <span style={{ color: 'var(--text)', fontSize: '.88rem' }}>{user.full_name}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--muted)',
                  borderRadius: 'var(--radius)',
                  padding: '6px 14px',
                  fontSize: '.82rem',
                  cursor: 'pointer',
                  transition: 'border-color .2s, color .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--muted)';
                }}
              >
                Kijelentkezés
              </button>
            </>
          ) : (
            <>
              <NavLink style={getLinkStyle} to="/login">Bejelentkezés</NavLink>
              <Link
                to="/register"
                style={{
                  background: 'var(--accent)',
                  color: '#0A0A0A',
                  borderRadius: 'var(--radius)',
                  padding: '6px 18px',
                  fontSize: '.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '.03em',
                }}
              >
                Regisztráció
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
