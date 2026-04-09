import StarRating from './StarRating';
import type { Review } from '@/lib/types';

interface Props {
  review: Review;
}

export default function ReviewCard({ review }: Props) {
  return (
    <div className="card space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{review.reviewerName}</p>
          <p className="text-saqqara-light/30 text-[0.65rem] font-cinzel tracking-[0.06em] mt-0.5">{review.reviewerRole}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating value={review.rating} size={12} />
          <time className="text-saqqara-light/25 text-[0.6rem] font-cinzel">
            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </time>
        </div>
      </div>

      {/* Body */}
      {review.comment && (
        <p className="text-xs text-saqqara-light/55 leading-relaxed">{review.comment}</p>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {review.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[0.6rem] font-cinzel tracking-[0.08em] text-saqqara-gold/60"
              style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.15)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
