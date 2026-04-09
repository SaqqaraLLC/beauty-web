'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { CompanyProfile } from '@/lib/types';

export default function CompanyPublicPage({ params }: { params: { companyId: string } }) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`/api/companies/${params.companyId}`)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.companyId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Company not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            {/* Logo placeholder */}
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
              <span className="text-2xl font-cinzel text-saqqara-gold">
                {profile.companyName.charAt(0)}
              </span>
            </div>

            <p className="script text-saqqara-gold text-2xl">{profile.companyName}</p>
            <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.1em]">{profile.industry}</p>

            {profile.isVerified && (
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-gold"
                style={{ border: '0.5px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.06)' }}>
                ✦ Verified Company
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="royal-divider" />

          {/* About */}
          {profile.description && (
            <div className="card text-center">
              <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/40 mb-3 uppercase">About</p>
              <p className="text-saqqara-light/60 text-xs leading-relaxed">{profile.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="card max-w-lg mx-auto space-y-3">
            {[
              ['Industry',      profile.industry],
              profile.websiteUrl ? ['Website', profile.websiteUrl] : null,
              ['Status',        profile.status],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2 text-xs"
                style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                <span className="font-cinzel tracking-[0.08em] text-saqqara-light/35">{k}</span>
                {k === 'Website'
                  ? <a href={v as string} target="_blank" rel="noopener noreferrer"
                      className="text-saqqara-gold hover:text-saqqara-gold-soft transition-colors">{v}</a>
                  : <span className="text-saqqara-light/65">{v}</span>
                }
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href={`/companies/${params.companyId}/book`} className="btn btn-primary">
              Book with {profile.companyName}
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
