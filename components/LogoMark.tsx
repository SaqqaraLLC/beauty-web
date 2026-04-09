import Image from 'next/image';

export default function LogoMark({ size = 40, showTagline = false }: { size?: number; showTagline?: boolean }) {
  const textSize  = Math.round(size * 0.22);
  const subSize   = Math.round(size * 0.12);
  const tagSize   = Math.round(size * 0.10);

  return (
    <div className="flex items-center" style={{ gap: Math.round(size * 0.28) }}>
      {/* Logo mark */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          src="/assets/assets/logo/saqqara-logo.svg"
          alt="Saqqara LLC"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none" style={{ gap: Math.round(size * 0.08) }}>
        <span
          className="font-cinzel text-saqqara-gold tracking-[0.22em] uppercase"
          style={{ fontSize: textSize }}
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
