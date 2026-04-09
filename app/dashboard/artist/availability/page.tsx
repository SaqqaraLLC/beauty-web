'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';
import type { AvailabilityBlock } from '@/lib/types';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type BlockMap = Record<string, 'available' | 'unavailable'>;

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function AvailabilityPage() {
  const { user, isLoading: userLoading } = useCurrentUser();

  const today    = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [blocks,  setBlocks]  = useState<AvailabilityBlock[]>([]);
  const [map,     setMap]     = useState<BlockMap>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [dirty,   setDirty]   = useState<BlockMap>({});   // pending changes

  useEffect(() => {
    if (!userLoading && user?.artistId) {
      const from = toKey(year, month, 1);
      const end  = new Date(year, month + 1, 0);
      const to   = toKey(year, month, end.getDate());

      apiGet(`/api/artists/${user.artistId}/availability?from=${from}&to=${to}`)
        .then((data: AvailabilityBlock[]) => {
          setBlocks(data);
          const m: BlockMap = {};
          data.forEach(b => {
            const start = new Date(b.startDate);
            const stop  = new Date(b.endDate);
            for (let d = new Date(start); d <= stop; d.setDate(d.getDate() + 1)) {
              m[toKey(d.getFullYear(), d.getMonth(), d.getDate())] = b.isAvailable ? 'available' : 'unavailable';
            }
          });
          setMap(m);
          setDirty({});
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, userLoading, year, month]);

  function toggleDay(key: string) {
    const current = dirty[key] ?? map[key];
    const next = current === 'available' ? 'unavailable' : 'available';
    setDirty(prev => ({ ...prev, [key]: next }));
  }

  async function save() {
    if (!user?.artistId || Object.keys(dirty).length === 0) return;
    setSaving(true);
    try {
      // Group consecutive same-status days into blocks
      const entries = Object.entries(dirty).sort(([a], [b]) => a.localeCompare(b));
      const apiBlocks = entries.map(([date, status]) => ({
        startDate:   date,
        endDate:     date,
        isAvailable: status === 'available',
        note:        '',
      }));
      await apiPost(`/api/artists/${user.artistId}/availability`, { blocks: apiBlocks });
      // Merge dirty into map
      setMap(prev => ({ ...prev, ...dirty }));
      setDirty({});
    } catch { /* silent */ }
    finally  { setSaving(false); }
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else             { setMonth(m => m - 1); }
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else              { setMonth(m => m + 1); }
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  if (userLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <div className="text-center space-y-1">
            <p className="script text-saqqara-gold text-2xl">My Calendar</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Availability</h1>
            <p className="text-saqqara-light/35 text-xs">Tap days to mark your availability for companies and clients</p>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-5">
            {[
              { color: 'rgba(16,185,129,0.25)',  label: 'Available' },
              { color: 'rgba(239,68,68,0.15)',   label: 'Unavailable' },
              { color: 'rgba(201,168,76,0.08)',  label: 'Not set' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: color, border: '0.5px solid rgba(255,255,255,0.08)' }} />
                <span className="text-saqqara-light/35 text-[0.6rem] font-cinzel">{label}</span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="card">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button type="button" onClick={prevMonth} className="btn btn-ghost" style={{ padding: '0.25rem 0.6rem' }}>←</button>
              <p className="font-cinzel text-sm tracking-[0.1em]">{MONTHS[month]} {year}</p>
              <button type="button" onClick={nextMonth} className="btn btn-ghost" style={{ padding: '0.25rem 0.6rem' }}>→</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[0.6rem] font-cinzel tracking-[0.08em] text-saqqara-light/25 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const key     = toKey(year, month, day);
                const status  = dirty[key] ?? map[key];
                const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

                const bg =
                  status === 'available'   ? 'rgba(16,185,129,0.25)'  :
                  status === 'unavailable' ? 'rgba(239,68,68,0.15)'   :
                  'rgba(201,168,76,0.04)';

                const border =
                  isToday                            ? '0.5px solid #C9A84C' :
                  dirty[key]                         ? '0.5px solid rgba(255,255,255,0.15)' :
                  status === 'available'             ? '0.5px solid rgba(16,185,129,0.3)'   :
                  status === 'unavailable'           ? '0.5px solid rgba(239,68,68,0.2)'    :
                  '0.5px solid rgba(255,255,255,0.04)';

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className="aspect-square rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105"
                    style={{ background: bg, border }}
                  >
                    <span className="font-cinzel text-xs" style={{ color: isToday ? '#C9A84C' : 'rgba(237,237,237,0.6)' }}>
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          {Object.keys(dirty).length > 0 && (
            <div className="flex items-center justify-between card">
              <p className="text-xs text-saqqara-light/40 font-cinzel">
                {Object.keys(dirty).length} day{Object.keys(dirty).length > 1 ? 's' : ''} changed
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setDirty({})} className="btn btn-ghost text-xs">
                  Discard
                </button>
                <button type="button" onClick={save} disabled={saving} className="btn btn-primary text-xs disabled:opacity-40">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
