import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';

export default function EditSalon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/salons/${id}`)
      .then(r => setForm({ name: r.data.name, address: r.data.address, phone: r.data.phone || '' }))
      .catch(() => setError('Szalon nem található'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/salons/${id}`, form);
      navigate('/owner/salon');
    } catch (err) {
      setError(err.response?.data?.message || 'A frissítés sikertelen');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="card-title mb-4">Szalon szerkesztése</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Név</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Cím</label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Telefon</label>
                <input className="form-control" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-dark" disabled={saving}>
                  {saving ? 'Mentés…' : 'Módosítások mentése'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/owner/salon')}>
                  Mégse
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
