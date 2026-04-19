import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/provider.jsx';
import api from '../lib/api.js';
import { Store, CalendarPlus, CalendarCheck, Scissors, CalendarDays, Users } from 'lucide-react';

const ICON_PROPS = { size: 36, strokeWidth: 1.5, color: 'var(--accent)' };


const customerCards = [
  { icon: <Store {...ICON_PROPS} />,       title: 'Szalonok böngészése', text: 'Fedezd fel a szalonokat a közeledben.',  to: '/salons' },
  { icon: <CalendarPlus {...ICON_PROPS} />, title: 'Új foglalás',         text: 'Foglalj időpontot percek alatt.',        to: '/book' },
  { icon: <CalendarCheck {...ICON_PROPS} />, title: 'Foglalásaim',        text: 'Kezeld és kövesd időpontjaidat.',        to: '/my-appointments' },
];

const barberCards = [
  { icon: <CalendarDays {...ICON_PROPS} />, title: 'Foglalásaim',     text: 'A mai és jövőbeli időpontjaim.',    to: '/barber/appointments' },
  { icon: <Scissors {...ICON_PROPS} />,     title: 'Szolgáltatásaim', text: 'Milyen szolgáltatásokat kínálok.', to: '/barber/services' },
];

function ownerCards(firstSalonId) {
  return [
    { icon: <Store {...ICON_PROPS} />,        title: 'Szalonjaim',     text: 'Kezeld és szerkeszd szalonjaidat.',  to: '/owner/salon' },
    { icon: <Scissors {...ICON_PROPS} />,     title: 'Szolgáltatások', text: 'Szerkeszd a kínálatot.',            to: '/owner/services' },
    {
      icon: <CalendarDays {...ICON_PROPS} />,
      title: 'Foglalások',
      text: 'Lásd, mi vár rád a szalonodban.',
      to: firstSalonId ? `/owner/appointments/${firstSalonId}` : '/owner/salon',
    },
    {
      icon: <Users {...ICON_PROPS} />,
      title: 'Borbélyok',
      text: 'Kezeld és szerkeszd borbélyaidat.',
      to: firstSalonId ? `/owner/salon/${firstSalonId}/barbers` : '/owner/salon',
    },
  ];
}


function QuickCard({ icon, title, text, to, index, colClass = 'col-md-4' }) {
  return (
    <div className={colClass}>
      <Link to={to} style={{ textDecoration: 'none' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
            textAlign: 'center',
            height: '100%',
          }}
        >
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
          <h5 style={{ color: 'var(--accent)', marginBottom: '.75rem' }}>{title}</h5>
          <p style={{ color: 'var(--muted)', margin: 0, lineHeight: 1.65 }}>{text}</p>
        </div>
      </Link>
    </div>
  );
}


export default function Home() {
  const { user, hasRole } = useAuth();
  const [firstSalonId, setFirstSalonId] = useState(null);

  useEffect(() => {
    if (hasRole('owner') && user) {
      api.get('/salons')
        .then(r => {
          const mine = r.data.find(s => s.owner_name === user.full_name);
          if (mine) setFirstSalonId(mine.salon_id);
        })
        .catch(() => {});
    }
  }, [user]);

  const role = hasRole('owner') ? 'owner' : hasRole('barber') ? 'barber' : hasRole('customer') ? 'customer' : null;

  const cards = user
    ? role === 'owner'  ? ownerCards(firstSalonId)
    : role === 'barber' ? barberCards
    : customerCards
    : null;


  if (user) {
    return (
      <div style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          <div className="row g-4">
            {cards.map((card, i) => (
              <QuickCard key={card.title} index={i} {...card} colClass={role === 'owner' || role === 'barber' ? 'col-md-6' : 'col-md-4'} />
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div>

      <section
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '4rem 1.5rem',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '4rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '1rem',
          }}
        >
          Blade<span style={{ color: 'var(--accent)' }}>Runner</span>
        </h1>

        <p
          style={{
            color: 'var(--accent)',
            fontSize: '1.25rem',
            fontStyle: 'italic',
            fontFamily: "'Playfair Display', serif",
            marginBottom: '1.5rem',
          }}
        >
          „Egyszerűen, elegánsan."
        </p>

        <p
          style={{
            maxWidth: 480,
            color: 'var(--muted)',
            fontSize: '1rem',
            lineHeight: 1.8,
            marginBottom: '2.5rem',
          }}
        >
          Találd meg a hozzád illő borbélyt, foglalj időpontot percek alatt.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/salons" className="btn btn-dark btn-lg px-5">
            Szalonok böngészése
          </Link>
          <Link to="/register" className="btn btn-outline-dark btn-lg px-5">
            Ingyenes regisztráció
          </Link>
        </div>
      </section>

    </div>
  );
}
