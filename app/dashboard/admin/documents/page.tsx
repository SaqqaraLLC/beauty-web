'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';

interface AdminDocument {
  id: string;
  ownerType: 'Artist' | 'Location';
  ownerName?: string;
  documentType: string;
  documentName: string;
  documentNumber?: string;
  expiresAt?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  rejectionReason?: string;
  createdAt: string;
}

type Tab = 'All' | 'Pending' | 'Verified' | 'Rejected' | 'Expiring Soon';
type OwnerFilter = 'All' | 'Artist' | 'Location';

const TABS: Tab[] = ['All', 'Pending', 'Verified', 'Rejected', 'Expiring Soon'];

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Verified: 'text-emerald-400',
    Rejected: 'text-red-400',
    Pending:  'text-saqqara-gold/70',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] ${map[status] ?? map.Pending}`}
      style={{ border: '0.5px solid currentColor' }}>
      {status}
    </span>
  );
}

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('All');
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    apiGet('/api/admin/documents')
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  function filterDocs(list: AdminDocument[]): AdminDocument[] {
    let filtered = list;

    if (ownerFilter !== 'All') {
      filtered = filtered.filter(d => d.ownerType === ownerFilter);
    }

    switch (activeTab) {
      case 'Pending':       return filtered.filter(d => d.status === 'Pending');
      case 'Verified':      return filtered.filter(d => d.status === 'Verified');
      case 'Rejected':      return filtered.filter(d => d.status === 'Rejected');
      case 'Expiring Soon': return filtered.filter(d => d.expiresAt && daysUntil(d.expiresAt) <= 30 && d.status !== 'Rejected');
      default:              return filtered;
    }
  }

  async function handleVerify(id: string) {
    setActionLoading(id);
    try {
      await apiPost(`/api/admin/documents/${id}/verify`);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'Verified' } : d));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      await apiPost(`/api/admin/documents/${rejectModal.id}/reject`, { reason: rejectReason });
      setDocs(prev => prev.map(d =>
        d.id === rejectModal.id ? { ...d, status: 'Rejected', rejectionReason: rejectReason } : d
      ));
      setRejectModal(null);
      setRejectReason('');
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  const total        = docs.length;
  const pending      = docs.filter(d => d.status === 'Pending').length;
  const expiring30   = docs.filter(d => d.expiresAt && daysUntil(d.expiresAt) <= 30 && d.status !== 'Rejected').length;
  const rejected     = docs.filter(d => d.status === 'Rejected').length;

  const displayed = filterDocs(docs);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs font-cinzel tracking-[0.18em] text-saqqara-gold/60 uppercase mb-1">Admin</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em] text-saqqara-light">Document Verification</h1>
            <p className="text-saqqara-light/30 text-xs mt-1">Review, verify, and manage submitted compliance documents.</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total',          value: total,      color: 'text-saqqara-light' },
              { label: 'Pending',        value: pending,    color: 'text-saqqara-gold' },
              { label: 'Expiring <30d',  value: expiring30, color: 'text-red-400' },
              { label: 'Rejected',       value: rejected,   color: 'text-red-400/70' },
            ].map(s => (
              <div key={s.label} className="card text-center" style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-cinzel tracking-[0.08em] transition-all duration-200 ${
                    activeTab === tab
                      ? 'text-saqqara-gold bg-saqqara-gold/10'
                      : 'text-saqqara-light/40 hover:text-saqqara-light'
                  }`}
                  style={{ border: `0.5px solid ${activeTab === tab ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Owner filter */}
            <select
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value as OwnerFilter)}
              className="bg-black/40 text-saqqara-light text-xs font-cinzel tracking-[0.08em] px-3 py-1.5 rounded-lg outline-none"
              style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
            >
              <option value="All">All Types</option>
              <option value="Artist">Artists</option>
              <option value="Location">Locations</option>
            </select>
          </div>

          {/* Document Cards */}
          {loading ? (
            <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-12">Loading…</p>
          ) : displayed.length === 0 ? (
            <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-12">No documents match the current filter.</p>
          ) : (
            <div className="space-y-4">
              {displayed.map(doc => (
                <div key={doc.id} className="card" style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Info */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-gold/60"
                          style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                          {doc.documentType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-light/30"
                          style={{ border: '0.5px solid rgba(255,255,255,0.07)' }}>
                          {doc.ownerType}
                        </span>
                        <StatusBadge status={doc.status} />
                        {doc.expiresAt && daysUntil(doc.expiresAt) <= 30 && doc.status !== 'Rejected' && (
                          <span className="text-xs text-red-400 font-cinzel">⚠ Expires in {daysUntil(doc.expiresAt)}d</span>
                        )}
                      </div>

                      <p className="text-xs font-cinzel tracking-[0.06em] text-saqqara-light">{doc.documentName}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-saqqara-light/40">
                        {doc.ownerName && <span>Owner: <span className="text-saqqara-light/60">{doc.ownerName}</span></span>}
                        {doc.documentNumber && <span>#{doc.documentNumber}</span>}
                        {doc.expiresAt && <span>Expires {new Date(doc.expiresAt).toLocaleDateString()}</span>}
                        <span>Added {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>

                      {doc.rejectionReason && (
                        <p className="text-xs text-red-400/60">Reason: {doc.rejectionReason}</p>
                      )}
                    </div>

                    {/* Actions */}
                    {doc.status === 'Pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleVerify(doc.id)}
                          disabled={actionLoading === doc.id}
                          className="btn btn-primary text-xs px-4 py-1.5">
                          {actionLoading === doc.id ? '…' : 'Verify'}
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: doc.id, name: doc.documentName })}
                          disabled={actionLoading === doc.id}
                          className="px-4 py-1.5 text-xs font-cinzel tracking-[0.08em] text-red-400/70 hover:text-red-400 rounded-full transition-colors"
                          style={{ border: '0.5px solid rgba(239,68,68,0.25)' }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{ background: '#0c0c0c', border: '0.5px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-cinzel tracking-[0.1em] text-red-400">Reject Document</h2>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="text-saqqara-light/30 hover:text-saqqara-light text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-saqqara-light/50">{rejectModal.name}</p>

            <div>
              <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none resize-none"
                style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                placeholder="e.g. Document appears expired or illegible…"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2 text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 rounded-full hover:text-saqqara-light transition-colors"
                style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectModal.id}
                className="flex-1 px-4 py-2 text-xs font-cinzel tracking-[0.08em] text-red-400 rounded-full transition-colors hover:bg-red-400/10 disabled:opacity-40"
                style={{ border: '0.5px solid rgba(239,68,68,0.3)' }}>
                {actionLoading === rejectModal.id ? '…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
