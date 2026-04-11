export default function LogoMark({ size = 40, showTagline = false, glow = false }: { size?: number; showTagline?: boolean; glow?: boolean }) {
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
        className={glow ? 'animate-logo-float' : ''}
        style={{
          objectFit: 'contain',
          filter: glow
            ? 'sepia(1) saturate(4) hue-rotate(5deg) brightness(0.88) drop-shadow(0 0 18px rgba(201,168,76,0.55)) drop-shadow(0 0 40px rgba(201,168,76,0.25))'
            : 'sepia(1) saturate(4) hue-rotate(5deg) brightness(0.88)',
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
            className="font-cinzel text-saqqara-gold/35 tracking-[0.28em] uppercase"
            style={{ fontSize: tagSize }}
          >
            Est. 2013
          </span>
        )}
      </div>
    </div>
  );
}
