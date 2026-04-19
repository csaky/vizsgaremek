import React, { useEffect, useState } from 'react';
import api from '../../lib/api.js';

const HU_MONTHS = ['Január','Február','Március','Április','Május','Június',
  'Július','Augusztus','Szeptember','Október','November','December'];
const HU_DAYS = ['H','K','Sz','Cs','P','Szo','V'];

function pad(n) { return String(n).padStart(2, '0'); }

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

const TIME_SLOTS = [];
for (let h = 9; h < 19; h++) {
  TIME_SLOTS.push({ hour: h, minute: 0 });
  TIME_SLOTS.push({ hour: h, minute: 30 });
}

export default function MonthDayCalendar({ barberId, totalDuration = 30, onSelect, selectedDateTime }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activeDay, setActiveDay] = useState(today);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!barberId) return;
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    api.get(`/appointments/barber/${barberId}/slots`, { params: { from, to } })
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]));
  }, [barberId, year, month]);

  // havi naptár cellák
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  // napok amelyeken van foglalás (pont jelzéshez)
  const occupiedDays = new Set(slots.map(s => dateKey(new Date(s.start_at))));

  // adott naphoz tartozó foglalások
  const daySlots = slots.filter(s => dateKey(new Date(s.start_at)) === dateKey(activeDay));

  function slotOccupied(slot) {
    const start = new Date(activeDay);
    start.setHours(slot.hour, slot.minute, 0, 0);
    const end = new Date(start.getTime() + totalDuration * 60000);
    return daySlots.some(b => {
      const bStart = new Date(b.start_at).getTime();
      const bEnd = bStart + b.duration * 60000;
      return start.getTime() < bEnd && end.getTime() > bStart;
    });
  }

  function handleSlotClick(slot) {
    const dt = new Date(activeDay);
    dt.setHours(slot.hour, slot.minute, 0, 0);
    onSelect(`${dateKey(dt)}T${pad(slot.hour)}:${pad(slot.minute)}`);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const selectedKey = selectedDateTime ? selectedDateTime.slice(0, 16) : null;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

      {/* Havi naptár */}
      <div style={{ width: 240, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
          <button type="button" onClick={prevMonth} style={arrowBtn}>‹</button>
          <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{year} {HU_MONTHS[month]}</span>
          <button type="button" onClick={nextMonth} style={arrowBtn}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '.25rem' }}>
          {HU_DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '.65rem', color: 'var(--muted)', fontWeight: 600 }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const isPast = day < today;
            const isActive = dateKey(day) === dateKey(activeDay);
            const isToday = dateKey(day) === dateKey(today);
            const hasDot = occupiedDays.has(dateKey(day));

            return (
              <div
                key={i}
                onClick={() => !isPast && setActiveDay(new Date(day))}
                style={{
                  textAlign: 'center',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  lineHeight: '28px',
                  fontSize: '.78rem',
                  cursor: isPast ? 'default' : 'pointer',
                  background: isActive ? 'var(--accent)' : isToday ? 'rgba(201,168,76,0.2)' : 'transparent',
                  color: isActive ? '#0a0a0a' : isPast ? 'var(--muted)' : 'var(--text)',
                  fontWeight: isActive || isToday ? 700 : 400,
                  position: 'relative',
                  justifySelf: 'center',
                }}
              >
                {day.getDate()}
                {hasDot && !isActive && (
                  <span style={{
                    position: 'absolute', bottom: 2, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 3, height: 3, borderRadius: '50%',
                    background: 'var(--accent)', display: 'block',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Napi időpontok */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1rem' }}>
          {activeDay.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {TIME_SLOTS.map((slot, i) => {
            const dt = new Date(activeDay);
            dt.setHours(slot.hour, slot.minute, 0, 0);
            const isPast = dt < new Date();
            const occupied = slotOccupied(slot);
            const slotKey = `${dateKey(activeDay)}T${pad(slot.hour)}:${pad(slot.minute)}`;
            const isSelected = slotKey === selectedKey;
            const clickable = !isPast && !occupied;

            let bg, color, border, cursor, textDeco;
            if (isSelected) {
              bg = 'var(--accent)'; color = '#0a0a0a';
              border = '1px solid var(--accent)'; cursor = 'default'; textDeco = 'none';
            } else if (isPast || occupied) {
              bg = 'rgba(255,255,255,0.03)'; color = 'rgba(255,255,255,0.25)';
              border = '1px solid rgba(255,255,255,0.06)'; cursor = 'not-allowed';
              textDeco = occupied ? 'line-through' : 'none';
            } else {
              bg = 'rgba(79,163,224,0.1)'; color = '#4fa3e0';
              border = '1px solid rgba(79,163,224,0.35)'; cursor = 'pointer'; textDeco = 'none';
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => clickable && handleSlotClick(slot)}
                style={{ background: bg, color, border, borderRadius: 'var(--radius)', cursor, padding: '8px 12px', fontSize: '.82rem', fontWeight: 600, textDecoration: textDeco, minWidth: 64 }}
              >
                {pad(slot.hour)}:{pad(slot.minute)}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

const arrowBtn = {
  background: 'none', border: 'none', color: 'var(--muted)',
  cursor: 'pointer', fontSize: '1.1rem', padding: '2px 6px',
};
