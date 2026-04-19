'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet } from '@/lib/api';
import type { CompanyBooking, CompanyInvoice, CompanyProfile } from '@/lib/types';
import Navbar from '@/components/Navbar';

type Tab = 'overview' | 'bookings' | 'history' | 'invoices' | 'profile';

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  Draft:             { label: 'Draft',              color: 'rgba(255,255,255,0.08)' },
  Submitted:         { label: 'Submitted',          color: 'rgba(59,130,246,0.2)'  },
  PartiallyAccepted: { label: 'Partially Accepted', color: 'rgba(245,158,11,0.2)'  },
  FullyAccepted:     { label: 'Fully Accepted',     color: 'rgba(16,185,129,0.2)'  },
  Completed:         { label: 'Completed',          color: 'rgba(201,168,76,0.2)'  },
  Cancelled:         { label: 'Cancelled',          color: 'rgba(239,68,68,0.15)'  },
  Rejected:          { label: 'Rejected',           color: 'rgba(239,68,68,0.15)'  },
};

export default function CompanyDashboard() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [tab,      setTab]      = useState<Tab>('overview');
  const [bookings, setBookings] = useState<CompanyBooking[]>([]);
  const [invoices, setInvoices] = useState<CompanyInvoice[]>([]);
  const [profile,  setProfile]  = useState<CompanyProfile | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userLoading && user?.companyId) {
      Promise.all([
        apiGet('/api/company-bookings').then(setBookings).catch(() => setBookings([])),
        apiGet(`/api/companies/${user.companyId}`).then(setProfile).catch(() => {}),
        apiGet('/api/invoices').then(setInvoices).catch(() => setInvoices([])),
      ]).finally(() => setLoading(false));
    }
  }, [user, userLoading]);

  const active    = bookings.filter(b => !['Completed', 'Cancelled', 'Rejected'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'Completed');
  const pending   = bookings.filter(b => b.artistSlots?.some(s => s.artistDecision === 'Pending'));

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
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">{profile?.companyName || 'Company'}</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Dashboard</h1>
            {profile?.isVerified && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.1em] text-saqqara-gold"
                style={{ border: '0.5px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.06)' }}>
                ✦ Verified Company
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-1" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
            {(['overview', 'bookings', 'history', 'invoices', 'profile'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-3 font-cinzel text-xs tracking-[0.1em] uppercase transition-all duration-200 capitalize"
                style={{
                  color:        tab === t ? '#C9A84C' : 'rgba(237,237,237,0.3)',
                  borderBottom: tab === t ? '0.5px solid #C9A84C' : '0.5px solid transparent',
                  marginBottom: '-0.5px',
                }}>
                {t}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Active Bookings',    value: active.length },
                  { label: 'Awaiting Responses', value: pending.length },
                  { label: 'Completed',          value: completed.length },
                  { label: 'Total Bookings',     value: bookings.length },
                ].map(s => (
                  <div key={s.label} className="card text-center">
                    <div className="text-xl font-bold text-saqqara-gold mb-1">{s.value}</div>
                    <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href={`/companies/${user?.companyId}/book`} className="btn btn-primary">
                  + Book Artists
                </Link>
              </div>
            </div>
          )}

          {/* ── Bookings ── */}
          {tab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-cinzel tracking-[0.1em]">Active Bookings</h2>
                <Link href={`/companies/${user?.companyId}/book`} className="btn btn-primary">+ New Booking</Link>
              </div>

              {active.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-saqqara-light/30 text-xs mb-4">No active bookings</p>
                  <Link href={`/companies/${user?.companyId}/book`} className="btn btn-secondary">Book Your First Artist</Link>
                </div>
              ) : (
                active.map(b => <BookingCard key={b.companyBookingId} booking={b} />)
              )}
            </div>
          )}

          {/* ── History ── */}
          {tab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-sm font-cinzel tracking-[0.1em]">Completed Bookings</h2>
              {completed.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-saqqara-light/30 text-xs">No completed bookings yet</p>
                </div>
              ) : (
                completed.map(b => <BookingCard key={b.companyBookingId} booking={b} />)
              )}
            </div>
          )}

          {/* ── Invoices ── */}
          {tab === 'invoices' && (
            <div className="space-y-4">
              <h2 className="text-sm font-cinzel tracking-[0.1em]">Invoices</h2>
              {invoices.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-saqqara-light/30 text-xs">No invoices yet</p>
                </div>
              ) : (
                invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)
              )}
            </div>
          )}

          {/* ── Profile ── */}
          {tab === 'profile' && profile && (
            <div className="card max-w-xl mx-auto space-y-4">
              <h2 className="text-sm font-cinzel tracking-[0.1em] mb-4">Company Profile</h2>
              {[
                ['Company Name',   profile.companyName],
                ['Industry',       profile.industry],
                ['Contact Email',  profile.contactEmail],
                ['Contact Phone',  profile.contactPhone || '—'],
                ['Website',        profile.websiteUrl   || '—'],
                ['Status',         profile.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 text-xs"
                  style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <span className="font-cinzel tracking-[0.08em] text-saqqara-light/35">{k}</span>
                  <span className="text-saqqara-light/65">{v}</span>
                </div>
              ))}
              {profile.description && (
                <p className="text-xs text-saqqara-light/40 leading-relaxed pt-2">{profile.description}</p>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

const INVOICE_BADGE: Record<string, { label: string; color: string }> = {
  Draft:   { label: 'Draft',   color: 'rgba(255,255,255,0.08)' },
  Sent:    { label: 'Sent',    color: 'rgba(59,130,246,0.2)'   },
  Paid:    { label: 'Paid',    color: 'rgba(16,185,129,0.2)'   },
  Overdue: { label: 'Overdue', color: 'rgba(239,68,68,0.2)'    },
  Void:    { label: 'Void',    color: 'rgba(255,255,255,0.05)' },
};

function InvoiceCard({ invoice }: { invoice: CompanyInvoice }) {
  const badge = INVOICE_BADGE[invoice.status] ?? { label: invoice.status, color: 'rgba(255,255,255,0.06)' };
  const canPay = invoice.status === 'Sent' || invoice.status === 'Overdue';

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">
              {invoice.invoiceNumber}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em]"
              style={{ background: badge.color, color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.06)' }}>
              {badge.label}
            </span>
          </div>
          <p className="text-saqqara-light/35 text-xs">
            Issued {new Date(invoice.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}Due {new Date(invoice.dueAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-saqqara-gold text-sm font-cinzel mt-1">
            ${(invoice.totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        {canPay ? (
          <Link
            href={`/dashboard/company/invoices/${invoice.id}/pay`}
            className="btn btn-primary flex-shrink-0"
          >
            Pay Now
          </Link>
        ) : (
          <span className="text-xs font-cinzel text-saqqara-light/30 self-center">
            {invoice.status === 'Paid' ? 'Paid' : '—'}
          </span>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: CompanyBooking }) {
  const badge = STATUS_BADGE[booking.status] ?? { label: booking.status, color: 'rgba(255,255,255,0.06)' };
  const accepted = booking.artistSlots?.filter(s => s.artistDecision === 'Accepted').length ?? 0;
  const total    = booking.artistSlots?.length ?? 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{booking.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em]"
              style={{ background: badge.color, color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.06)' }}>
              {badge.label}
            </span>
          </div>
          <p className="text-saqqara-light/35 text-xs">
            {new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {booking.location ? ` · ${booking.location}` : ''}
          </p>
          {total > 0 && (
            <p className="text-xs text-saqqara-gold/60 mt-1">
              {accepted}/{total} artist{total > 1 ? 's' : ''} accepted
            </p>
          )}
        </div>
        <Link
          href={`/dashboard/company/bookings/${booking.companyBookingId}`}
          className="btn btn-ghost flex-shrink-0"
        >
          View →
        </Link>
      </div>
    </div>
  );
}
