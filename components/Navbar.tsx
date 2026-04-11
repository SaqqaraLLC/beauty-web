'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import LogoMark from './LogoMark';
import { useCurrentUser, clearUserCache } from '@/lib/hooks/useCurrentUser';
import { logout } from '@/lib/auth';
import NotificationBell from './notifications/NotificationBell';
import { apiGet } from '@/lib/api';
import type { StreamSummary } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

function engagementScore(s: StreamSummary) {
  return (s.viewerCount ?? 0) + (s.commentCount ?? 0) * 2 + (s.giftCount ?? 0) * 3;
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-cinzel text-[0.6rem] tracking-[0.16em] uppercase text-saqqara-light/45 hover:text-saqqara-gold transition-colors duration-300"
    >
      {children}
    </Link>
  );
}

function StreamsDropdown() {
  const [open, setOpen] = useState(false);
  const [streams, setStreams] = useState<StreamSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  // Lazy-load streams on first open
  useEffect(() => {
    if (!open || loaded) return;
    apiGet('/api/streams/browse?filter=all')
      .then((data: StreamSummary[]) => {
        // Live first, then by engagement score
        const sorted = [...data].sort((a, b) => {
          if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
          return engagementScore(b) - engagementScore(a);
        });
        setStreams(sorted.slice(0, 4));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded]);

  const liveCount = streams.filter(s => s.isLive).length;

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(v => !v)}
        className="font-cinzel text-[0.6rem] tracking-[0.16em] uppercase transition-colors duration-300 flex items-center gap-1.5"
        style={{ color: open ? '#C9A84C' : 'rgba(26,26,26,0.45)' }}
      >
        Watch
        {liveCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[0.55rem]">{liveCount}</span>
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-xl overflow-hidden z-50 slide-in"
          style={{
            background: 'rgba(10,10,10,0.97)',
            border: '0.5px solid rgba(201,168,76,0.18)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(201,168,76,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
            <p className="font-cinzel text-[0.6rem] tracking-[0.14em] uppercase text-saqqara-gold/60">
              Top Broadcasts
            </p>
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.55rem] font-cinzel tracking-[0.1em] text-red-400"
                style={{ background: 'rgba(220,38,38,0.12)', border: '0.5px solid rgba(220,38,38,0.2)' }}>
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                {liveCount} LIVE
              </span>
            )}
          </div>

          {/* Stream list */}
          {streams.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[0.65rem] font-cinzel tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.25)' }}>No broadcasts right now</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {streams.map(s => (
                <Link key={s.streamId} href={`/streams/${s.streamId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group">

                  {/* Thumbnail */}
                  <div className="relative w-16 h-10 rounded-md overflow-hidden flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                    {s.thumbnailUrl
                      ? <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg text-saqqara-gold/10">▶</span>
                        </div>
                    }
                    {s.isLive && (
                      <div className="absolute top-0.5 left-0.5 flex items-center gap-0.5 px-1 py-0.5 rounded text-[0.5rem] font-cinzel tracking-[0.06em]"
                        style={{ background: 'rgba(220,38,38,0.9)', color: '#fff' }}>
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse mr-0.5" />
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-[0.65rem] tracking-[0.06em] group-hover:text-saqqara-gold transition-colors truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {s.title}
                    </p>
                    <p className="text-saqqara-gold/45 text-[0.6rem] truncate mt-0.5">{s.artistName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {s.viewerCount.toLocaleString()} {s.isLive ? 'watching' : 'views'}
                      </span>
                      {(s.giftCount ?? 0) > 0 && (
                        <span className="text-saqqara-gold/30 text-[0.55rem]">
                          ✦ {s.giftCount} gifts
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
            <Link href="/streams" onClick={() => setOpen(false)}
              className="block text-center font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-saqqara-gold/50 hover:text-saqqara-gold transition-colors">
              View All Streams →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      clearUserCache();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Build nav links based on role
  const navLinks = (() => {
    if (isLoading || !user) return [];
    switch (user.role) {
      case 'Artist':
        return [
          { href: '/artists',                           label: 'Directory'        },
          { href: '/dashboard/artist/company-requests', label: 'Bookings'         },
          { href: '/dashboard/artist/agent',            label: 'My Agent'         },
          { href: '/dashboard/artist/availability',     label: 'Availability'     },
        ];
      case 'Company':
        return [
          { href: '/artists',           label: 'Find Artists'    },
          { href: '/dashboard/company', label: 'Dashboard'       },
          { href: '/agents',            label: 'Agents'          },
        ];
      case 'Agent':
        return [
          { href: '/artists',         label: 'Find Artists' },
          { href: '/dashboard/agent', label: 'Dashboard'    },
        ];
      case 'Admin':
        return [
          { href: '/dashboard/admin',      label: 'Admin'      },
          { href: '/dashboard/moderation', label: 'Moderation' },
          { href: '/artists',              label: 'Artists'    },
          { href: '/docs',                 label: 'Resources'  },
        ];
      case 'Client':
        return [
          { href: '/artists', label: 'Find Artists' },
        ];
      default:
        return [];
    }
  })();

  const mobileNavClass = "block font-cinzel text-[0.6rem] tracking-[0.16em] uppercase text-saqqara-light/60 hover:text-saqqara-gold transition-colors py-2";

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        borderBottom: '0.5px solid rgba(201, 168, 76, 0.25)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <LogoMark size={36} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <NavLink key={l.href} href={l.href}>{l.label}</NavLink>
            ))}

            {/* Streams dropdown — always visible */}
            <StreamsDropdown />

            {user && (
              <>
                <div className="h-4 w-px" style={{ background: 'rgba(201,168,76,0.15)' }} />
                <NotificationBell userId={user.id} />
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                >
                  Sign Out
                </button>
              </>
            )}

            {!user && !isLoading && (
              <>
                <NavLink href="/login">Sign In</NavLink>
                <a href="https://outlook.office.com/book/SaqqaraLongLiveCarolann@Saqqarallc.com/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Book a Call</a>
                <Link href="/register" className="btn btn-primary">Apply</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-saqqara-light/60 hover:text-saqqara-gold transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="md:hidden py-5 space-y-4 slide-in"
            style={{ borderTop: '0.5px solid rgba(201,168,76,0.08)' }}
          >
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={mobileNavClass}>{l.label}</Link>
            ))}
            <Link href="/streams" className={mobileNavClass}>Watch</Link>
            {user && (
              <button onClick={handleLogout} className="btn btn-secondary w-full mt-2">
                Sign Out
              </button>
            )}
            {!user && !isLoading && (
              <div className="flex gap-3 pt-2">
                <Link href="/login"    className="btn btn-ghost flex-1">Sign In</Link>
                <Link href="/register" className="btn btn-primary flex-1">Apply</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
