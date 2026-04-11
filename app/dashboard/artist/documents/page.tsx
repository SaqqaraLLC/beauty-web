'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';
import { ARTIST_REQUIRED_DOCS } from '@/lib/data/stateceRequirements';

interface DocumentRecord {
  id: string;
  documentType: string;
  documentName: string;
  documentNumber?: string;
  expiresAt?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  createdAt: string;
}

interface UploadForm {
  documentType: string;
  documentName: string;
  documentNumber: string;
  expiresAt: string;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function expiryColor(dateStr: string): string {
  const d = daysUntil(dateStr);
  if (d < 30) return 'text-red-400';
  if (d < 90) return 'text-amber-400';
  return 'text-saqqara-light/60';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Verified: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/05',
    Rejected: 'text-red-400 border-red-400/30 bg-red-400/05',
    Pending:  'text-saqqara-gold/70 border-saqqara-gold/20 bg-saqqara-gold/05',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] ${map[status] ?? map.Pending}`}
      style={{ border: '0.5px solid' }}>
      {status}
    </span>
  );
}

export default function ArtistDocumentsPage() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<UploadForm>({
    documentType: '',
    documentName: '',
    documentNumber: '',
    expiresAt: '',
  });

  useEffect(() => {
    apiGet('/api/documents?ownerType=Artist')
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  function openModal(type: string) {
    setForm({ documentType: type, documentName: '', documentNumber: '', expiresAt: '' });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newDoc = await apiPost('/api/documents', {
        ownerType: 'Artist',
        documentType: form.documentType,
        documentName: form.documentName,
        documentNumber: form.documentNumber || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setDocs(prev => [newDoc, ...prev]);
      setShowModal(false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const expiringSoon = docs.filter(d => d.expiresAt && daysUntil(d.expiresAt) <= 60);
  const uploadedTypes = new Set(docs.map(d => d.documentType));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs font-cinzel tracking-[0.18em] text-saqqara-gold/60 uppercase mb-1">Artist Portal</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em] text-saqqara-light">Document Vault</h1>
            <p className="text-saqqara-light/30 text-xs mt-1 italic">
              Your documents are safely stored in the Saqqara vault — always accessible, never lost.
            </p>
          </div>

          {/* Expiry Banner */}
          {expiringSoon.length > 0 && (
            <div className="rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: 'rgba(251,191,36,0.06)', border: '0.5px solid rgba(251,191,36,0.25)' }}>
              <span className="text-amber-400 text-sm mt-0.5">⚠</span>
              <div>
                <p className="text-xs font-cinzel tracking-[0.08em] text-amber-400">Documents Expiring Soon</p>
                <p className="text-xs text-saqqara-light/50 mt-0.5">
                  {expiringSoon.length} document{expiringSoon.length > 1 ? 's' : ''} expire{expiringSoon.length === 1 ? 's' : ''} within 60 days. Please update them promptly.
                </p>
              </div>
            </div>
          )}

          {/* Required Documents Checklist */}
          <div className="card" style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase mb-4">Document Checklist</p>
            <div className="space-y-2">
              {ARTIST_REQUIRED_DOCS.map(docDef => {
                const uploaded = uploadedTypes.has(docDef.type);
                return (
                  <div key={docDef.type}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${uploaded ? 'text-emerald-400' : 'text-red-400/60'}`}>
                        {uploaded ? '✓' : '✗'}
                      </span>
                      <span className="text-xs font-cinzel tracking-[0.06em] text-saqqara-light/70">
                        {docDef.label}
                        {docDef.required && <span className="text-saqqara-gold ml-1">*</span>}
                      </span>
                    </div>
                    <button
                      onClick={() => openModal(docDef.type)}
                      className="text-xs font-cinzel tracking-[0.08em] text-saqqara-gold/60 hover:text-saqqara-gold transition-colors px-2 py-1 rounded"
                      style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                      Upload
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-saqqara-light/20 mt-3">* Required document</p>
          </div>

          {/* Document Cards */}
          <div>
            <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase mb-4">Uploaded Documents</p>
            {loading ? (
              <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-8">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-8">No documents uploaded yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {docs.map(doc => (
                  <div key={doc.id} className="card space-y-3" style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-gold/70"
                        style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                        {doc.documentType}
                      </span>
                      <StatusBadge status={doc.status} />
                    </div>

                    <div>
                      <p className="text-xs font-cinzel tracking-[0.06em] text-saqqara-light">{doc.documentName}</p>
                      {doc.documentNumber && (
                        <p className="text-xs text-saqqara-light/40 mt-0.5">#{doc.documentNumber}</p>
                      )}
                    </div>

                    {doc.expiresAt && (
                      <p className={`text-xs ${expiryColor(doc.expiresAt)}`}>
                        Expires {new Date(doc.expiresAt).toLocaleDateString()}
                        {daysUntil(doc.expiresAt) <= 60 && (
                          <span className="ml-1 opacity-70">({daysUntil(doc.expiresAt)}d)</span>
                        )}
                      </p>
                    )}

                    <p className="text-xs text-saqqara-light/20">
                      Added {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{ background: '#0c0c0c', border: '0.5px solid rgba(201,168,76,0.2)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-cinzel tracking-[0.1em] text-saqqara-light">Upload Document</h2>
              <button onClick={() => setShowModal(false)} className="text-saqqara-light/30 hover:text-saqqara-light text-lg leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Doc Type */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Document Type</label>
                <select
                  value={form.documentType}
                  onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                >
                  {ARTIST_REQUIRED_DOCS.map(d => (
                    <option key={d.type} value={d.type}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Doc Name */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Document Name</label>
                <input
                  type="text"
                  required
                  value={form.documentName}
                  onChange={e => setForm(f => ({ ...f, documentName: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                  placeholder="e.g. Florida Esthetics License"
                />
              </div>

              {/* Doc Number */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">
                  License / Document Number <span className="normal-case text-saqqara-light/20">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.documentNumber}
                  onChange={e => setForm(f => ({ ...f, documentNumber: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                  placeholder="e.g. ES123456"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">
                  Expiry Date <span className="normal-case text-saqqara-light/20">(optional)</span>
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                />
              </div>

              {/* File Note */}
              <div className="rounded-lg px-4 py-3 text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-saqqara-light/30 font-cinzel tracking-[0.06em]">
                  Secure file storage launching soon
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 rounded-full transition-colors hover:text-saqqara-light"
                  style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 btn btn-primary">
                  {submitting ? 'Saving…' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
