'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LogoMark from './LogoMark';
import { useCurrentUser, clearUserCache } from '@/lib/hooks/useCurrentUser';
import { logout } from '@/lib/auth';
import NotificationBell from './notifications/NotificationBell';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

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

  const mobileNavClass = "block font-cinzel text-[0.6rem] tracking-[0.16em] uppercase text-saqqara-light/45 hover:text-saqqara-gold transition-colors py-2";

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-2xl"
      style={{
        background: 'rgba(8, 8, 8, 0.9)',
        borderBottom: '0.5px solid rgba(201, 168, 76, 0.1)',
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
                <Link href="/register" className="btn btn-primary">Apply</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-saqqara-light/40 hover:text-saqqara-gold transition-colors"
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
