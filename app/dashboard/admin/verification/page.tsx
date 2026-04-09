'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';
import VerifiedBadge from '@/components/VerifiedBadge';
import Link from 'next/link';

type EntityKind = 'artist' | 'company' | 'agent';

interface VerificationEntry {
  entityId:    number;
  entityKind:  EntityKind;
  name:        string;
  email:       string;
  submittedAt: string;
  isVerified:  boolean;
  notes?:      string;
}

export default function AdminVerificationPage() {
  const [tab,     setTab]     = useState<EntityKind>('artist');
  const [entries, setEntries] = useState<VerificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<number | null>(null);

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiGet(`/api/admin/verification?kind=${tab}`);
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); }
    finally  { setLoading(false); }
  }

  async function verify(entry: VerificationEntry, grant: boolean) {
    setActing(entry.entityId);
    try {
      await apiPost(`/api/admin/verification/${entry.entityKind}/${entry.entityId}/${grant ? 'grant' : 'revoke'}`, {});
      setEntries(prev => prev.map(e =>
        e.entityId === entry.entityId ? { ...e, isVerified: grant } : e
      ));
    } catch { /* silent */ }
    finally  { setActing(null); }
  }

  const pending  = entries.filter(e => !e.isVerified);
  const verified = entries.filter(e =>  e.isVerified);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">Verification</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Verified Badge Management</h1>
            <p className="text-saqqara-light/35 text-xs mt-2">Grant or revoke verified status for artists, companies, and agents</p>
          </div>

          {/* Kind tabs */}
          <div className="flex justify-center gap-1" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
            {(['artist', 'company', 'agent'] as EntityKind[]).map(k => (
              <button key={k} onClick={() => setTab(k)}
                className="px-5 py-3 font-cinzel text-xs tracking-[0.1em] uppercase transition-all capitalize"
                style={{
                  color:        tab === k ? '#C9A84C' : 'rgba(237,237,237,0.3)',
                  borderBottom: tab === k ? '0.5px solid #C9A84C' : '0.5px solid transparent',
                  marginBottom: '-0.5px',
                }}>
                {k}s
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
            </div>
          ) : (
            <>
              {/* Pending */}
              <section className="space-y-3">
                <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">
                  Awaiting Verification · {pending.length}
                </h2>
                {pending.length === 0 ? (
                  <div className="card text-center py-8">
                    <p className="text-saqqara-light/25 text-xs">All {tab}s verified</p>
                  </div>
                ) : pending.map(e => (
                  <EntryRow key={e.entityId} entry={e} acting={acting === e.entityId} onVerify={verify} tab={tab} />
                ))}
              </section>

              {/* Already verified */}
              {verified.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">
                    Verified · {verified.length}
                  </h2>
                  {verified.map(e => (
                    <EntryRow key={e.entityId} entry={e} acting={acting === e.entityId} onVerify={verify} tab={tab} />
                  ))}
                </section>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}

function EntryRow({
  entry, acting, onVerify, tab,
}: {
  entry: VerificationEntry;
  acting: boolean;
  onVerify: (e: VerificationEntry, grant: boolean) => void;
  tab: EntityKind;
}) {
  const profileHref =
    tab === 'artist'  ? `/artists/${entry.entityId}` :
    tab === 'company' ? `/companies/${entry.entityId}` :
    `/agents/${entry.entityId}`;

  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{entry.name}</p>
          {entry.isVerified && <VerifiedBadge size="sm" />}
        </div>
        <p className="text-saqqara-light/35 text-xs mt-0.5">{entry.email}</p>
        <p className="text-saqqara-light/20 text-[0.6rem] font-cinzel mt-0.5">
          Joined {new Date(entry.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={profileHref} className="btn btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.65rem' }}>
          Profile
        </Link>
        {entry.isVerified ? (
          <button
            onClick={() => onVerify(entry, false)}
            disabled={acting}
            className="btn btn-ghost disabled:opacity-40"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.65rem', color: 'rgba(239,68,68,0.6)', borderColor: 'rgba(239,68,68,0.15)' }}
          >
            {acting ? '…' : 'Revoke'}
          </button>
        ) : (
          <button
            onClick={() => onVerify(entry, true)}
            disabled={acting}
            className="btn btn-primary disabled:opacity-40"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.65rem' }}
          >
            {acting ? '…' : '✦ Verify'}
          </button>
        )}
      </div>
    </div>
  );
}
