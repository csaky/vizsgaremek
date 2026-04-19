import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/provider.jsx';
import api from '../../lib/api.js';

export default function MySalon() {
  const { user } = useAuth();
  const [salons,  setSalons]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [creating, setCreating] = useState(false);

  function load() {
    api.get('/salons')
      .then(r => setSalons(r.data.filter(s => s.owner_name === user?.full_name)))
      .catch(() => setError('Nem sikerült betölteni'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/salons', form);
      setForm({ name: '', address: '', phone: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Nem sikerült a szalon létrehozása');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <h2 className="mb-4">Szalonjaim</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5>Új szalon létrehozása</h5>
          <form onSubmit={handleCreate} className="row g-3">
            <div className="col-md-4">
              <input placeholder="Szalon neve" className="form-control" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="col-md-4">
              <input placeholder="Cím" className="form-control" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
            </div>
            <div className="col-md-2">
              <input placeholder="Telefon" className="form-control" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-dark w-100" disabled={creating}>Létrehozás</button>
            </div>
          </form>
        </div>
      </div>

      {salons.length === 0 ? (
        <p className="text-muted">Még nincs szalonod.</p>
      ) : (
        <div className="row g-3">
          {salons.map(s => (
            <div key={s.salon_id} className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>{s.name}</h5>
                  <p className="text-muted small">{s.address}</p>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/owner/salon/edit/${s.salon_id}`} className="btn btn-outline-dark btn-sm">Szerkesztés</Link>
                  <Link to={`/owner/salon/${s.salon_id}/services`} className="btn btn-outline-dark btn-sm">Szolgáltatások</Link>
                  <Link to={`/owner/salon/${s.salon_id}/barbers`} className="btn btn-outline-dark btn-sm">Borbélyok</Link>
                  <Link to={`/owner/appointments/${s.salon_id}`} className="btn btn-outline-dark btn-sm">Időpontok</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
