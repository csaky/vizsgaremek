import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api.js';

const STATUS_BADGE = {
  pending:   { bg: 'rgba(201,168,76,0.15)', color: 'var(--accent)', label: 'Függőben' },
  confirmed: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', label: 'Megerősítve' },
  cancelled: { bg: 'rgba(255,255,255,0.05)', color: 'var(--muted)', label: 'Lemondva' },
  completed: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'Teljesítve' },
  no_show:   { bg: 'rgba(220,53,69,0.12)', color: '#f87171', label: 'Nem jelent meg' },
};

export default function SalonAppointments() {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/appointments/salon/${id}`)
      .then(r => setAppointments(r.data))
      .catch(() => setError('Nem sikerült betölteni az időpontokat'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="spinner-border" style={{ color: 'var(--accent)' }} />
    </div>
  );
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2 className="mb-4">Időpontok</h2>
      {appointments.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Nincs időpont ehhez a szalonhoz.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {appointments.map(a => {
            const badge = STATUS_BADGE[a.status] || STATUS_BADGE.cancelled;
            return (
              <div
                key={a.appointment_id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem 1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr auto',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {/* Dátum & ügyfél */}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '.2rem' }}>
                    {new Date(a.start_at).toLocaleString('hu-HU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{a.customer_name}</div>
                </div>

                {/* Borbély & szolgáltatások */}
                <div>
                  <div style={{ fontSize: '.9rem', marginBottom: '.2rem' }}>{a.barber_name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginBottom: '.1rem' }}>{a.services}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{a.duration} perc</div>
                </div>

                {/* Státusz badge */}
                <div>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      borderRadius: 999,
                      padding: '4px 14px',
                      fontSize: '.8rem',
                      fontWeight: 500,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Placeholder – konzisztens grid */}
                <div style={{ width: 140 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
