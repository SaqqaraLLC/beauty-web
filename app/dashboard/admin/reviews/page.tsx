'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';

interface AdminReview {
  reviewId: number;
  bookingId?: number;
  reviewerUserId: string;
  reviewerRole: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  subjectEntityType: string;
  subjectEntityId: number;
  subjectName: string;
  rating: number;
  title?: string;
  body?: string;
  isVerifiedBooking: boolean;
  status: 'Published' | 'Pending' | 'Removed';
  createdAt: string;
}

type StatusTab = 'All' | 'Pending' | 'Published' | 'Removed';
const STATUS_TABS: StatusTab[] = ['All', 'Pending', 'Published', 'Removed'];

const ENTITY_TYPES = ['All', 'ArtistProfile', 'Agent', 'Client', 'Company'];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-saqqara-gold text-xs tracking-wider">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Published: 'text-emerald-400',
    Removed:   'text-red-400',
    Pending:   'text-saqqara-gold/70',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] ${map[status] ?? map.Pending}`}
      style={{ border: '0.5px solid currentColor' }}>
      {status}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]           = useState<AdminReview[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<StatusTab>('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    apiGet('/api/reviews/admin?pageSize=200')
      .then((res: { data: AdminReview[] }) => setReviews(res.data ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  function filtered() {
    let list = reviews;
    if (activeTab !== 'All')
      list = list.filter(r => r.status === activeTab);
    if (entityFilter !== 'All')
      list = list.filter(r => r.subjectEntityType === entityFilter);
    return list;
  }

  async function publish(id: number) {
    setActionLoading(id);
    try {
      await apiPost(`/api/reviews/${id}/publish`);
      setReviews(prev => prev.map(r => r.reviewId === id ? { ...r, status: 'Published' } : r));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function remove(id: number) {
    setActionLoading(id);
    try {
      await apiPost(`/api/reviews/${id}/remove`);
      setReviews(prev => prev.map(r => r.reviewId === id ? { ...r, status: 'Removed' } : r));
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  const total     = reviews.length;
  const pending   = reviews.filter(r => r.status === 'Pending').length;
  const published = reviews.filter(r => r.status === 'Published').length;
  const removed   = reviews.filter(r => r.status === 'Removed').length;
  const displayed = filtered();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs font-cinzel tracking-[0.18em] text-saqqara-gold/60 uppercase mb-1">Admin</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em] text-saqqara-light">Review Moderation</h1>
            <p className="text-saqqara-light/30 text-xs mt-1">Approve, publish, or remove platform reviews.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total',     value: total,     color: 'text-saqqara-light' },
              { label: 'Pending',   value: pending,   color: 'text-saqqara-gold' },
              { label: 'Published', value: published, color: 'text-emerald-400' },
              { label: 'Removed',   value: removed,   color: 'text-red-400/70' },
            ].map(s => (
              <div key={s.label} className="card text-center" style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_TABS.map(tab => (
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

            <select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
              className="bg-black/40 text-saqqara-light text-xs font-cinzel tracking-[0.08em] px-3 py-1.5 rounded-lg outline-none"
              style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
              {ENTITY_TYPES.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
              ))}
            </select>
          </div>

          {/* Review Cards */}
          {loading ? (
            <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-12">Loading…</p>
          ) : displayed.length === 0 ? (
            <p className="text-xs text-saqqara-light/30 font-cinzel text-center py-12">No reviews match the current filter.</p>
          ) : (
            <div className="space-y-4">
              {displayed.map(r => (
                <div key={r.reviewId} className="card" style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-gold/60"
                          style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                          {r.subjectEntityType}
                        </span>
                        <StatusBadge status={r.status} />
                        {r.isVerifiedBooking && (
                          <span className="text-xs font-cinzel tracking-[0.06em] text-emerald-400/70"
                            style={{ border: '0.5px solid rgba(52,211,153,0.25)', padding: '1px 8px', borderRadius: '999px' }}>
                            Verified Booking
                          </span>
                        )}
                        <StarRating rating={r.rating} />
                      </div>

                      {/* Subject */}
                      <p className="text-xs font-cinzel tracking-[0.06em] text-saqqara-light">
                        Re: <span className="text-saqqara-gold/80">{r.subjectName}</span>
                      </p>

                      {/* Title + body */}
                      {r.title && (
                        <p className="text-sm text-saqqara-light/80 font-medium">{r.title}</p>
                      )}
                      {r.body && (
                        <p className="text-xs text-saqqara-light/50 leading-relaxed line-clamp-3">{r.body}</p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 text-xs text-saqqara-light/40">
                        <span>By <span className="text-saqqara-light/60">{r.reviewerName}</span> ({r.reviewerRole})</span>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        {r.bookingId && <span>Booking #{r.bookingId}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0 min-w-[110px]">
                      {r.status !== 'Published' && (
                        <button
                          disabled={actionLoading === r.reviewId}
                          onClick={() => publish(r.reviewId)}
                          className="px-4 py-1.5 text-xs font-cinzel tracking-[0.08em] text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-colors disabled:opacity-40"
                          style={{ border: '0.5px solid rgba(52,211,153,0.35)' }}>
                          {actionLoading === r.reviewId ? '…' : 'Publish'}
                        </button>
                      )}
                      {r.status !== 'Removed' && (
                        <button
                          disabled={actionLoading === r.reviewId}
                          onClick={() => remove(r.reviewId)}
                          className="px-4 py-1.5 text-xs font-cinzel tracking-[0.08em] text-red-400 hover:bg-red-400/10 rounded-full transition-colors disabled:opacity-40"
                          style={{ border: '0.5px solid rgba(248,113,113,0.35)' }}>
                          {actionLoading === r.reviewId ? '…' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
