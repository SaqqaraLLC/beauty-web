'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

const LOCATION_LINKS = [
  {
    href: '/dashboard/location/documents',
    label: 'Document Vault',
    sub: 'Upload and manage your business licenses, permits, and compliance documents',
    icon: '🗂',
  },
  {
    href: '/dashboard/location/bookings',
    label: 'Bookings',
    sub: 'View artist and company bookings at your location',
    icon: '📅',
    soon: true,
  },
  {
    href: '/dashboard/location/artists',
    label: 'Artists',
    sub: 'Browse artists available to work at your location',
    icon: '✦',
    soon: true,
  },
  {
    href: '/dashboard/location/settings',
    label: 'Location Settings',
    sub: 'Update your location profile, hours, and service details',
    icon: '⚙',
    soon: true,
  },
];

export default function LocationDashboard() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">Welcome</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em] text-saqqara-light">Location Dashboard</h1>
            <p className="text-saqqara-light/30 text-xs mt-2 font-cinzel tracking-[0.08em]">
              Manage your location, documents, and artist connections.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Manage</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {LOCATION_LINKS.map(({ href, label, sub, soon }) => (
                <div key={href} className="relative">
                  {soon ? (
                    <div className="card opacity-40 cursor-not-allowed" style={{ border: '0.5px solid rgba(201,168,76,0.1)' }}>
                      <div>
                        <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">{label}</p>
                        <p className="text-saqqara-light/30 text-xs mt-0.5">{sub}</p>
                      </div>
                      <span className="absolute top-3 right-3 text-xs font-cinzel tracking-[0.06em] text-saqqara-gold/40"
                        style={{ border: '0.5px solid rgba(201,168,76,0.2)', padding: '1px 6px', borderRadius: '999px' }}>
                        Soon
                      </span>
                    </div>
                  ) : (
                    <Link href={href}
                      className="card flex items-center justify-between group hover:border-saqqara-gold/25 transition-all duration-200"
                      style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
                      <div>
                        <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light group-hover:text-saqqara-gold transition-colors">{label}</p>
                        <p className="text-saqqara-light/30 text-xs mt-0.5">{sub}</p>
                      </div>
                      <span className="text-saqqara-light/20 group-hover:text-saqqara-gold text-xs transition-colors">→</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="card text-center space-y-2" style={{ border: '0.5px solid rgba(201,168,76,0.1)' }}>
            <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-gold/60">Saqqara for Locations</p>
            <p className="text-xs text-saqqara-light/30">
              Keep your compliance documents up to date and maintain your status as a verified Saqqara location.
              Artists and companies trust verified locations for professional bookings.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
