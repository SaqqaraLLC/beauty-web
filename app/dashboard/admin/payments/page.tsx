'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';

type PaymentStatus = 'Pending' | 'Authorized' | 'Captured' | 'Declined' | 'Refunded' | 'Failed' | 'Expired';
type PaymentMethod = 'Cash' | 'Check' | 'BankTransfer' | 'Zelle' | 'Card' | 'Other';

interface Payment {
  paymentId: number;
  worldpayTransactionId: string;
  bookingId?: number;
  payerEmail: string;
  amountCents: number;
  currencyCode: string;
  status: PaymentStatus;
  description?: string;
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
  completedAt?: string;
  responseCode?: string;
}

interface PaymentsPage {
  total: number;
  page: number;
  pageSize: number;
  items: Payment[];
}

const STATUS_STYLE: Record<PaymentStatus, { label: string; color: string; dot: string }> = {
  Pending:    { label: 'Pending',    color: 'rgba(245,158,11,0.12)',  dot: '#F59E0B' },
  Authorized: { label: 'Authorized', color: 'rgba(59,130,246,0.12)',  dot: '#3B82F6' },
  Captured:   { label: 'Captured',   color: 'rgba(16,185,129,0.12)',  dot: '#10B981' },
  Declined:   { label: 'Declined',   color: 'rgba(239,68,68,0.12)',   dot: '#EF4444' },
  Refunded:   { label: 'Refunded',   color: 'rgba(139,92,246,0.12)',  dot: '#8B5CF6' },
  Failed:     { label: 'Failed',     color: 'rgba(239,68,68,0.12)',   dot: '#EF4444' },
  Expired:    { label: 'Expired',    color: 'rgba(100,100,100,0.12)', dot: '#666'    },
};

const fmt    = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const fmtDT  = (iso: string)   => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const isManual = (txId: string) => txId.startsWith('MANUAL-');

