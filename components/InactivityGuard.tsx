'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useInactivityTimeout } from '@/lib/hooks/useInactivityTimeout';
import { useCurrentUser, clearUserCache } from '@/lib/hooks/useCurrentUser';
import { logout } from '@/lib/auth';

// Pages where inactivity timeout is suppressed
const EXEMPT_PREFIXES = [
  '/dashboard/artist/stream',
  '/streams/',
];

export default function InactivityGuard() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user }   = useCurrentUser();
  const [warn, setWarn] = useState(false);

  const isExempt = EXEMPT_PREFIXES.some(p => pathname.startsWith(p));
  const active   = !!user && !isExempt;

  const handleWarn = useCallback(() => {
    if (active) setWarn(true);
  }, [active]);

  const handleTimeout = useCallback(async () => {
    if (!active) return;
    setWarn(false);
    try { await logout(); } catch { /* ignore */ }
    clearUserCache();
    router.push('/login?reason=timeout');
  }, [active, router]);

  const handleStay = useCallback(() => {
    setWarn(false);
    // resetting is automatic — any event resets the timer
    window.dispatchEvent(new MouseEvent('mousedown'));
  }, []);

  useInactivityTimeout(
    handleWarn,
    handleTimeout,
    10 * 60 * 1000,
    9  * 60 * 1000,
  );

  if (!warn) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="card max-w-sm w-full text-center space-y-6 py-8 px-8">
        <div className="space-y-2">
          <p className="script text-saqqara-gold text-xl">Still there?</p>
          <p className="font-cinzel text-xs tracking-[0.1em] text-saqqara-light/80">
            You've been inactive for a while.
          </p>
          <p className="text-saqqara-light/40 text-xs font-cormorant">
            You'll be signed out in 1 minute unless you continue.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStay}
            className="flex-1 py-2.5 rounded-full text-xs font-cinzel tracking-[0.12em] text-saqqara-dark bg-saqqara-gold hover:bg-saqqara-gold-soft transition-all"
          >
            Stay Signed In
          </button>
          <button
            onClick={handleTimeout}
            className="flex-1 py-2.5 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-light/50 transition-all"
            style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
