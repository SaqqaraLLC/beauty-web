'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import { apiPost } from '@/lib/api';
import type { ReviewableEntityType } from '@/lib/types';

const ARTIST_TAGS  = ['Professional', 'Punctual', 'Creative', 'Talented', 'Great Communication', 'Would Rebook'];
const COMPANY_TAGS = ['Well Organized', 'Fair Pay', 'Clear Brief', 'Respectful', 'Professional', 'Would Work Again'];
const AGENT_TAGS   = ['Responsive', 'Transparent', 'Negotiated Well', 'Connected', 'Supportive', 'Would Recommend'];

const TAG_MAP: Record<ReviewableEntityType, string[]> = {
  Artist:  ARTIST_TAGS,
  Company: COMPANY_TAGS,
  Agent:   AGENT_TAGS,
};

interface Props {
  entityType:  ReviewableEntityType;
  entityId:    number;
  bookingId?:  number;
  onSubmitted?: () => void;
}

export default function ReviewForm({ entityType, entityId, bookingId, onSubmitted }: Props) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [tags,    setTags]    = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [done,    setDone]    = useState(false);

  const availableTags = TAG_MAP[entityType] ?? [];

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating'); return; }
    setLoading(true);
    setError(null);
    try {
      await apiPost('/api/reviews', { entityType, entityId, bookingId, rating, comment, tags });
      setDone(true);
      onSubmitted?.();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card text-center py-8 space-y-2">
        <div className="text-xl text-saqqara-gold">✦</div>
        <p className="font-cinzel text-xs tracking-[0.1em]">Review Submitted</p>
        <p className="text-saqqara-light/35 text-xs">Thank you for your feedback</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <h3 className="text-sm font-cinzel tracking-[0.1em]">Leave a Review</h3>

      {/* Stars */}
      <div className="space-y-1">
        <label>Your Rating</label>
        <div className="mt-1">
          <StarRating value={rating} size={22} interactive onChange={setRating} />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label>Quick Tags <span className="text-saqqara-light/25">(optional)</span></label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(t => (
            <button
              key={t} type="button"
              onClick={() => toggleTag(t)}
              className="px-3 py-1.5 rounded-full text-xs font-cinzel tracking-[0.06em] transition-all duration-200"
              style={{
                border:     tags.includes(t) ? '0.5px solid rgba(201,168,76,0.55)' : '0.5px solid rgba(255,255,255,0.08)',
                background: tags.includes(t) ? 'rgba(201,168,76,0.1)' : 'transparent',
                color:      tags.includes(t) ? '#C9A84C' : 'rgba(237,237,237,0.35)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label>Comment <span className="text-saqqara-light/25">(optional)</span></label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Share your experience…"
          className="resize-none"
          style={{ borderRadius: '1rem' }}
        />
      </div>

      {error && (
        <div className="rounded-2xl px-4 py-3 text-xs text-red-300"
          style={{ background: 'rgba(127,29,29,0.2)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
