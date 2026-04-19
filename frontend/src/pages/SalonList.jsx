import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';

function InitialAvatar({ name }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent), #a87b30)',
        color: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '1rem',
        flexShrink: 0,
        fontFamily: "'Playfair Display', serif",
      }}
    >
      {initials}
    </div>
  );
}


export default function SalonList() {
  const [salons, setSalons]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/salons')
      .then(r => setSalons(r.data))
      .catch(() => setError('Nem sikerült betölteni a szalonokat'))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  const filtered = salons.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-5">
      <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-3">
        <h2 style={{ margin: 0 }}>Borbélyszalonok</h2>
        <input
          type="search"
          className="form-control"
          placeholder="Keresés név vagy cím alapján…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      <div className="row g-4">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Betöltés...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nincs találat.</p>
        ) : (
          filtered.map(salon => (
            <div key={salon.salon_id} className="col-md-4">
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.75rem',
                  transition: 'transform .25s, border-color .25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <InitialAvatar name={salon.name} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{salon.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{salon.address}</div>
                  </div>
                </div>

                {salon.phone && (
                  <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{salon.phone}</div>
                )}

                <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
                  Tulajdonos: {salon.owner_name}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '.75rem' }}>
                  <Link
                    to={`/salons/${salon.salon_id}`}
                    className="btn btn-dark btn-sm w-100"
                  >
                    Részletek megtekintése
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
