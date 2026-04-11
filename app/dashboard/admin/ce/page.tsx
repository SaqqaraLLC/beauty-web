'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';
import { STATE_CE_REQUIREMENTS } from '@/lib/data/stateceRequirements';

interface ArtistCeRecord {
  artistId: string;
  artistName: string;
  email?: string;
  state: string;
  stateCode: string;
  licenseType: string;
  hoursCompleted: number;
  hoursRequired: number;
  renewalDeadline?: string;
  isCompliant: boolean;
  pendingVerifications: number;
  entries: CeEntry[];
}

interface CeEntry {
  id: string;
  courseName: string;
  provider: string;
  topic: string;
  hours: number;
  dateCompleted: string;
  verified: boolean;
}

const LICENSE_TYPES = ['All', 'Cosmetology', 'Esthetics', 'Nail Tech'];

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, pct)}%`,
          background: pct >= 100
            ? 'linear-gradient(90deg, rgba(52,211,153,0.7), rgba(52,211,153,1))'
            : 'linear-gradient(90deg, rgba(201,168,76,0.7), rgba(201,168,76,1))',
        }}
      />
    </div>
  );
}

export default function AdminCEPage() {
  const [records, setRecords] = useState<ArtistCeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('All');
  const [licenseFilter, setLicenseFilter] = useState('All');
  const [refOpen, setRefOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  useEffect(() => {
    apiGet('/api/admin/ce')
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleVerifyEntry(entryId: string, artistId: string) {
    setVerifyingId(entryId);
    try {
      await apiPost(`/api/admin/ce/${entryId}/verify`);
      setRecords(prev => prev.map(r => {
        if (r.artistId !== artistId) return r;
        return {
          ...r,
          pendingVerifications: Math.max(0, r.pendingVerifications - 1),
          entries: r.entries.map(e => e.id === entryId ? { ...e, verified: true } : e),
        };
      }));
    } catch {
      // silent
    } finally {
      setVerifyingId(null);
    }
  }

  const uniqueStates = ['All', ...Array.from(new Set(records.map(r => r.state))).sort()];

  const filtered = records.filter(r => {
    const stateMatch   = stateFilter  === 'All' || r.state === stateFilter;
    const licenseMatch = licenseFilter === 'All' || r.licenseType === licenseFilter;
    return stateMatch && licenseMatch;
  });

  const totalTracked    = filtered.length;
  const compliant       = filtered.filter(r => r.isCompliant).length;
  const nonCompliant    = filtered.filter(r => !r.isCompliant).length;
  const pendingVerif    = filtered.reduce((sum, r) => sum + r.pendingVerifications, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs font-cinzel tracking-[0.18em] text-saqqara-gold/60 uppercase mb-1">Admin</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em] text-saqqara-light">CE Oversight</h1>
            <p className="text-saqqara-light/30 text-xs mt-1">Monitor artist continuing education compliance across all states.</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tracked',           value: totalTracked, color: 'text-saqqara-light' },
              { label: 'Compliant',         value: compliant,    color: 'text-emerald-400' },
              { label: 'Non-Compliant',     value: nonCompliant, color: 'text-red-400' },
              { label: 'Pending Verif.',    value: pendingVerif, color: 'text-saqqara-gold' },
            ].map(s => (
              <div key={s.label} className="card text-center" style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="bg-black/40 text-saqqara-light text-xs font-cinzel tracking-[0.08em] px-3 py-2 rounded-lg outline-none"
              style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
            >
              {uniqueStates.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
            </select>

            <select
              value={licenseFilter}
              onChange={e => setLicenseFilter(e.target.value)}
              className="bg-black/40 text-saqqara-light text-xs font-cinzel tracking-[0.08em] px-3 py-2 rounded-lg outline-none"
              style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
            >
              {LICENSE_TYPES.map(l => <option key={l} value={l}>{l === 'All' ? 'All License Types' : l}</option>)}
            </select>
          </div>

          {/* Artist CE Cards */}
          {loading ? (
            <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-12">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-12">No records match the current filters.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map(record => {
                const pct = record.hoursRequired > 0
                  ? (record.hoursCompleted / record.hoursRequired) * 100
                  : 100;
                const isExpanded = expandedArtist === record.artistId;

                return (
                  <div key={record.artistId} className="card space-y-4" style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                    {/* Row top */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">{record.artistName}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-gold/50"
                            style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
                            {record.state}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-light/30"
                            style={{ border: '0.5px solid rgba(255,255,255,0.07)' }}>
                            {record.licenseType}
                          </span>
                          <span className={`text-xs font-bold ${record.isCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
                            {record.isCompliant ? '✓ Compliant' : '✗ Non-Compliant'}
                          </span>
                          {record.pendingVerifications > 0 && (
                            <span className="text-xs text-saqqara-gold font-cinzel">
                              {record.pendingVerifications} pending
                            </span>
                          )}
                        </div>

                        {record.email && (
                          <p className="text-xs text-saqqara-light/30">{record.email}</p>
                        )}

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-saqqara-light/40">
                            <span>{record.hoursCompleted} / {record.hoursRequired} hrs</span>
                            {record.renewalDeadline && (
                              <span>Renews {new Date(record.renewalDeadline).toLocaleDateString()}</span>
                            )}
                          </div>
                          <ProgressBar pct={pct} />
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedArtist(isExpanded ? null : record.artistId)}
                        className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 hover:text-saqqara-gold transition-colors px-3 py-1.5 rounded-lg shrink-0"
                        style={{ border: '0.5px solid rgba(201,168,76,0.1)' }}>
                        {isExpanded ? 'Collapse' : 'View Entries'}
                      </button>
                    </div>

                    {/* Expanded Entries */}
                    {isExpanded && record.entries.length > 0 && (
                      <div className="overflow-x-auto" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', paddingTop: '1rem' }}>
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              {['Date', 'Course', 'Provider', 'Topic', 'Hrs', 'Status', ''].map(col => (
                                <th key={col} className="text-left py-1.5 px-2 font-cinzel tracking-[0.06em] text-saqqara-light/25 text-[0.6rem] uppercase">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {record.entries.map(entry => (
                              <tr key={entry.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.03)' }}>
                                <td className="py-2 px-2 text-saqqara-light/50">{new Date(entry.dateCompleted).toLocaleDateString()}</td>
                                <td className="py-2 px-2 text-saqqara-light">{entry.courseName}</td>
                                <td className="py-2 px-2 text-saqqara-light/50">{entry.provider}</td>
                                <td className="py-2 px-2 text-saqqara-light/50">{entry.topic}</td>
                                <td className="py-2 px-2 text-saqqara-gold font-bold">{entry.hours}</td>
                                <td className="py-2 px-2">
                                  {entry.verified
                                    ? <span className="text-emerald-400">✓ Verified</span>
                                    : <span className="text-saqqara-light/30">Pending</span>}
                                </td>
                                <td className="py-2 px-2">
                                  {!entry.verified && (
                                    <button
                                      onClick={() => handleVerifyEntry(entry.id, record.artistId)}
                                      disabled={verifyingId === entry.id}
                                      className="text-xs font-cinzel tracking-[0.06em] text-saqqara-gold/60 hover:text-saqqara-gold transition-colors px-2 py-0.5 rounded"
                                      style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
                                      {verifyingId === entry.id ? '…' : 'Verify'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {isExpanded && record.entries.length === 0 && (
                      <p className="text-xs text-saqqara-light/20 font-cinzel text-center py-3"
                        style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                        No CE entries logged yet.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* State Requirements Reference — Collapsible */}
          <div className="card" style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
            <button
              onClick={() => setRefOpen(v => !v)}
              className="w-full flex items-center justify-between text-left">
              <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">State CE Requirements Reference</p>
              <span className="text-saqqara-gold/40 text-xs font-cinzel">{refOpen ? '▲ Collapse' : '▼ Expand'}</span>
            </button>

            {refOpen && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '0.5px solid rgba(201,168,76,0.1)' }}>
                      {['State', 'Code', 'Hrs Required', 'Renewal', 'Mandatory Topics', 'Notes'].map(col => (
                        <th key={col} className="text-left py-2 px-3 font-cinzel tracking-[0.06em] text-saqqara-light/25 text-[0.6rem] uppercase">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STATE_CE_REQUIREMENTS.map(req => (
                      <tr key={req.stateCode} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.025)' }}>
                        <td className="py-2 px-3 text-saqqara-light/70">{req.state}</td>
                        <td className="py-2 px-3 text-saqqara-light/40">{req.stateCode}</td>
                        <td className="py-2 px-3 text-saqqara-gold font-bold">{req.hoursRequired > 0 ? req.hoursRequired : '—'}</td>
                        <td className="py-2 px-3 text-saqqara-light/50">
                          {req.renewalPeriodMonths >= 12
                            ? `${req.renewalPeriodMonths / 12}yr`
                            : `${req.renewalPeriodMonths}mo`}
                        </td>
                        <td className="py-2 px-3 text-saqqara-light/40">
                          {req.mandatoryTopics.length > 0
                            ? req.mandatoryTopics.map(t => `${t.topic} (${t.hours}h)`).join(', ')
                            : '—'}
                        </td>
                        <td className="py-2 px-3 text-saqqara-light/30 max-w-[200px]">{req.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
