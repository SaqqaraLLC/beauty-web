'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';
import type { AgentProfile, AgentRosterEntry, AgentRepresentationRequest } from '@/lib/types';

type Tab = 'roster' | 'requests' | 'profile';

export default function AgentDashboard() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [tab,      setTab]      = useState<Tab>('roster');
  const [profile,  setProfile]  = useState<AgentProfile | null>(null);
  const [roster,   setRoster]   = useState<AgentRosterEntry[]>([]);
  const [requests, setRequests] = useState<AgentRepresentationRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState<number | null>(null);

  useEffect(() => {
    if (!userLoading && user?.agentId) {
      Promise.all([
        apiGet(`/api/agents/${user.agentId}`).then(setProfile).catch(() => {}),
        apiGet(`/api/agents/${user.agentId}/roster`).then(setRoster).catch(() => setRoster([])),
        apiGet(`/api/agents/${user.agentId}/representation-requests`).then(setRequests).catch(() => setRequests([])),
      ]).finally(() => setLoading(false));
    }
  }, [user, userLoading]);

  async function respond(req: AgentRepresentationRequest, action: 'accept' | 'decline') {
    setActing(req.requestId);
    try {
      await apiPost(`/api/agents/representation-requests/${req.requestId}/${action}`, {});
      setRequests(prev => prev.filter(r => r.requestId !== req.requestId));
      if (action === 'accept') {
        // refresh roster
        const updated = await apiGet(`/api/agents/${user!.agentId}/roster`).catch(() => roster);
        setRoster(updated);
      }
    } catch { /* silent */ }
    finally  { setActing(null); }
  }

  const pending = requests.filter(r => r.status === 'Pending');

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
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">{profile?.fullName || 'Agent'}</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Agent Dashboard</h1>
            {profile?.agencyName && (
              <p className="text-saqqara-light/35 text-xs mt-1 font-cinzel tracking-[0.08em]">{profile.agencyName}</p>
            )}
            {profile?.isVerified && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-gold"
                style={{ border: '0.5px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.06)' }}>
                ✦ Verified Agent
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Artists on Roster',   value: roster.length },
              { label: 'Pending Requests',     value: pending.length },
              { label: 'Total Requests',       value: requests.length },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className="text-xl font-bold text-saqqara-gold mb-1">{s.value}</div>
                <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-1" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
            {(['roster', 'requests', 'profile'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-3 font-cinzel text-xs tracking-[0.1em] uppercase transition-all duration-200 capitalize"
                style={{
                  color:        tab === t ? '#C9A84C' : 'rgba(237,237,237,0.3)',
                  borderBottom: tab === t ? '0.5px solid #C9A84C' : '0.5px solid transparent',
                  marginBottom: '-0.5px',
                }}>
                {t === 'requests' && pending.length > 0 ? `Requests (${pending.length})` : t}
              </button>
            ))}
          </div>

          {/* ── Roster ── */}
          {tab === 'roster' && (
            <div className="space-y-4">
              <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">
                Artist Roster · {roster.length}
              </h2>
              {roster.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-saqqara-light/30 text-xs mb-4">Your roster is empty</p>
                  <Link href="/artists" className="btn btn-secondary">Browse Artists</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {roster.map(r => (
                    <div key={r.artistId} className="card flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(201,168,76,0.1)' }}>
                          {r.artistProfileImageUrl
                            ? <img src={r.artistProfileImageUrl} alt={r.artistName} className="w-full h-full object-cover" />
                            : <span className="text-base">🎨</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{r.artistName}</p>
                          {r.artistSpecialty && <p className="text-saqqara-gold/50 text-xs truncate">{r.artistSpecialty}</p>}
                          <p className="text-saqqara-light/25 text-[0.6rem] font-cinzel mt-0.5">
                            Since {new Date(r.linkedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <Link href={`/artists/${r.artistId}`} className="btn btn-ghost flex-shrink-0"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.65rem' }}>
                        Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Requests ── */}
          {tab === 'requests' && (
            <div className="space-y-4">
              {pending.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-saqqara-light/30 text-xs">No pending requests</p>
                </div>
              ) : (
                pending.map(req => (
                  <div key={req.requestId} className="card space-y-3">
                    <div>
                      <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{req.artistName}</p>
                      {req.message && (
                        <p className="text-saqqara-light/45 text-xs mt-1 leading-relaxed">{req.message}</p>
                      )}
                      <p className="text-saqqara-light/25 text-[0.6rem] font-cinzel mt-1">
                        Requested {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <button
                        onClick={() => respond(req, 'accept')}
                        disabled={acting === req.requestId}
                        className="btn btn-primary flex-1 disabled:opacity-40"
                      >
                        {acting === req.requestId ? '…' : 'Accept'}
                      </button>
                      <button
                        onClick={() => respond(req, 'decline')}
                        disabled={acting === req.requestId}
                        className="btn btn-ghost flex-1 disabled:opacity-40"
                        style={{ color: 'rgba(239,68,68,0.7)', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Profile ── */}
          {tab === 'profile' && profile && (
            <div className="card max-w-lg mx-auto space-y-4">
              <h2 className="text-sm font-cinzel tracking-[0.1em] mb-4">Agent Profile</h2>
              {[
                ['Full Name',     profile.fullName],
                profile.agencyName ? ['Agency',    profile.agencyName] : null,
                profile.websiteUrl ? ['Website',   profile.websiteUrl]  : null,
                ['Status',         profile.status],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2 text-xs"
                  style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <span className="font-cinzel tracking-[0.08em] text-saqqara-light/35">{k}</span>
                  <span className="text-saqqara-light/65">{v}</span>
                </div>
              ))}
              {profile.bio && (
                <p className="text-xs text-saqqara-light/40 leading-relaxed pt-2">{profile.bio}</p>
              )}
              {profile.specialties && profile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {profile.specialties.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[0.6rem] font-cinzel tracking-[0.06em] text-saqqara-gold/60"
                      style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.15)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
