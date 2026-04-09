'use client';

interface Props {
  value: number;          // 0–5, supports decimals for display
  max?: number;
  size?: number;          // px
  interactive?: boolean;
  onChange?: (v: number) => void;
}

export default function StarRating({ value, max = 5, size = 14, interactive = false, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5" style={{ lineHeight: 1 }}>
      {Array.from({ length: max }, (_, i) => {
        const filled  = value >= i + 1;
        const partial = !filled && value > i;
        const pct     = partial ? Math.round((value - i) * 100) : 0;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
            style={{ background: 'none', border: 'none', padding: 0, lineHeight: 1 }}
            aria-label={`${i + 1} star${i === 0 ? '' : 's'}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {partial && (
                <defs>
                  <linearGradient id={`star-partial-${i}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset={`${pct}%`} stopColor="#C9A84C" />
                    <stop offset={`${pct}%`} stopColor="rgba(201,168,76,0.15)" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M12 2l2.9 6.26 6.1.89-4.5 4.29 1.09 6.56L12 16.77l-5.59 3.23 1.09-6.56L3 9.15l6.1-.89L12 2z"
                fill={
                  filled   ? '#C9A84C' :
                  partial  ? `url(#star-partial-${i})` :
                  'rgba(201,168,76,0.15)'
                }
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
