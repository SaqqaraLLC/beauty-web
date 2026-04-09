'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/reviews/StarRating';
import ReviewCard from '@/components/reviews/ReviewCard';
import RatingSummaryCard from '@/components/reviews/RatingSummaryCard';
import Link from 'next/link';
import type { AgentProfile, AgentRosterEntry, Review, RatingSummary } from '@/lib/types';

export default function AgentPublicPage({ params }: { params: { agentId: string } }) {
  const [agent,   setAgent]   = useState<AgentProfile | null>(null);
  const [roster,  setRoster]  = useState<AgentRosterEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet(`/api/agents/${params.agentId}`),
      apiGet(`/api/agents/${params.agentId}/roster`).catch(() => []),
      apiGet(`/api/reviews?entityType=Agent&entityId=${params.agentId}`).catch(() => []),
      apiGet(`/api/reviews/summary?entityType=Agent&entityId=${params.agentId}`).catch(() => null),
    ]).then(([agentData, rosterData, reviewData, summaryData]) => {
      setAgent(agentData);
      setRoster(Array.isArray(rosterData) ? rosterData : []);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
      setSummary(summaryData);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [params.agentId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  if (!agent) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Agent not found</p>
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
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
              <span className="text-2xl font-cinzel text-saqqara-gold">{agent.fullName.charAt(0)}</span>
            </div>

            <div>
              <p className="script text-saqqara-gold text-2xl">{agent.fullName}</p>
              {agent.agencyName && (
                <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.1em] mt-0.5">{agent.agencyName}</p>
              )}
            </div>

            {agent.isVerified && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-gold"
                style={{ border: '0.5px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.06)' }}>
                ✦ Verified Agent
              </div>
            )}

            {agent.averageRating && agent.averageRating > 0 && (
              <div className="flex items-center gap-2 justify-center">
                <StarRating value={agent.averageRating} size={13} />
                <span className="text-saqqara-light/40 text-xs font-cinzel">{agent.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="royal-divider" />

          {/* Specialties */}
          {agent.specialties && agent.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {agent.specialties.map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-light/50"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {agent.bio && (
            <div className="card text-center">
              <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/40 mb-3 uppercase">About</p>
              <p className="text-saqqara-light/55 text-xs leading-relaxed">{agent.bio}</p>
            </div>
          )}

          {/* Roster */}
          {roster.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase text-center">
                Artist Roster · {roster.length}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {roster.map(r => (
                  <Link key={r.artistId} href={`/artists/${r.artistId}`} className="card flex items-center gap-3 hover:border-saqqara-gold/30 transition-all">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(201,168,76,0.1)' }}>
                      {r.profileImageUrl
                        ? <img src={r.profileImageUrl} alt={r.artistName} className="w-full h-full object-cover" />
                        : <span className="text-base">🎨</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{r.artistName}</p>
                      {r.specialty && <p className="text-saqqara-gold/50 text-xs truncate">{r.specialty}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rating summary */}
          {summary && summary.totalReviews > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase text-center">Reviews</h2>
              <RatingSummaryCard summary={summary} />
              <div className="space-y-3">
                {reviews.slice(0, 5).map(r => <ReviewCard key={r.reviewId} review={r} />)}
              </div>
            </div>
          )}

          {/* Contact CTA */}
          {agent.websiteUrl && (
            <div className="text-center">
              <a href={agent.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Visit Agency Website →
              </a>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
