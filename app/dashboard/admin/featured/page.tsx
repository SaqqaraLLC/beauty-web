'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';
import type { FeaturedSlot } from '@/lib/types';

interface ArtistOption {
  artistId:        number;
  fullName:        string;
  specialty?:      string;
  profileImageUrl?: string;
}

export default function AdminFeaturedPage() {
  const [slots,   setSlots]   = useState<FeaturedSlot[]>([]);
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  const [form, setForm] = useState({ artistId: '', label: '', sortOrder: '0' });

  useEffect(() => {
    Promise.all([
      apiGet('/api/featured-artists').catch(() => []),
      apiGet('/api/artists?pageSize=100').catch(() => []),
    ]).then(([featuredData, artistData]) => {
      setSlots(Array.isArray(featuredData) ? featuredData : []);
      const list = Array.isArray(artistData) ? artistData : artistData.artists ?? [];
      setArtists(list);
    }).finally(() => setLoading(false));
  }, []);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const created: FeaturedSlot = await apiPost('/api/featured-artists', {
        artistId:  Number(form.artistId),
        label:     form.label || undefined,
        sortOrder: Number(form.sortOrder),
      });
      setSlots(prev => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setForm({ artistId: '', label: '', sortOrder: '0' });
    } catch { /* silent */ }
    finally  { setAdding(false); }
  }

  async function removeSlot(slotId: number) {
    setRemoving(slotId);
    try {
      await apiPost(`/api/featured-artists/${slotId}/remove`, {});
      setSlots(prev => prev.filter(s => s.slotId !== slotId));
    } catch { /* silent */ }
    finally  { setRemoving(null); }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">Featured</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Featured Artists Management</h1>
            <p className="text-saqqara-light/35 text-xs mt-2">Control which artists appear in the featured row on the homepage and directory</p>
          </div>

          {/* Add form */}
          <form onSubmit={addSlot} className="card space-y-4">
            <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Add Featured Slot</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label>Artist</label>
                <select value={form.artistId} onChange={e => setForm(p => ({ ...p, artistId: e.target.value }))} required>
                  <option value="">Select artist</option>
                  {artists.map(a => (
                    <option key={a.artistId} value={a.artistId}>{a.fullName}{a.specialty ? ` · ${a.specialty}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Label <span className="text-saqqara-light/25">(e.g. "Featured")</span></label>
                <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Featured" />
              </div>
              <div>
                <label>Sort Order</label>
                <input type="number" min="0" value={form.sortOrder}
                  onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={adding} className="btn btn-primary disabled:opacity-40">
                {adding ? 'Adding…' : '+ Add to Featured'}
              </button>
            </div>
          </form>

          {/* Current slots */}
          <div className="space-y-3">
            <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">
              Current Featured · {slots.length}
            </h2>

            {loading ? (
              <div className="card text-center py-10">
                <p className="text-saqqara-light/30 text-xs font-cinzel">Loading…</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-saqqara-light/30 text-xs">No featured artists yet</p>
              </div>
            ) : (
              slots.map(slot => (
                <div key={slot.slotId} className="card flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.15)' }}>
                      {slot.profileImageUrl
                        ? <img src={slot.profileImageUrl} alt={slot.artistName} className="w-full h-full object-cover" />
                        : <span className="text-base">🎨</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{slot.artistName}</p>
                      {slot.specialty && <p className="text-saqqara-gold/50 text-xs truncate">{slot.specialty}</p>}
                      {slot.label && (
                        <span className="text-[0.6rem] font-cinzel text-saqqara-gold/40">
                          {slot.label} · #{slot.sortOrder}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSlot(slot.slotId)}
                    disabled={removing === slot.slotId}
                    className="btn btn-ghost flex-shrink-0 disabled:opacity-40"
                    style={{ color: 'rgba(239,68,68,0.6)', borderColor: 'rgba(239,68,68,0.15)', fontSize: '0.65rem', padding: '0.25rem 0.6rem' }}
                  >
                    {removing === slot.slotId ? '…' : 'Remove'}
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
