import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';

const STATUS_BADGE = {
  pending:   { bg: 'rgba(201,168,76,0.15)', color: 'var(--accent)', label: 'Függőben' },
  confirmed: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', label: 'Megerősítve' },
  cancelled: { bg: 'rgba(255,255,255,0.05)', color: 'var(--muted)', label: 'Lemondva' },
  completed: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'Teljesítve' },
};

function relativeTime(dateStr) {
  const diff   = new Date(dateStr).getTime() - Date.now();
  const abs    = Math.abs(diff);
  const mins   = Math.floor(abs / 60000);
  const hours  = Math.floor(mins / 60);
  const days   = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const future = diff > 0;

  if (months >= 1) return future ? `${months} hónap múlva`  : `${months} hónapja`;
  if (days   >= 1) return future ? `${days} nap múlva`      : `${days} napja`;
  if (hours  >= 1) return future ? `${hours} óra múlva`     : `${hours} órája`;
  if (mins   >= 1) return future ? `${mins} perc múlva`     : `${mins} perce`;
  return 'most';
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [confirmId, setConfirmId] = useState(null);

  function load() {
    setLoading(true);
    api.get('/appointments/my')
      .then(r => setAppointments(r.data))
      .catch(() => setError('Nem sikerült betölteni a foglalásokat'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancelConfirmed() {
    try {
      await api.delete(`/appointments/${confirmId}`);
      setConfirmId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'A lemondás sikertelen');
      setConfirmId(null);
    }
  }

  if (loading) return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="spinner-border" style={{ color: 'var(--accent)' }} />
    </div>
  );
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Foglalásaim</h2>

      {appointments.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Még nincs foglalásod.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {appointments.map(a => {
            const badge       = STATUS_BADGE[a.status] || STATUS_BADGE.cancelled;
            const canCancel   = a.status === 'pending' || a.status === 'confirmed';
            const isConfirming = confirmId === a.appointment_id;

            return (
              <div
                key={a.appointment_id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem 1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 140px',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {/* Dátum & szalon */}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '.2rem' }}>
                    {new Date(a.start_at).toLocaleString('hu-HU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '.78rem', marginBottom: '.25rem' }}>
                    {relativeTime(a.start_at)}
                  </div>
                  <div style={{ fontSize: '.9rem' }}>{a.salon_name}</div>
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

                {/* Lemondás / megerősítés */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  {canCancel && !isConfirming && (
                    <button
                      onClick={() => setConfirmId(a.appointment_id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        borderRadius: 'var(--radius)',
                        padding: '5px 14px',
                        fontSize: '.8rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'border-color .2s, color .2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#f87171';
                        e.currentTarget.style.color = '#f87171';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--muted)';
                      }}
                    >
                      Lemondás
                    </button>
                  )}

                  {isConfirming && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', minWidth: 130 }}>
                      <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Biztosan lemondod?</span>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button
                          onClick={cancelConfirmed}
                          style={{
                            flex: 1,
                            background: 'rgba(220,53,69,0.15)',
                            border: '1px solid rgba(220,53,69,0.4)',
                            color: '#f87171',
                            borderRadius: 6,
                            padding: '4px 0',
                            fontSize: '.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Igen
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          style={{
                            flex: 1,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--muted)',
                            borderRadius: 6,
                            padding: '4px 0',
                            fontSize: '.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Nem
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
