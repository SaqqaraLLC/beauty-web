'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

type CycleStatus = 'PendingReview' | 'Approved' | 'Disbursed' | 'Voided';
type LineStatus  = 'Pending' | 'Approved' | 'Disbursed' | 'Held';

interface PayoutLine {
  id: number;
  providerUserId: string;
  providerName?: string;
  providerEmail?: string;
  providerRole: string;
  amountCents: number;
  status: LineStatus;
  description?: string;
  notes?: string;
  bookingId?: number;
  invoiceId?: number;
}

interface PayoutCycle {
  id: number;
  periodStart: string;
  periodEnd: string;
  status: CycleStatus;
  totalProviderAmountCents: number;
  totalPlatformAmountCents: number;
  totalInvoiceAmountCents: number;
  approvedByEmail?: string;
  approvedAt?: string;
  disbursedAt?: string;
  createdAt: string;
  providerCount?: number;
  lines?: PayoutLine[];
}

interface Summary {
  pendingCycles: number;
  approvedCycles: number;
  pendingAmountCents: number;
  lastDisbursed?: { id: number; disbursedAt: string; totalProviderAmountCents: number; totalPlatformAmountCents: number };
  suggestedNextPeriod: { start: string; end: string };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt  = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const fmtD = (iso: string)   => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_STYLE: Record<CycleStatus, { label: string; color: string; dot: string }> = {
  PendingReview: { label: 'Pending Review', color: 'rgba(245,158,11,0.15)', dot: '#F59E0B' },
  Approved:      { label: 'Approved',       color: 'rgba(59,130,246,0.15)', dot: '#3B82F6' },
  Disbursed:     { label: 'Disbursed',      color: 'rgba(16,185,129,0.15)', dot: '#10B981' },
  Voided:        { label: 'Voided',         color: 'rgba(100,100,100,0.1)', dot: '#666'    },
};

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PayoutDashboard() {
  const [summary,    setSummary]    = useState<Summary | null>(null);
  const [cycles,     setCycles]     = useState<PayoutCycle[]>([]);
  const [selected,   setSelected]   = useState<PayoutCycle | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [actionMsg,  setActionMsg]  = useState<string | null>(null);
  const [showGen,    setShowGen]    = useState(false);
  const [holdIds,    setHoldIds]    = useState<string[]>([]);

  // Generate form state
  const [genStart, setGenStart] = useState('');
  const [genEnd,   setGenEnd]   = useState('');
  const [genNote,  setGenNote]  = useState('');
  const [genBusy,  setGenBusy]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        apiGet('/api/payouts/summary'),
        apiGet('/api/payouts/cycles'),
      ]);
      setSummary(s);
      setCycles(c);

      // Pre-fill suggested dates
      if (s?.suggestedNextPeriod) {
        setGenStart(s.suggestedNextPeriod.start.slice(0, 10));
        setGenEnd(s.suggestedNextPeriod.end.slice(0, 10));
      }
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openCycle(id: number) {
    const full = await apiGet(`/api/payouts/cycles/${id}`);
    setSelected(full);
    setHoldIds([]);
  }

  async function generate() {
    setGenBusy(true);
    setActionMsg(null);
    try {
      const res = await apiPost('/api/payouts/cycles/generate', {
        periodStart: new Date(genStart).toISOString(),
        periodEnd:   new Date(genEnd).toISOString(),
        notes: genNote || null,
      });
      setActionMsg(`✓ Cycle generated — ${res.providerCount} providers, ${fmt(res.totalProviderCents)} total`);
      setShowGen(false);
      await load();
    } catch (e: unknown) {
      setActionMsg(`Error: ${e instanceof Error ? e.message : 'Failed to generate cycle'}`);
    } finally { setGenBusy(false); }
  }

  async function approve(cycleId: number) {
    setActionMsg(null);
    try {
      await apiPost(`/api/payouts/cycles/${cycleId}/approve`, {
        notes: null,
        holdProviderIds: holdIds.length ? holdIds : null,
        holdReason: holdIds.length ? 'Held by admin for review' : null,
      });
      setActionMsg('✓ Cycle approved — ready to disburse');
      setSelected(null);
      await load();
    } catch (e: unknown) {
      setActionMsg(`Error: ${e instanceof Error ? e.message : 'Approval failed'}`);
    }
  }

  async function disburse(cycleId: number) {
    if (!confirm('Confirm: physical bank transfers have been completed for all approved providers?')) return;
    setActionMsg(null);
    try {
      await apiPost(`/api/payouts/cycles/${cycleId}/disburse`, { notes: null });
      setActionMsg('✓ Cycle marked as Disbursed');
      setSelected(null);
      await load();
    } catch (e: unknown) {
      setActionMsg(`Error: ${e instanceof Error ? e.message : 'Disburse failed'}`);
    }
  }

  async function voidCycle(cycleId: number) {
    if (!confirm('Void this cycle? This cannot be undone.')) return;
    try {
      await apiPost(`/api/payouts/cycles/${cycleId}/void`, {});
      setActionMsg('Cycle voided.');
      setSelected(null);
      await load();
    } catch { /* ignore */ }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
        <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading payouts…</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="script text-saqqara-gold text-2xl mb-1">Payout Management</p>
              <h1 className="text-xl font-cinzel tracking-[0.1em]">Provider Disbursements</h1>
            </div>
            <Link href="/dashboard/admin" className="btn btn-ghost text-xs">← Admin</Link>
          </div>

          {/* Action message */}
          {actionMsg && (
            <div className="px-4 py-3 rounded text-sm font-cinzel tracking-[0.06em]"
              style={{
                background: actionMsg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `0.5px solid ${actionMsg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: actionMsg.startsWith('✓') ? '#10B981' : '#F87171'
              }}>
              {actionMsg}
            </div>
          )}

          {/* Summary Stats */}
          {summary && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Pending Review',     value: summary.pendingCycles,                      sub: 'cycles' },
                { label: 'Approved / Ready',   value: summary.approvedCycles,                     sub: 'to disburse' },
                { label: 'Awaiting Payout',    value: fmt(summary.pendingAmountCents),             sub: 'provider total' },
                { label: 'Last Disbursement',  value: summary.lastDisbursed ? fmt(summary.lastDisbursed.totalProviderAmountCents) : '—', sub: summary.lastDisbursed ? fmtD(summary.lastDisbursed.disbursedAt!) : 'none yet' },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <div className="text-xl font-bold text-saqqara-gold mb-1">{s.value}</div>
                  <p className="text-saqqara-light/50 text-xs font-cinzel tracking-[0.06em]">{s.label}</p>
                  <p className="text-saqqara-light/25 text-xs mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Generate button */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-cinzel tracking-[0.1em]">Payout Cycles</h2>
            <button onClick={() => setShowGen(v => !v)} className="btn btn-primary">
              + Generate Cycle
            </button>
          </div>

          {/* Generate form */}
          {showGen && (
            <div className="card space-y-4">
              <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/50 uppercase">New Payout Cycle</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">Period Start</label>
                  <input type="date" className="input w-full" value={genStart} onChange={e => setGenStart(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">Period End</label>
                  <input type="date" className="input w-full" value={genEnd} onChange={e => setGenEnd(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">Notes (optional)</label>
                <input type="text" className="input w-full" placeholder="Bi-weekly cycle April 7–20" value={genNote} onChange={e => setGenNote(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={generate} disabled={genBusy || !genStart || !genEnd} className="btn btn-primary">
                  {genBusy ? 'Calculating…' : 'Generate'}
                </button>
                <button onClick={() => setShowGen(false)} className="btn btn-ghost">Cancel</button>
              </div>
              <p className="text-xs text-saqqara-light/25">
                This will calculate all provider earnings from paid invoices in the selected period.
              </p>
            </div>
          )}

          {/* Cycles list */}
          {cycles.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-saqqara-light/30 text-xs mb-3">No payout cycles yet</p>
              <p className="text-saqqara-light/20 text-xs">Generate your first cycle once invoices are paid.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cycles.map(cycle => {
                const st = STATUS_STYLE[cycle.status];
                return (
                  <div key={cycle.id} className="card">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, display: 'inline-block', flexShrink: 0 }} />
                        <div className="min-w-0">
                          <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">
                            {fmtD(cycle.periodStart)} – {fmtD(cycle.periodEnd)}
                          </p>
                          <p className="text-saqqara-light/35 text-xs mt-0.5">
                            {cycle.providerCount ?? '?'} providers · {fmt(cycle.totalProviderAmountCents)} to pay · {fmt(cycle.totalPlatformAmountCents)} platform margin
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-xs font-cinzel"
                          style={{ background: st.color, color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                          {st.label}
                        </span>
                        <button onClick={() => openCycle(cycle.id)} className="btn btn-ghost text-xs">
                          Review →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cycle detail modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
              <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-cinzel text-sm tracking-[0.1em]">
                      {fmtD(selected.periodStart)} – {fmtD(selected.periodEnd)}
                    </p>
                    <p className="text-saqqara-light/40 text-xs mt-1">
                      Status: <span className="text-saqqara-gold">{STATUS_STYLE[selected.status].label}</span>
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-saqqara-light/30 hover:text-saqqara-light text-xl leading-none">×</button>
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Invoices Collected', value: fmt(selected.totalInvoiceAmountCents) },
                    { label: 'Provider Total',      value: fmt(selected.totalProviderAmountCents), gold: true },
                    { label: 'Platform Margin',     value: fmt(selected.totalPlatformAmountCents) },
                  ].map(s => (
                    <div key={s.label} className="text-center py-3 rounded"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                      <p className={`text-sm font-bold ${s.gold ? 'text-saqqara-gold' : 'text-saqqara-light'}`}>{s.value}</p>
                      <p className="text-saqqara-light/30 text-xs mt-0.5 font-cinzel">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Provider lines */}
                <div>
                  <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/40 uppercase mb-3">Provider Breakdown</p>
                  <div className="space-y-2">
                    {(selected.lines ?? []).map(line => {
                      const held = holdIds.includes(line.providerUserId);
                      return (
                        <div key={line.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded"
                          style={{
                            background: held ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)',
                            border: `0.5px solid ${held ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-saqqara-light truncate">{line.providerName ?? line.providerUserId}</p>
                            <p className="text-saqqara-light/35 text-xs">{line.providerEmail ?? '—'}</p>
                          </div>
                          <p className="text-saqqara-gold text-sm font-cinzel flex-shrink-0">{fmt(line.amountCents)}</p>
                          {selected.status === 'PendingReview' && (
                            <button
                              onClick={() => setHoldIds(ids =>
                                ids.includes(line.providerUserId)
                                  ? ids.filter(id => id !== line.providerUserId)
                                  : [...ids, line.providerUserId]
                              )}
                              className="text-xs font-cinzel flex-shrink-0 px-2 py-1 rounded"
                              style={{
                                background: held ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                                color: held ? '#F87171' : 'rgba(255,255,255,0.3)',
                                border: '0.5px solid rgba(255,255,255,0.08)'
                              }}>
                              {held ? 'Unhold' : 'Hold'}
                            </button>
                          )}
                          {line.status !== 'Pending' && (
                            <span className="text-xs text-saqqara-light/30 font-cinzel flex-shrink-0">{line.status}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Manual gate message */}
                {selected.status === 'PendingReview' && (
                  <div className="px-4 py-3 rounded text-xs font-cinzel tracking-[0.06em] text-saqqara-light/50"
                    style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                    ✓ Pre-check: Verify no active disputes or chargebacks before approving.
                    {holdIds.length > 0 && <span className="text-amber-400 ml-2">{holdIds.length} provider(s) will be held.</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  {selected.status === 'PendingReview' && (
                    <button onClick={() => approve(selected.id)} className="btn btn-primary">
                      ✓ Approve Cycle
                    </button>
                  )}
                  {selected.status === 'Approved' && (
                    <button onClick={() => disburse(selected.id)} className="btn btn-primary">
                      Mark as Disbursed
                    </button>
                  )}
                  {(selected.status === 'PendingReview' || selected.status === 'Approved') && (
                    <button onClick={() => voidCycle(selected.id)} className="btn btn-ghost text-red-400 text-xs">
                      Void Cycle
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="btn btn-ghost">Close</button>
                </div>

                {/* Disburse instructions */}
                {selected.status === 'Approved' && (
                  <div className="px-4 py-3 rounded text-xs"
                    style={{ background: 'rgba(59,130,246,0.07)', border: '0.5px solid rgba(59,130,246,0.2)' }}>
                    <p className="font-cinzel tracking-[0.06em] text-blue-300 mb-2">Disbursement Checklist</p>
                    <ol className="space-y-1 text-saqqara-light/50 list-decimal list-inside">
                      <li>Log into Capital One Business (...6609 Payout Account)</li>
                      <li>Transfer {fmt(selected.totalProviderAmountCents)} from Operating (...0319) → Payout (...6609)</li>
                      <li>Send ACH/Zelle to each provider listed above</li>
                      <li>Once all transfers complete, click "Mark as Disbursed" above</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
