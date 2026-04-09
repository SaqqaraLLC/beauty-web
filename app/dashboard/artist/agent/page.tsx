'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';
import type { AgentProfile } from '@/lib/types';

export default function ArtistAgentPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [myAgent,   setMyAgent]   = useState<AgentProfile | null>(null);
  const [requested, setRequested] = useState(false);
  const [agents,    setAgents]    = useState<AgentProfile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [message,   setMessage]   = useState('');
  const [sending,   setSending]   = useState<number | null>(null);
  const [sent,      setSent]      = useState<number[]>([]);

  useEffect(() => {
    if (!userLoading && user?.artistId) {
      Promise.all([
        apiGet(`/api/artists/${user.artistId}/agent`).then(setMyAgent).catch(() => {}),
        apiGet('/api/agents').then(d => setAgents(Array.isArray(d) ? d : d.agents ?? [])).catch(() => setAgents([])),
      ]).finally(() => setLoading(false));
    }
  }, [user, userLoading]);

  async function requestRepresentation(agentId: number) {
    setSending(agentId);
    try {
      await apiPost('/api/agents/representation-requests', { agentId, artistId: user!.artistId, message });
      setSent(prev => [...prev, agentId]);
    } catch { /* silent */ }
    finally  { setSending(null); }
  }

  async function leaveAgent() {
    if (!myAgent || !user?.artistId) return;
    try {
      await apiPost(`/api/artists/${user.artistId}/agent/leave`, {});
      setMyAgent(null);
    } catch { /* silent */ }
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
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-1">
            <p className="script text-saqqara-gold text-2xl">Representation</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">My Agent</h1>
            <p className="text-saqqara-light/35 text-xs">Agents help manage your bookings and expand your reach</p>
          </div>

          {/* Current agent */}
          {myAgent ? (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/40 uppercase">Your Current Agent</p>
                <button onClick={leaveAgent}
                  className="text-[0.6rem] font-cinzel text-red-400/50 hover:text-red-400 transition-colors">
                  Leave
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                  <span className="font-cinzel text-sm text-saqqara-gold">{myAgent.fullName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{myAgent.fullName}</p>
                  {myAgent.agencyName && <p className="text-saqqara-gold/55 text-xs">{myAgent.agencyName}</p>}
                </div>
                <Link href={`/agents/${myAgent.agentId}`} className="btn btn-ghost flex-shrink-0">
                  View Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8 space-y-2">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">You are not currently represented by an agent</p>
              <p className="text-saqqara-light/20 text-xs">Browse below to send a representation request</p>
            </div>
          )}

          {/* Request message */}
          {!myAgent && (
            <div>
              <label>Add a Message <span className="text-saqqara-light/25">(optional — sent with each request)</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="Briefly introduce yourself…"
                className="resize-none"
                style={{ borderRadius: '1rem' }}
              />
            </div>
          )}

          {/* Agent grid */}
          {!myAgent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Available Agents</h2>
                <Link href="/agents" className="text-xs text-saqqara-gold/60 font-cinzel hover:text-saqqara-gold transition-colors">
                  Browse All →
                </Link>
              </div>

              {agents.length === 0 ? (
                <div className="card text-center py-10">
                  <p className="text-saqqara-light/30 text-xs">No agents available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map(a => {
                    const alreadySent = sent.includes(a.agentId);
                    return (
                      <div key={a.agentId} className="card flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.15)' }}>
                            <span className="font-cinzel text-xs text-saqqara-gold">{a.fullName.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{a.fullName}</p>
                            {a.agencyName && <p className="text-saqqara-gold/50 text-xs truncate">{a.agencyName}</p>}
                            {a.specialties && a.specialties.length > 0 && (
                              <p className="text-saqqara-light/25 text-[0.6rem] truncate">{a.specialties.slice(0, 2).join(', ')}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/agents/${a.agentId}`} className="btn btn-ghost"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.65rem' }}>
                            View
                          </Link>
                          <button
                            onClick={() => requestRepresentation(a.agentId)}
                            disabled={alreadySent || sending === a.agentId}
                            className="btn btn-primary disabled:opacity-50"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.65rem' }}
                          >
                            {alreadySent ? 'Sent ✓' : sending === a.agentId ? '…' : 'Request'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
