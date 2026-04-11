'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

interface AssistantProfile {
  assistantId: number;
  artistId: number;
  fullName: string;
  email: string;
  licenseType?: string;
  state?: string;
  licenseStatus: string;
  linkedAt?: string;
}

interface AvailableAssistant {
  artistId: number;
  fullName: string;
  licenseType?: string;
  state?: string;
}

export default function ArtistAssistantPage() {
  const { user } = useCurrentUser();
  const [current,    setCurrent]    = useState<AssistantProfile | null>(null);
  const [available,  setAvailable]  = useState<AvailableAssistant[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [searching,  setSearching]  = useState(false);
  const [assigning,  setAssigning]  = useState(false);
  const [removing,   setRemoving]   = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!user?.artistId) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet(`/api/artists/${user!.artistId}/assistant`);
      setCurrent(data);
    } catch {
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }

  async function searchAssistants() {
    setSearching(true);
    try {
      const data = await apiGet('/api/artists/available-assistants');
      setAvailable(Array.isArray(data) ? data : []);
      setShowSearch(true);
    } catch {
      setAvailable([]);
    } finally {
      setSearching(false);
    }
  }

  async function assign(assistantArtistId: number) {
    setAssigning(true);
    try {
      await apiPost(`/api/artists/${user!.artistId}/assistant`, { assistantArtistId });
      setShowSearch(false);
      await load();
    } catch { /* silent */ }
    finally { setAssigning(false); }
  }

  async function remove() {
    if (!current) return;
    setRemoving(true);
    try {
      await apiDelete(`/api/artists/${user!.artistId}/assistant`);
      setCurrent(null);
    } catch { /* silent */ }
    finally { setRemoving(false); }
  }

  if (loading) {
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
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <p className="script text-saqqara-gold text-2xl">My Assistant</p>
            <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.1em] max-w-sm mx-auto">
              Optionally assign an assistant to your bookings.
              Assistants earn 30% of your service cut — you keep 70%.
            </p>
          </div>

          <div className="royal-divider" />

          {/* Earnings Breakdown */}
          <div className="card space-y-3">
            <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Earnings Breakdown With Assistant</p>
            <div className="space-y-2">
              {[
                { label: 'Client pays',              value: '$100.00', color: 'rgba(237,237,237,0.7)' },
                { label: 'Saqqara platform fee (15%)', value: '− $15.00', color: 'rgba(239,68,68,0.6)' },
                { label: 'Your service cut',          value: '$65.00',  color: '#C9A84C' },
                { label: 'Assistant share (30%)',      value: '− $19.50', color: 'rgba(239,68,68,0.5)' },
                { label: 'You net',                   value: '$45.50',  color: 'rgba(16,185,129,0.9)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-xs py-1.5"
                  style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <span className="font-cinzel tracking-[0.06em] text-saqqara-light/40">{label}</span>
                  <span style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            <p className="text-saqqara-light/20 text-xs">Based on a $100 service example</p>
          </div>

          {/* Current Assistant */}
          {current ? (
            <div className="card space-y-4">
              <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Current Assistant</p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                  <span className="font-cinzel text-saqqara-gold">{current.fullName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{current.fullName}</p>
                  <p className="text-saqqara-light/40 text-xs mt-0.5">
                    {current.licenseType || 'No license type'}{current.state ? ` · ${current.state}` : ''}
                  </p>
                  <p className="text-saqqara-light/25 text-xs mt-0.5">{current.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-cinzel flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.12)', color: 'rgba(16,185,129,0.9)', border: '0.5px solid rgba(16,185,129,0.2)' }}>
                  Active
                </span>
              </div>

              {current.linkedAt && (
                <p className="text-saqqara-light/20 text-xs">
                  Assigned {new Date(current.linkedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowSearch(true)}
                  className="flex-1 py-2 rounded-full text-xs font-cinzel tracking-[0.08em]"
                  style={{ border: '0.5px solid rgba(201,168,76,0.25)', color: 'rgba(201,168,76,0.7)' }}>
                  Change Assistant
                </button>
                <button onClick={remove} disabled={removing}
                  className="flex-1 py-2 rounded-full text-xs font-cinzel tracking-[0.08em] disabled:opacity-40"
                  style={{ border: '0.5px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.6)' }}>
                  {removing ? 'Removing…' : 'Remove Assistant'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center space-y-4 py-8">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">No assistant assigned</p>
              <p className="text-saqqara-light/20 text-xs max-w-xs mx-auto">
                Assistants are artists in the Saqqara license program.
                They support you in sessions and earn 30% of your cut.
              </p>
              <button onClick={searchAssistants} disabled={searching}
                className="btn btn-primary disabled:opacity-40">
                {searching ? 'Searching…' : 'Find an Assistant'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Assistant Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md card space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-cinzel tracking-[0.08em] text-saqqara-light">Available Assistants</p>
              <button onClick={() => setShowSearch(false)} className="text-saqqara-light/30 hover:text-saqqara-light text-lg">×</button>
            </div>

            {available.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-saqqara-light/30 text-xs font-cinzel">No assistants available in your area yet</p>
                <p className="text-saqqara-light/20 text-xs mt-2">Check back as more artists complete licensing</p>
              </div>
            ) : (
              <div className="space-y-2">
                {available.map(a => (
                  <div key={a.artistId} className="flex items-center justify-between gap-3 py-3"
                    style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light truncate">{a.fullName}</p>
                      <p className="text-saqqara-light/35 text-xs mt-0.5">
                        {a.licenseType || 'License in progress'}{a.state ? ` · ${a.state}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => assign(a.artistId)}
                      disabled={assigning}
                      className="px-4 py-1.5 rounded-full text-xs font-cinzel tracking-[0.08em] flex-shrink-0 disabled:opacity-40 transition-all"
                      style={{ background: 'rgba(201,168,76,0.12)', border: '0.5px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                      {assigning ? '…' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
