import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';

const STATUS_BADGE = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'secondary',
  completed: 'primary',
  no_show: 'danger',
};

const STATUS_LABEL = {
  pending: 'Függőben',
  confirmed: 'Megerősítve',
  cancelled: 'Lemondva',
  completed: 'Teljesítve',
  no_show: 'Nem jelent meg',
};

const TRANSITIONS = {
  pending: ['completed', 'no_show', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
};

const TRANSITION_LABEL = {
  completed: 'Teljesítve',
  no_show: 'Nem jelent meg',
  cancelled: 'Lemondva',
};

const TRANSITION_BTN = {
  completed: 'btn-success',
  no_show: 'btn-danger',
  cancelled: 'btn-outline-secondary',
};

export default function BarberAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  function load() {
    setLoading(true);
    api.get('/appointments/my')
      .then(r => setAppointments(r.data))
      .catch(() => setError('Nem sikerült betölteni a foglalásokat'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(apptId, newStatus) {
    setUpdating(apptId);
    try {
      await api.patch(`/appointments/${apptId}/status`, { status: newStatus });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a státusz frissítésekor');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2 className="mb-4">Foglalásaim</h2>
      {appointments.length === 0 ? (
        <p className="text-muted">Nincs ütemezett foglalás.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {appointments.map(a => {
            const transitions = TRANSITIONS[a.status] || [];
            const isUpdating = updating === a.appointment_id;

            return (
              <div
                key={a.appointment_id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '.25rem' }}>
                        {new Date(a.start_at).toLocaleString('hu-HU')}
                        <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '.85rem', marginLeft: '.5rem' }}>({a.duration} perc)</span>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: '.2rem' }}>
                        Ügyfél: <span style={{ color: 'var(--text)' }}>{a.customer_name}</span>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '.875rem' }}>
                        Szolgáltatások: <span style={{ color: 'var(--text)' }}>{a.services}</span>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                      <span className={`badge bg-${STATUS_BADGE[a.status]}`}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                      {transitions.length > 0 && (
                        <div className="d-flex gap-1 flex-wrap justify-content-end">
                          {transitions.map(t => (
                            <button
                              key={t}
                              className={`btn btn-sm ${TRANSITION_BTN[t]}`}
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(a.appointment_id, t)}
                            >
                              {isUpdating ? '…' : TRANSITION_LABEL[t]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
