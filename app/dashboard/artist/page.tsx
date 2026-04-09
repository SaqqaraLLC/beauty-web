'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet } from '@/lib/api';
import Navbar from '@/components/Navbar';
import type { AgentRepresentationRequest, CompanyBookingArtistSlot } from '@/lib/types';

interface ArtistStats {
  totalBookings: number;
  upcomingBookings: number;
  pendingApprovals: number;
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
}

export default function ArtistDashboard() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [stats,            setStats]            = useState<ArtistStats | null>(null);
  const [companyRequests,  setCompanyRequests]  = useState<CompanyBookingArtistSlot[]>([]);
  const [agentRequests,    setAgentRequests]    = useState<AgentRepresentationRequest[]>([]);
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    if (!userLoading && user?.artistId) {
      Promise.all([
        apiGet(`/api/artists/${user.artistId}/stats`).then(setStats).catch(() => {}),
        apiGet(`/api/artists/${user.artistId}/company-requests`).then(setCompanyRequests).catch(() => setCompanyRequests([])),
        apiGet(`/api/artists/${user.artistId}/representation-requests`).then(setAgentRequests).catch(() => setAgentRequests([])),
      ]).finally(() => setLoading(false));
    }
  }, [user, userLoading]);

  const pendingCompany = companyRequests.filter(s => s.artistDecision === 'Pending');
  const pendingAgent   = agentRequests.filter(r => r.status === 'Pending' && r.initiatedBy === 'Agent');

  if (userLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">Welcome Back</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Artist Dashboard</h1>
            {stats?.isVerified && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-gold"
                style={{ border: '0.5px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.06)' }}>
                ✦ Verified Artist
              </div>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Bookings',   value: stats.totalBookings },
                { label: 'Upcoming',         value: stats.upcomingBookings },
                { label: 'Pending Approval', value: stats.pendingApprovals },
                { label: 'Avg. Rating',      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—' },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <div className="text-xl font-bold text-saqqara-gold mb-1">{s.value}</div>
                  <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Alerts */}
          {(pendingCompany.length > 0 || pendingAgent.length > 0) && (
            <div className="space-y-3">
              <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Needs Attention</h2>

              {pendingCompany.length > 0 && (
                <Link href="/dashboard/artist/company-requests"
                  className="card flex items-center justify-between hover:border-saqqara-gold/25 transition-all duration-200">
                  <div>
                    <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">Company Booking Requests</p>
                    <p className="text-saqqara-gold/60 text-xs mt-0.5">{pendingCompany.length} awaiting your response</p>
                  </div>
                  <span className="text-saqqara-gold text-xs">→</span>
                </Link>
              )}

              {pendingAgent.length > 0 && (
                <Link href="/dashboard/artist/agent"
                  className="card flex items-center justify-between hover:border-saqqara-gold/25 transition-all duration-200">
                  <div>
                    <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">Agent Representation Requests</p>
                    <p className="text-saqqara-gold/60 text-xs mt-0.5">{pendingAgent.length} pending response</p>
                  </div>
                  <span className="text-saqqara-gold text-xs">→</span>
                </Link>
              )}
            </div>
          )}

          {/* Quick links */}
          <div className="space-y-3">
            <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Manage</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/dashboard/artist/bookings',          label: 'My Bookings',        sub: 'View and manage client bookings' },
                { href: '/dashboard/artist/company-requests',  label: 'Company Requests',   sub: 'Respond to multi-artist event invitations' },
                { href: '/dashboard/artist/agent',             label: 'Agent & Representation', sub: 'Manage your agent relationships' },
                { href: '/dashboard/artist/availability',      label: 'Availability',        sub: 'Set your available dates and times' },
              ].map(({ href, label, sub }) => (
                <Link key={href} href={href}
                  className="card flex items-center justify-between group hover:border-saqqara-gold/25 transition-all duration-200">
                  <div>
                    <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light group-hover:text-saqqara-gold transition-colors">{label}</p>
                    <p className="text-saqqara-light/30 text-xs mt-0.5">{sub}</p>
                  </div>
                  <span className="text-saqqara-light/20 group-hover:text-saqqara-gold text-xs transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}