import React, { useEffect, useState } from 'react';
import { useAuth } from '../../app/provider.jsx';
import api from '../../lib/api.js';

export default function BarberServices() {
  const { user } = useAuth();
  const [myServices,  setMyServices]  = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  function load() {
    Promise.all([
      api.get(`/barbers/${user.user_id}/services`),
      api.get('/services')
    ]).then(([my, all]) => {
      setMyServices(my.data);
      setAllServices(all.data);
    }).catch(() => setError('Nem sikerült betölteni a szolgáltatásokat'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const myIds = myServices.map(s => s.service_id);
  const available = allServices.filter(s => !myIds.includes(s.service_id));

  async function addService(serviceId) {
    try {
      await api.post(`/barbers/${user.user_id}/services`, { service_id: serviceId });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Nem sikerült a szolgáltatás hozzáadása');
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <h2 className="mb-4">Saját szolgáltatásaim</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-md-6">
          <h5>Általam kínált szolgáltatások</h5>
          {myServices.length === 0 ? (
            <p className="text-muted">Még nincs egyetlen sem.</p>
          ) : (
            <ul className="list-group">
              {myServices.map(s => (
                <li key={s.service_id} className="list-group-item">{s.name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-md-6">
          <h5>Szolgáltatás hozzáadása</h5>
          {available.length === 0 ? (
            <p className="text-muted">Nincs több hozzáadható szolgáltatás.</p>
          ) : (
            <ul className="list-group">
              {available.map(s => (
                <li key={s.service_id} className="list-group-item d-flex justify-content-between align-items-center">
                  {s.name}
                  <button className="btn btn-dark btn-sm" onClick={() => addService(s.service_id)}>Hozzáadás</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
