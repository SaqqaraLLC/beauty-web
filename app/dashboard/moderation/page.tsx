'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface FlaggedStream {
  flagId: number;
  streamId: number;
  artistName: string;
  streamTitle: string;
  reason: string;
  flagConfidence: number;
  flaggedAt: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function ModerationDashboard() {
  const [flags, setFlags] = useState<FlaggedStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadFlags();
  }, [filterStatus]);

  async function loadFlags() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus === 'pending' ? 'Flagged' : 'Reviewed');
      }

      const res = await fetch(`${API_URL}/api/moderation/flags?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load flagged streams');
      }

      const data = await res.json();
      setFlags(Array.isArray(data) ? data : data.flags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flags');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(flagId: number, action: 'approve' | 'remove' | 'ban') {
    setProcessingId(flagId);

    try {
      const res = await fetch(`${API_URL}/api/moderation/${flagId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        loadFlags();
      } else {
        alert('Failed to process action. Please try again.');
      }
    } catch (err) {
      console.error('Error processing action:', err);
      alert('Error processing action');
    } finally {
      setProcessingId(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'flagged': return 'bg-orange-950/20 border-orange-700 text-orange-300';
      case 'reviewed': return 'bg-green-950/20 border-green-700 text-green-300';
      case 'banned': return 'bg-red-950/20 border-red-700 text-red-300';
      default: return 'bg-saqqara-border';
    }
  };

  const getRiskColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-400';
    if (confidence >= 0.6) return 'text-orange-400';
    return 'text-yellow-400';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/60">Loading flagged streams...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-cinzel mb-1">Moderation Center</h1>
            <p className="text-saqqara-light/60 text-sm">Review and manage flagged content</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card">
              <div className="text-lg font-bold text-orange-400">{flags.filter(f => f.status === 'Flagged').length}</div>
              <p className="text-saqqara-light/60 text-sm">Pending Review</p>
            </div>
            <div className="card">
              <div className="text-lg font-bold text-green-400">{flags.filter(f => f.status === 'Reviewed').length}</div>
              <p className="text-saqqara-light/60 text-sm">Reviewed</p>
            </div>
            <div className="card">
              <div className="text-lg font-bold text-red-400">{flags.filter(f => f.action === 'ban').length}</div>
              <p className="text-saqqara-light/60 text-sm">Content Removed</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8">
            {(['pending', 'all'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-saqqara-gold text-saqqara-dark'
                    : 'bg-saqqara-border text-saqqara-light hover:bg-saqqara-border/80'
                }`}
              >
                {status === 'pending' ? 'Pending Review' : 'All Flags'}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="card bg-red-950/20 border border-red-700 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Flags List */}
          {flags.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-saqqara-light/60 mb-4">
                {filterStatus === 'pending'
                  ? 'No pending reviews'
                  : 'No flagged content'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map(flag => (
                <div key={flag.flagId} className="card">
                  <div className="grid md:grid-cols-2 gap-6">

                    {/* Left: Stream Info */}
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{flag.streamTitle}</h3>
                          <p className="text-saqqara-gold text-sm">by {flag.artistName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(flag.status)}`}>
                          {flag.status}
                        </span>
                      </div>

                      {/* Risk Level */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-saqqara-light/60 text-sm">Risk Level</p>
                          <span className={`font-bold ${getRiskColor(flag.flagConfidence)}`}>
                            {Math.round(flag.flagConfidence * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-saqqara-border rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              flag.flagConfidence >= 0.8
                                ? 'bg-red-600'
                                : flag.flagConfidence >= 0.6
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${flag.flagConfidence * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-4">
                        <p className="text-saqqara-light/60 text-sm">Reason</p>
                        <p className="text-saqqara-light">{flag.reason}</p>
                      </div>

                      {/* Timestamps */}
                      <div className="space-y-1 text-xs text-saqqara-light/60">
                        <p>Flagged: {new Date(flag.flaggedAt).toLocaleString()}</p>
                        {flag.reviewedAt && (
                          <p>Reviewed: {new Date(flag.reviewedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col justify-between">
                      <Link href={`/streams/${flag.streamId}`}>
                        <button className="btn btn-secondary w-full mb-3">
                          👁️ View Stream
                        </button>
                      </Link>

                      {flag.status === 'Flagged' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAction(flag.flagId, 'approve')}
                            disabled={processingId === flag.flagId}
                            className="btn btn-primary w-full text-sm disabled:opacity-50"
                          >
                            ✓ Approve Content
                          </button>
                          <button
                            onClick={() => handleAction(flag.flagId, 'remove')}
                            disabled={processingId === flag.flagId}
                            className="btn btn-secondary w-full text-sm disabled:opacity-50"
                          >
                            🗑️ Remove & Review
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Remove this content and ban artist?')) {
                                handleAction(flag.flagId, 'ban');
                              }
                            }}
                            disabled={processingId === flag.flagId}
                            className="btn btn-danger w-full text-sm disabled:opacity-50"
                          >
                            🚫 Remove & Ban Artist
                          </button>
                        </div>
                      )}

                      {flag.status === 'Reviewed' && (
                        <div className="bg-green-950/30 border border-green-700 rounded-lg p-3">
                          <p className="text-green-400 text-sm font-semibold mb-1">
                            ✓ Action Taken
                          </p>
                          <p className="text-green-300 text-xs">
                            {flag.action === 'approved' && 'Content approved'}
                            {flag.action === 'removed' && 'Content removed'}
                            {flag.action === 'ban' && 'Artist banned'}
                          </p>
                          {flag.reviewedBy && (
                            <p className="text-green-300/60 text-xs mt-2">
                              by {flag.reviewedBy}
                            </p>
                          )}
                        </div>
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
