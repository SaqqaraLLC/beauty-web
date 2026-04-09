'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import AgentProfileCard from '@/components/agent/AgentProfileCard';
import { apiGet } from '@/lib/api';
import type { AgentProfile } from '@/lib/types';

export default function AgentDirectoryPage() {
  const [agents,  setAgents]  = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [specialty, setSpecialty] = useState('');

  const SPECIALTIES = [
    'Hair Styling', 'Makeup Artistry', 'Nail Artistry', 'Esthetics & Skincare',
    'Massage & Bodywork', 'Hair Extensions', 'Cosmetology', 'Holistic Wellness', 'Multi-Specialty',
  ];

  useEffect(() => { load(); }, []);

  async function load(q = search, s = specialty) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('search', q);
      if (s)        params.set('specialty', s);
      const data = await apiGet(`/api/agents?${params}`);
      setAgents(Array.isArray(data) ? data : data.agents ?? []);
    } catch { setAgents([]); }
    finally  { setLoading(false); }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  function pickSpecialty(s: string) {
    const next = specialty === s ? '' : s;
    setSpecialty(next);
    load(search, next);
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <p className="script text-saqqara-gold text-3xl">Agents</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Find a Talent Agent</h1>
            <p className="text-saqqara-light/35 text-xs max-w-sm mx-auto leading-relaxed">
              Connect with professional agents who represent Saqqara's top artists
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or agency…"
              className="flex-1"
            />
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>

          {/* Specialty filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SPECIALTIES.map(s => (
              <button
                key={s} type="button"
                onClick={() => pickSpecialty(s)}
                className="px-3 py-1.5 rounded-full text-xs font-cinzel tracking-[0.06em] transition-all duration-200"
                style={{
                  border:     specialty === s ? '0.5px solid rgba(201,168,76,0.55)' : '0.5px solid rgba(255,255,255,0.07)',
                  background: specialty === s ? 'rgba(201,168,76,0.08)' : 'transparent',
                  color:      specialty === s ? '#C9A84C' : 'rgba(237,237,237,0.3)',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading agents…</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-saqqara-light/30 text-xs">No agents found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(a => <AgentProfileCard key={a.agentId} agent={a} />)}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
