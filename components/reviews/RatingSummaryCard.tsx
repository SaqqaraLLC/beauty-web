import StarRating from './StarRating';
import type { RatingSummary } from '@/lib/types';

interface Props {
  summary: RatingSummary;
}

export default function RatingSummaryCard({ summary }: Props) {
  const avg = summary.averageRating;
  const n   = summary.totalReviews;

  return (
    <div className="card flex items-center gap-6">
      {/* Big score */}
      <div className="text-center flex-shrink-0">
        <p className="text-2xl font-bold text-saqqara-gold">{avg.toFixed(1)}</p>
        <StarRating value={avg} size={10} />
        <p className="text-saqqara-light/30 text-[0.6rem] font-cinzel tracking-[0.08em] mt-1">
          {n} review{n !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Bar breakdown */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map(star => {
          const count = summary.breakdown?.[star] ?? 0;
          const pct   = n > 0 ? (count / n) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-saqqara-light/30 text-[0.6rem] font-cinzel w-2 text-right">{star}</span>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: 'rgba(201,168,76,0.5)' }} />
              </div>
              <span className="text-saqqara-light/20 text-[0.6rem] font-cinzel w-4 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
