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
      {review.body && (
        <p className="text-xs text-saqqara-light/55 leading-relaxed">{review.body}</p>
      )}
    </div>
  );
}
