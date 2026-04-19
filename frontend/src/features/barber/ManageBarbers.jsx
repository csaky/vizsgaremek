import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';

export default function ManageBarbers() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [barbers,  setBarbers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [form,     setForm]     = useState({ full_name: '', email: '', password: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  function loadBarbers() {
    api.get(`/salons/${id}/barbers`)
      .then(r => setBarbers(r.data))
      .catch(() => setError('Nem sikerült betölteni a borbélyokat'))
      .finally(() => setLoading(false));
  }

  useEffect(loadBarbers, [id]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setFormError('');
    try {
      await api.post(`/salons/${id}/barbers`, form);
      setForm({ full_name: '', email: '', password: '', phone: '' });
      loadBarbers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Hiba a borbély létrehozásakor');
    } finally {
      setCreating(false);
    }
  }

  async function handleRemove(barberId, barberName) {
    if (!window.confirm(`Biztosan eltávolítod ${barberName} borbélyt? Ez a fiókját is törli.`)) return;
    try {
      await api.delete(`/salons/${id}/barbers/${barberId}`);
      setBarbers(prev => prev.filter(b => b.barber_id !== barberId));
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba az eltávolításkor');
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="d-flex align-items-center mb-4 gap-3">
        <h2 className="mb-0">Borbélyok kezelése</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/owner/salon')}>
          Vissza
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Új borbély hozzáadása</h5>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <form onSubmit={handleCreate} className="row g-3">
            <div className="col-md-3">
              <input
                placeholder="Teljes név"
                className="form-control"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="email"
                placeholder="Email"
                className="form-control"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="password"
                placeholder="Jelszó"
                className="form-control"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                placeholder="Telefon"
                className="form-control"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-dark w-100" disabled={creating}>
                {creating ? 'Létrehozás…' : 'Hozzáadás'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <h5>Borbélyok ({barbers.length})</h5>
      {barbers.length === 0 ? (
        <p className="text-muted">Még nincs borbély ehhez a szalonhoz.</p>
      ) : (
        <div className="list-group">
          {barbers.map(b => (
            <div key={b.barber_id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{b.full_name}</span>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleRemove(b.barber_id, b.full_name)}
              >
                Eltávolítás
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
