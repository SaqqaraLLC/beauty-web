'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPut } from '@/lib/api';
import Navbar from '@/components/Navbar';

type TravelMode = 'nationwide' | 'miles' | 'none';

interface TravelData {
  travelNationwide: boolean | null;
  travelMaxMiles:   number | null;
}

export default function ArtistTravelPage() {
  const { user, isLoading: userLoading } = useCurrentUser();

  const [mode,       setMode]       = useState<TravelMode>('none');
  const [miles,      setMiles]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && user?.artistId) {
      apiGet(`/api/artists/${user.artistId}/travel`)
        .then((data: TravelData) => {
          if (data.travelNationwide) {
            setMode('nationwide');
          } else if (data.travelMaxMiles != null) {
            setMode('miles');
            setMiles(String(data.travelMaxMiles));
          } else {
            setMode('none');
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, userLoading]);

  async function handleSave() {
    if (!user?.artistId) return;
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      const maxMiles = mode === 'miles' ? parseInt(miles, 10) : null;

      if (mode === 'miles') {
        if (!miles || isNaN(maxMiles!) || maxMiles! < 1 || maxMiles! > 5000) {
          setError('Enter a number between 1 and 5000 miles.');
          return;
        }
      }

      await apiPut(`/api/artists/${user.artistId}/travel`, {
        travelNationwide: mode === 'nationwide' ? true : false,
        maxMiles:         mode === 'miles' ? maxMiles : null,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

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
        <div className="max-w-md mx-auto space-y-6">

          <Link href="/dashboard/artist" className="text-xs font-cinzel text-saqqara-light/35 hover:text-saqqara-gold transition-colors">
            ← Back to Dashboard
          </Link>

          <div className="card space-y-6">
            <div>
              <p className="script text-saqqara-gold text-xl mb-1">Travel Preferences</p>
              <p className="text-xs text-saqqara-light/40 font-cinzel tracking-[0.06em]">
                Let clients and companies know how far you're willing to travel for bookings.
              </p>
            </div>

            {/* Option: Nationwide */}
            <button
              type="button"
              onClick={() => setMode('nationwide')}
              className="w-full text-left rounded p-4 transition-all duration-150"
              style={{
                border: mode === 'nationwide'
                  ? '1px solid rgba(201,168,76,0.6)'
                  : '0.5px solid rgba(255,255,255,0.08)',
                background: mode === 'nationwide'
                  ? 'rgba(201,168,76,0.06)'
                  : 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{mode === 'nationwide' ? '◉' : '○'}</span>
                <div>
                  <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">All USA</p>
                  <p className="text-xs text-saqqara-light/35 mt-0.5">I'm willing to travel anywhere in the United States</p>
                </div>
              </div>
            </button>

            {/* Option: Max Miles */}
            <button
              type="button"
              onClick={() => setMode('miles')}
              className="w-full text-left rounded p-4 transition-all duration-150"
              style={{
                border: mode === 'miles'
                  ? '1px solid rgba(201,168,76,0.6)'
                  : '0.5px solid rgba(255,255,255,0.08)',
                background: mode === 'miles'
                  ? 'rgba(201,168,76,0.06)'
                  : 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{mode === 'miles' ? '◉' : '○'}</span>
                <div className="flex-1">
                  <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">Max Miles</p>
                  <p className="text-xs text-saqqara-light/35 mt-0.5">I'll travel up to a set distance from my location</p>
                </div>
              </div>

              {mode === 'miles' && (
                <div className="mt-4 flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    placeholder="e.g. 50"
                    value={miles}
                    onChange={e => setMiles(e.target.value)}
                    className="input w-28 font-mono text-center"
                    autoFocus
                  />
                  <span className="text-xs font-cinzel text-saqqara-light/50 tracking-[0.06em]">miles</span>
                </div>
              )}
            </button>

            {/* Option: Not set */}
            <button
              type="button"
              onClick={() => setMode('none')}
              className="w-full text-left rounded p-4 transition-all duration-150"
              style={{
                border: mode === 'none'
                  ? '1px solid rgba(201,168,76,0.6)'
                  : '0.5px solid rgba(255,255,255,0.08)',
                background: mode === 'none'
                  ? 'rgba(201,168,76,0.06)'
                  : 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{mode === 'none' ? '◉' : '○'}</span>
                <div>
                  <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">Not specified</p>
                  <p className="text-xs text-saqqara-light/35 mt-0.5">I prefer to discuss travel on a per-booking basis</p>
                </div>
              </div>
            </button>

            {error && (
              <p className="text-red-400 text-xs font-cinzel py-2 px-3 rounded"
                style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            {saved && (
              <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-gold/80 text-center">
                Travel preferences saved.
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary w-full"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
