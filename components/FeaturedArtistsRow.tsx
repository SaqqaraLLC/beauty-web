'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StarRating from '@/components/reviews/StarRating';
import VerifiedBadge from '@/components/VerifiedBadge';
import type { FeaturedSlot } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function FeaturedArtistsRow() {
  const [slots,   setSlots]   = useState<FeaturedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/featured-artists`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || slots.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.1)' }} />
        <p className="font-cinzel text-xs tracking-[0.2em] text-saqqara-gold/60 uppercase">Featured Artists</p>
        <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.1)' }} />
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {slots.map(slot => (
          <Link
            key={slot.slotId}
            href={`/artists/${slot.artistId}`}
            className="flex-shrink-0 w-44 card group transition-all duration-300 hover:-translate-y-1"
            style={{ textDecoration: 'none' }}
          >
            {/* Avatar */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 relative"
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(201,168,76,0.1)' }}>
              {slot.artistProfileImageUrl ? (
                <img src={slot.artistProfileImageUrl} alt={slot.artistName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl">🎨</span>
                </div>
              )}
              {/* Sponsored label */}
              {slot.slotType === 'Sponsored' && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[0.55rem] font-cinzel tracking-[0.08em] text-saqqara-gold"
                  style={{ background: 'rgba(8,8,8,0.85)', border: '0.5px solid rgba(201,168,76,0.25)' }}>
                  {slot.slotType}
                </div>
              )}
            </div>

            {/* Info */}
            <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{slot.artistName}</p>
            {slot.artistSpecialty && (
              <p className="text-saqqara-gold/55 text-xs truncate mt-0.5">{slot.artistSpecialty}</p>
            )}

            <div className="flex items-center justify-between mt-2">
              {slot.artistRating && slot.artistRating > 0 ? (
                <StarRating value={slot.artistRating} size={10} />
              ) : <div />}
              {slot.isVerified && <VerifiedBadge size="sm" label="✦" />}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
