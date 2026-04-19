import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api.js';
import { useAuth } from '../../app/provider.jsx';
import MonthDayCalendar from './MonthDayCalendar.jsx';

const STEPS = ['Szalon kiválasztása', 'Borbély & Szolgáltatások', 'Időpont foglalása'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hasRole } = useAuth();

  if (hasRole('barber')) {
    return (
      <div className="alert alert-warning mt-4">
        Borbélyként nem foglalhatsz időpontot.
      </div>
    );
  }

  const [salons, setSalons] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);

  const [salonId, setSalonId] = useState(params.get('salon') || '');
  const [barberId, setBarberId] = useState('');
  const [serviceIds, setServiceIds] = useState([]);
  const [startAt, setStartAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(params.get('salon') ? 2 : 1);

  useEffect(() => {
    api.get('/salons').then(r => setSalons(r.data));
  }, []);

  useEffect(() => {
    if (!salonId) return;
    api.get(`/salons/${salonId}`).then(r => {
      setServices(r.data.services);
      setBarbers(r.data.barbers);
      setBarberId('');
      setServiceIds([]);
    });
  }, [salonId]);

  function toggleService(id) {
    setServiceIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (serviceIds.length === 0) { setError('Válassz legalább egy szolgáltatást.'); return; }
    setLoading(true);
    try {
      await api.post('/appointments', {
        salon_id:    parseInt(salonId),
        barber_id:   parseInt(barberId),
        start_at:    startAt,
        service_ids: serviceIds,
      });
      navigate('/my-appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'A foglalás sikertelen');
    } finally {
      setLoading(false);
    }
  }

  const selectedSalon = salons.find(s => String(s.salon_id) === String(salonId));
  const selectedBarber = barbers.find(b => String(b.barber_id) === String(barberId));
  const selectedServices = services.filter(s => serviceIds.includes(s.service_id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + Number(s.duration_min || 0), 0);

  const cardStyle = (active) => ({
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    background: active ? 'rgba(201,168,76,0.08)' : 'var(--surface)',
    transition: 'border-color .2s, background .2s',
    userSelect: 'none',
  });

  function goToStep3() {
    if (!barberId || serviceIds.length === 0) {
      setError('Válassz borbélyt és legalább egy szolgáltatást.');
      return;
    }
    setError('');
    setStep(3);
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Időpont foglalása</h2>
      <h5 className="mb-4" style={{ color: 'var(--muted)', fontSize: '.85rem', letterSpacing: '.05em' }}>
        {step}. lépés – {STEPS[step - 1]}
      </h5>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* 1. lépés – Szalon */}
      {step === 1 && (
        <div>
          <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>Válassz szalont</p>
          <div className="row g-3 mb-4">
            {salons.map(s => (
              <div key={s.salon_id} className="col-md-4">
                <div
                  onClick={() => setSalonId(String(s.salon_id))}
                  style={cardStyle(String(salonId) === String(s.salon_id))}
                >
                  <div style={{ fontWeight: 600, marginBottom: '.25rem' }}>{s.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{s.address}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-dark px-5"
            onClick={() => setStep(2)}
            disabled={!salonId}
          >
            Tovább →
          </button>
        </div>
      )}

      {/* 2. lépés – Borbély & Szolgáltatások */}
      {step === 2 && (
        <div>
          <div className="row g-4">
            <div className="col-md-6">
              <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Borbély</p>
              <div className="d-flex flex-column gap-2">
                {barbers.map(b => (
                  <div
                    key={b.barber_id}
                    onClick={() => setBarberId(String(b.barber_id))}
                    style={cardStyle(String(barberId) === String(b.barber_id))}
                  >
                    <div style={{ fontWeight: 500 }}>{b.full_name}</div>
                    {b.ratings && (
                      <div style={{ color: 'var(--accent)', fontSize: '.85rem' }}>★ {b.ratings}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-6">
              <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Szolgáltatások</p>
              <div className="d-flex flex-column gap-2">
                {services.map(s => {
                  const active = serviceIds.includes(s.service_id);
                  return (
                    <div
                      key={s.service_id}
                      onClick={() => toggleService(s.service_id)}
                      style={cardStyle(active)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500 }}>{s.name}</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.price} Ft</span>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{s.duration_min} perc</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button className="btn btn-outline-dark px-4" onClick={() => setStep(1)}>← Vissza</button>
            <button className="btn btn-dark px-5" onClick={goToStep3}>Tovább →</button>
          </div>
        </div>
      )}

      {/* 3. lépés – Időpont + Összefoglalás */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Bal: naptár */}
            <div className="col-lg-7">
              <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Válassz időpontot
                {totalDuration > 0 && (
                  <span style={{ marginLeft: '.5rem', color: 'var(--accent)', fontSize: '.85rem' }}>
                    ({totalDuration} perces időpont)
                  </span>
                )}
              </p>

              <MonthDayCalendar
                barberId={barberId}
                totalDuration={totalDuration || 30}
                onSelect={iso => setStartAt(iso)}
                selectedDateTime={startAt}
              />

              {/* Kiválasztott időpont kiírása + kézi módosítás lehetősége */}
              <div style={{ marginTop: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                  Kiválasztott időpont (szerkeszthető)
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={startAt}
                  onChange={e => setStartAt(e.target.value)}
                  required
                  style={{
                    background: '#1a1a1a',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    colorScheme: 'dark',
                    maxWidth: 260,
                    fontSize: '.9rem',
                  }}
                />
              </div>
            </div>

            {/* Jobb: összefoglaló panel */}
            <div className="col-md-5">
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  position: 'sticky',
                  top: 80,
                }}
              >
                <p
                  style={{
                    color: 'var(--muted)',
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    fontSize: '.72rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  Összefoglalás
                </p>

                {selectedSalon && (
                  <div className="mb-2">
                    <div style={{ color: 'var(--muted)', fontSize: '.72rem' }}>Szalon</div>
                    <div style={{ fontWeight: 500 }}>{selectedSalon.name}</div>
                  </div>
                )}

                {selectedBarber && (
                  <div className="mb-2">
                    <div style={{ color: 'var(--muted)', fontSize: '.72rem' }}>Borbély</div>
                    <div style={{ fontWeight: 500 }}>{selectedBarber.full_name}</div>
                  </div>
                )}

                {startAt && (
                  <div className="mb-2">
                    <div style={{ color: 'var(--muted)', fontSize: '.72rem' }}>Időpont</div>
                    <div style={{ fontWeight: 500, color: 'var(--accent)' }}>
                      {new Date(startAt).toLocaleString('hu-HU', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                    {totalDuration > 0 && (
                      <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{totalDuration} perc</div>
                    )}
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div className="mb-3">
                    <div style={{ color: 'var(--muted)', fontSize: '.72rem', marginBottom: '.5rem' }}>
                      Szolgáltatások
                    </div>
                    {selectedServices.map(s => (
                      <div
                        key={s.service_id}
                        style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}
                      >
                        <span style={{ fontSize: '.9rem' }}>{s.name}</span>
                        <span style={{ fontSize: '.9rem', color: 'var(--accent)' }}>{s.price} Ft</span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Összesen</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>
                    {totalPrice} Ft
                  </span>
                </div>

                <button type="submit" className="btn btn-dark w-100" disabled={loading || !startAt}>
                  {loading ? 'Foglalás…' : 'Foglalás megerősítése'}
                </button>
                {!startAt && (
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '.5rem' }}>
                    Válassz időpontot a naptárból
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-dark px-4 mt-4"
            onClick={() => setStep(2)}
          >
            ← Vissza
          </button>
        </form>
      )}
    </div>
  );
}
