import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../app/provider.jsx';
import api from '../lib/api.js';

export default function Register() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '', full_name: '', phone: '', role: 'customer' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      const msgs = err.response?.data?.errors?.map(e => e.msg).join(', ');
      setError(msgs || err.response?.data?.message || 'Regisztráció sikertelen');
    } finally {
      setLoading(false);
    }
  }

  function RoleCard({ value, label, desc }) {
    const active = form.role === value;
    return (
      <div
        onClick={() => setForm(f => ({ ...f, role: value }))}
        style={{
          flex: 1,
          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '1rem',
          cursor: 'pointer',
          background: active ? 'rgba(201,168,76,0.08)' : 'var(--surface)',
          transition: 'border-color .2s, background .2s',
          userSelect: 'none',
        }}
      >
        <div style={{ fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', marginBottom: '.25rem' }}>
          {label}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{desc}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 61px)',
      }}
    >
      {/* Márka oldal */}
      <div
        style={{
          background: 'linear-gradient(160deg, #111 0%, #1a140a 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          borderRight: '1px solid var(--border)',
        }}
      >
        <p
          style={{
            color: 'var(--accent)',
            letterSpacing: '.3em',
            textTransform: 'uppercase',
            fontSize: '.72rem',
            marginBottom: '1rem',
          }}
        >
          Csatlakozz hozzánk
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '3rem',
            color: 'var(--text)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          Blade<span style={{ color: 'var(--accent)' }}>Runner</span>
        </h1>
        <p style={{ color: 'var(--muted)', textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>
          Regisztrálj ingyenesen és foglalj időpontot percek alatt.
        </p>
      </div>

      {/* Űrlap oldal */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          background: 'var(--bg)',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h3 style={{ marginBottom: '2rem' }}>Fiók létrehozása</h3>

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Teljes név</label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label">E-mail cím</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Jelszó</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Telefonszám (opcionális)</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label" style={{ display: 'block', marginBottom: '.75rem' }}>
                Fiók típusa
              </label>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <RoleCard value="customer" label="Ügyfél" desc="Időpontokat foglalhatsz" />
                <RoleCard value="owner" label="Szalontulajdonos" desc="Saját szalont kezelhetsz" />
              </div>
            </div>

            <button type="submit" className="btn btn-dark w-100 mt-2" disabled={loading}>
              {loading ? 'Fiók létrehozása…' : 'Regisztráció'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>
            Van már fiókod?{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }}>Jelentkezz be</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
