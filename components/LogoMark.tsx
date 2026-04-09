import Image from 'next/image';

export default function LogoMark({ size = 40 }: { size?: number }) {
  const textSize = Math.round(size * 0.22);
  const subSize  = Math.round(size * 0.13);

  return (
    <div className="flex items-center" style={{ gap: Math.round(size * 0.28) }}>
      {/* Circle with actual brand SVG */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          border: '0.5px solid rgba(201, 168, 76, 0.3)',
          boxShadow: '0 0 20px rgba(201,168,76,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
          background: 'radial-gradient(circle at 40% 35%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      >
        <div className="relative" style={{ width: size * 0.62, height: size * 0.62 }}>
          <Image
            src="/assets/assets/logo/saqqara-logo.svg"
            alt="Saqqara"
            fill
            className="object-contain"
            priority
          />
        </div>
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
          className="font-cinzel text-saqqara-gold/35 tracking-[0.45em] uppercase"
          style={{ fontSize: subSize }}
        >
          LLC
        </span>
      </div>
    </div>
  );
}
