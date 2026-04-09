import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
        <div className="text-center space-y-6 fade-in">
          <p className="script text-saqqara-gold text-5xl">404</p>
          <h1 className="font-cinzel text-lg tracking-[0.12em] text-saqqara-light">
            Page Not Found
          </h1>
          <p className="text-saqqara-light/30 text-xs max-w-xs mx-auto leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="royal-divider max-w-[120px] mx-auto" />
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    </>
  );
}
