import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [newName,  setNewName]  = useState('');
  const [error,    setError]    = useState('');

  function load() {
    api.get('/services')
      .then(r => setServices(r.data))
      .catch(() => setError('Nem sikerült betölteni a szolgáltatásokat'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post('/services', { name: newName.trim() });
      setNewName('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Nem sikerült a létrehozás');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Biztosan törlöd ezt a szolgáltatást?')) return;
    try {
      await api.delete(`/services/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Nem sikerült a törlés');
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <h2 className="mb-4">Szolgáltatások kezelése</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleCreate} className="d-flex gap-2 mb-4">
        <input
          className="form-control"
          placeholder="Új szolgáltatás neve"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-dark">Hozzáadás</button>
      </form>

      <ul className="list-group">
        {services.map(s => (
          <li key={s.service_id} className="list-group-item d-flex justify-content-between align-items-center">
            {s.name}
            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(s.service_id)}>
              Törlés
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
