export default function LogoMark({ size = 40, showTagline = false }: { size?: number; showTagline?: boolean }) {
  const subSize = Math.round(size * 0.18);
  const tagSize = Math.round(size * 0.13);

  return (
    <div className="flex items-center" style={{ gap: Math.round(size * 0.2) }}>
      {/* Logo mark — SVG tinted gold via CSS filter */}
      <img
        src="/assets/assets/logo/saqqara-logo.svg"
        alt="Saqqara LLC"
        width={size}
        height={size}
        style={{
          objectFit: 'contain',
          filter: 'sepia(1) saturate(4) hue-rotate(5deg) brightness(0.88)',
        }}
      />

      {/* Wordmark */}
      <div className="flex flex-col leading-none" style={{ gap: Math.round(size * 0.08) }}>
        <span
          className="font-cinzel text-saqqara-gold tracking-[0.22em] uppercase"
          style={{ fontSize: Math.round(size * 0.38) }}
        >
          Saqqara
        </span>
        <span
          className="font-cinzel text-saqqara-gold/40 tracking-[0.45em] uppercase"
          style={{ fontSize: subSize }}
        >
          LLC
        </span>
        {showTagline && (
          <span
            className="script text-saqqara-gold/30 tracking-[0.05em]"
            style={{ fontSize: tagSize + 2 }}
          >
            Live long carolann
          </span>
        )}
      </div>
    </div>
  );
}
