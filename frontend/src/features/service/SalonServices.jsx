import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api.js';

export default function SalonServices() {
  const { id } = useParams();

  const [salonServices, setSalonServices] = useState([]);
  const [allServices,   setAllServices]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [form, setForm] = useState({ service_id: '', price: '', duration_min: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([
      api.get(`/salons/${id}/services`),
      api.get('/services'),
    ])
      .then(([salonRes, allRes]) => {
        setSalonServices(salonRes.data);
        setAllServices(allRes.data);
      })
      .catch(() => setError('Nem sikerült betölteni a szolgáltatásokat'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  const assignedIds = new Set(salonServices.map(s => s.service_id));
  const available = allServices.filter(s => !assignedIds.has(s.service_id));

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.service_id || !form.price || !form.duration_min) return;
    setSaving(true);
    try {
      await api.post(`/salons/${id}/services`, {
        service_id:   parseInt(form.service_id),
        price:        parseFloat(form.price),
        duration_min: parseInt(form.duration_min),
      });
      setForm({ service_id: '', price: '', duration_min: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a hozzáadás során');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(serviceId) {
    if (!confirm('Biztosan eltávolítod ezt a szolgáltatást a szalonból?')) return;
    try {
      await api.delete(`/salons/${id}/services/${serviceId}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba az eltávolítás során');
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/owner/salon" className="btn btn-outline-secondary btn-sm">← Vissza</Link>
        <h2 className="mb-0">Szalon szolgáltatásai</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Hozzáadás form */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Szolgáltatás hozzáadása</h5>
          {available.length === 0 ? (
            <p className="text-muted mb-0">Minden elérhető szolgáltatás már hozzá van adva.</p>
          ) : (
            <form onSubmit={handleAdd} className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Szolgáltatás</label>
                <select
                  className="form-select"
                  value={form.service_id}
                  onChange={e => setForm(f => ({ ...f, service_id: e.target.value }))}
                  required
                >
                  <option value="">-- Válassz --</option>
                  {available.map(s => (
                    <option key={s.service_id} value={s.service_id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Ár (Ft)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  placeholder="pl. 3500"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Időtartam (perc)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="pl. 30"
                  value={form.duration_min}
                  onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
                  required
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-dark w-100" disabled={saving}>
                  Hozzáad
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Jelenlegi szolgáltatások listája */}
      <h5>Hozzárendelt szolgáltatások ({salonServices.length})</h5>
      {salonServices.length === 0 ? (
        <p className="text-muted">Még nincs szolgáltatás hozzáadva ehhez a szalonhoz.</p>
      ) : (
        <ul className="list-group">
          {salonServices.map(s => (
            <li key={s.service_id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{s.name}</strong>
                <span className="text-muted ms-3">{s.duration_min} perc</span>
                <span className="badge bg-dark ms-2">{Number(s.price).toLocaleString('hu-HU')} Ft</span>
              </div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleRemove(s.service_id)}
              >
                Eltávolít
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
