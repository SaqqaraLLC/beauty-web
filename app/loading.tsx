export default function Loading() {
  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
      <div className="text-center space-y-4 fade-in">
        <div className="text-saqqara-gold/20 text-3xl animate-pulse">✦</div>
        <p className="font-cinzel text-[0.6rem] tracking-[0.2em] text-saqqara-light/20 uppercase">
          Loading
        </p>
      </div>
    </div>
  );
}
