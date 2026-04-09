interface Props {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZES = {
  sm: { fontSize: '0.55rem', px: '0.5rem', py: '0.2rem', gap: '0.25rem' },
  md: { fontSize: '0.65rem', px: '0.75rem', py: '0.3rem', gap: '0.35rem' },
  lg: { fontSize: '0.75rem', px: '1rem',   py: '0.4rem', gap: '0.4rem'  },
};

export default function VerifiedBadge({ size = 'md', label = 'Verified' }: Props) {
  const s = SIZES[size];
  return (
    <span
      className="inline-flex items-center font-cinzel tracking-[0.08em] rounded-full text-saqqara-gold"
      style={{
        fontSize:   s.fontSize,
        padding:    `${s.py} ${s.px}`,
        gap:        s.gap,
        border:     '0.5px solid rgba(201,168,76,0.35)',
        background: 'rgba(201,168,76,0.06)',
      }}
    >
      ✦ {label}
    </span>
  );
}
