import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../app/provider.jsx';
import api from '../lib/api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
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
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Bejelentkezés sikertelen');
    } finally {
      setLoading(false);
    }
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
          Üdvözlünk vissza
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
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h3 style={{ marginBottom: '2rem' }}>Bejelentkezés</h3>

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">E-mail cím</label>
              <input
                type="email"
                name="email"
                className="form-control login-input"
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
                className="form-control login-input"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-dark w-100 mt-2" disabled={loading}>
              {loading ? 'Bejelentkezés…' : 'Bejelentkezés'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>
            Még nincs fiókod?{' '}
            <Link to="/register" style={{ color: 'var(--accent)' }}>Regisztrálj</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