export default function AdminPaymentsPage() {
  const [data,     setData]     = useState<PaymentsPage | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);

  const [showForm,  setShowForm]  = useState(false);
  const [formBusy,  setFormBusy]  = useState(false);
  const [formMsg,   setFormMsg]   = useState<string | null>(null);

  const [form, setForm] = useState({
    payerEmail:    '',
    payerName:     '',
    amountDollars: '',
    description:   '',
    bookingId:     '',
    paymentMethod: 'Check' as PaymentMethod,
    referenceNumber: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '50' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await apiGet(`/api/payments?${params}`);
      setData(res);
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    setFormBusy(true);
    setFormMsg(null);
    try {
      const amountCents = Math.round(parseFloat(form.amountDollars) * 100);
      if (isNaN(amountCents) || amountCents <= 0) {
        setFormMsg('Enter a valid amount.');
        return;
      }
      await apiPost('/api/payments/manual', {
        payerEmail:      form.payerEmail,
        payerName:       form.payerName || null,
        amountCents,
        description:     form.description || null,
        bookingId:       form.bookingId ? parseInt(form.bookingId) : null,
        paymentMethod:   form.paymentMethod,
        referenceNumber: form.referenceNumber || null,
      });
      setFormMsg('✓ Payment recorded');
      setForm({ payerEmail: '', payerName: '', amountDollars: '', description: '', bookingId: '', paymentMethod: 'Check', referenceNumber: '' });
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setFormMsg(`Error: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setFormBusy(false);
    }
  }

  const totalCollected = data?.items
    .filter(p => p.status === 'Captured')
    .reduce((sum, p) => sum + p.amountCents, 0) ?? 0;

  const totalPending = data?.items
    .filter(p => p.status === 'Pending' || p.status === 'Authorized')
    .reduce((sum, p) => sum + p.amountCents, 0) ?? 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="script text-saqqara-gold text-2xl mb-1">Payment Management</p>
              <h1 className="text-xl font-cinzel tracking-[0.1em]">All Transactions</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setShowForm(v => !v); setFormMsg(null); }} className="btn btn-primary text-xs">
                + Record Manual Payment
              </button>
              <Link href="/dashboard/admin" className="btn btn-ghost text-xs">← Admin</Link>
            </div>
          </div>

          {/* Action message */}
          {formMsg && (
            <div className="px-4 py-3 rounded text-sm font-cinzel tracking-[0.06em]"
              style={{
                background: formMsg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `0.5px solid ${formMsg.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: formMsg.startsWith('✓') ? '#10B981' : '#F87171',
              }}>
              {formMsg}
            </div>
          )}

          {/* Summary stats */}
          {data && (
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Transactions', value: data.total,          sub: 'all time (this page)' },
                { label: 'Collected (page)',   value: fmt(totalCollected), sub: 'captured payments' },
                { label: 'Pending / Auth',     value: fmt(totalPending),   sub: 'not yet settled' },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <div className="text-xl font-bold text-saqqara-gold mb-1">{s.value}</div>
                  <p className="text-saqqara-light/50 text-xs font-cinzel tracking-[0.06em]">{s.label}</p>
                  <p className="text-saqqara-light/25 text-xs mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Manual payment form */}
          {showForm && (
            <form onSubmit={submitManual} className="card space-y-4">
              <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/50 uppercase">
                Record Offline Payment
              </p>
              <p className="text-saqqara-light/30 text-xs">
                Use this for payments received outside of the card system — cash, check, Zelle, bank transfer, etc.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                    Payer Email *
                  </label>
                  <input type="email" required className="input w-full"
                    placeholder="client@example.com"
                    value={form.payerEmail}
                    onChange={e => setForm(f => ({ ...f, payerEmail: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                    Payer Name
                  </label>
                  <input type="text" className="input w-full"
                    placeholder="Jane Smith"
                    value={form.payerName}
                    onChange={e => setForm(f => ({ ...f, payerName: e.target.value }))} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                    Amount (USD) *
                  </label>
                  <input type="number" required min="0.01" step="0.01" className="input w-full"
                    placeholder="250.00"
                    value={form.amountDollars}
                    onChange={e => setForm(f => ({ ...f, amountDollars: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                    Payment Method *
                  </label>
                  <select className="input w-full"
                    value={form.paymentMethod}
                    onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}>
                    {(['Cash', 'Check', 'BankTransfer', 'Zelle', 'Other'] as PaymentMethod[]).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                    Reference / Check #
                  </label>
                  <input type="text" className="input w-full"
                    placeholder="CHK-1042"
                    value={form.referenceNumber}
                    onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                    Description
                  </label>
                  <input type="text" className="input w-full"
                    placeholder="Invoice #INV-0042 payment"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                    Booking ID (optional)
                  </label>
                  <input type="number" className="input w-full"
                    placeholder="123"
                    value={form.bookingId}
                    onChange={e => setForm(f => ({ ...f, bookingId: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={formBusy} className="btn btn-primary"
                  style={{ opacity: formBusy ? 0.6 : 1 }}>
                  {formBusy ? 'Saving…' : 'Record Payment'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              className="input text-xs"
              placeholder="Search email, transaction ID…"
              style={{ width: 260 }}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <select className="input text-xs" style={{ width: 160 }}
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              {(['Captured', 'Pending', 'Authorized', 'Declined', 'Refunded', 'Failed', 'Expired'] as PaymentStatus[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={load} className="btn btn-ghost text-xs">Refresh</button>
          </div>

          {/* Payments list */}
          {loading ? (
            <div className="card py-12 text-center">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="card py-12 text-center">
              <p className="text-saqqara-light/30 text-xs font-cinzel mb-2">No payments found</p>
              <p className="text-saqqara-light/15 text-xs">Payments will appear here once invoices are paid.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.items.map(p => {
                const st = STATUS_STYLE[p.status];
                const manual = isManual(p.worldpayTransactionId);
                return (
                  <div key={p.paymentId} className="card"
                    style={{ padding: '0.75rem 1rem' }}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">

                      {/* Left: payer + description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-cinzel tracking-[0.06em] text-saqqara-light truncate">
                            {p.payerEmail}
                          </p>
                          {manual && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-cinzel"
                              style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '0.5px solid rgba(201,168,76,0.2)', fontSize: '0.6rem' }}>
                              MANUAL
                            </span>
                          )}
                        </div>
                        <p className="text-saqqara-light/30 text-xs mt-0.5 truncate">
                          {p.description ?? p.worldpayTransactionId}
                          {p.bookingId && <span className="ml-2 text-saqqara-light/20">· Booking #{p.bookingId}</span>}
                        </p>
                      </div>

                      {/* Center: amount + method */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-saqqara-gold font-cinzel text-sm">{fmt(p.amountCents)}</p>
                        {(p.cardBrand || p.cardLast4) && (
                          <p className="text-saqqara-light/25 text-xs mt-0.5">
                            {p.cardBrand}{p.cardLast4 && ` ···· ${p.cardLast4}`}
                          </p>
                        )}
                      </div>

                      {/* Right: status + date */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-cinzel"
                            style={{ background: st.color, color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                            {st.label}
                          </span>
                          <p className="text-saqqara-light/25 text-xs mt-1">{fmtDT(p.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data && data.total > data.pageSize && (
            <div className="flex justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn btn-ghost text-xs" style={{ opacity: page === 1 ? 0.3 : 1 }}>← Prev</button>
              <span className="text-xs text-saqqara-light/30 font-cinzel self-center">
                Page {page} of {Math.ceil(data.total / data.pageSize)}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(data.total / data.pageSize)}
                className="btn btn-ghost text-xs" style={{ opacity: page >= Math.ceil(data.total / data.pageSize) ? 0.3 : 1 }}>Next →</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
