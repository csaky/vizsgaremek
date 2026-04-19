import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api.js';

function InitialAvatar({ name, size = 48 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent), #a87b30)',
        color: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.35 + 'px',
        flexShrink: 0,
        fontFamily: "'Playfair Display', serif",
      }}
    >
      {initials}
    </div>
  );
}

function StarRating({ value }) {
  if (!value) return null;
  const num = parseFloat(value);
  const full = Math.round(num);
  return (
    <span style={{ color: 'var(--accent)', fontSize: '.85rem' }}>
      {'★'.repeat(full)}{'☆'.repeat(Math.max(0, 5 - full))}
      <span style={{ color: 'var(--muted)', marginLeft: 4 }}>{num.toFixed(1)}</span>
    </span>
  );
}

export default function SalonDetails() {
  const { id } = useParams();
  const [salon, setSalon]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get(`/salons/${id}`)
      .then(r => setSalon(r.data))
      .catch(() => setError('Szalon nem található'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="spinner-border" style={{ color: 'var(--accent)' }} />
    </div>
  );
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 style={{ marginBottom: '.25rem' }}>{salon.name}</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '.25rem' }}>
          {salon.address}{salon.phone && ` · ${salon.phone}`}
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Tulajdonos: {salon.owner_name}</p>
      </div>

      <div className="row g-4">
        {/* Services */}
        <div className="col-md-6">
          <h5 className="mb-3">Szolgáltatások</h5>
          {salon.services.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Nincs elérhető szolgáltatás.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {salon.services.map(s => (
                <div
                  key={s.service_id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '.85rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                    {s.duration_min} perc ·{' '}
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.price} Ft</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barbers */}
        <div className="col-md-6">
          <h5 className="mb-3">Borbélyok</h5>
          {salon.barbers.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Még nincs borbély hozzárendelve.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {salon.barbers.map(b => (
                <div
                  key={b.barber_id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <InitialAvatar name={b.full_name} size={44} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{b.full_name}</div>
                    <StarRating value={b.ratings} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link to={`/book?salon=${id}`} className="btn btn-dark px-5">
          Időpont foglalása
        </Link>
      </div>
    </div>
  );
}
