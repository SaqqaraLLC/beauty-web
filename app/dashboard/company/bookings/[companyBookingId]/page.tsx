'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';
import type { CompanyBooking, CompanyBookingArtistSlot } from '@/lib/types';

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  Draft:             { label: 'Draft',              color: 'rgba(255,255,255,0.08)' },
  Submitted:         { label: 'Submitted',          color: 'rgba(59,130,246,0.2)'  },
  PartiallyAccepted: { label: 'Partially Accepted', color: 'rgba(245,158,11,0.2)'  },
  FullyAccepted:     { label: 'Fully Accepted',     color: 'rgba(16,185,129,0.2)'  },
  Completed:         { label: 'Completed',          color: 'rgba(201,168,76,0.2)'  },
  Cancelled:         { label: 'Cancelled',          color: 'rgba(239,68,68,0.15)'  },
  Rejected:          { label: 'Rejected',           color: 'rgba(239,68,68,0.15)'  },
};

const DECISION_COLORS: Record<string, string> = {
  Pending:  'rgba(245,158,11,0.15)',
  Accepted: 'rgba(16,185,129,0.15)',
  Declined: 'rgba(239,68,68,0.15)',
};

export default function BookingDetailPage({ params }: { params: { companyBookingId: string } }) {
  const [booking,   setBooking]   = useState<CompanyBooking | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    apiGet(`/api/company-bookings/${params.companyBookingId}`)
      .then(setBooking)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.companyBookingId]);

  async function cancelBooking() {
    if (!booking) return;
    setCancelling(true);
    try {
      await apiPost(`/api/company-bookings/${booking.companyBookingId}/cancel`, {});
      setBooking(prev => prev ? { ...prev, status: 'Cancelled' } : prev);
    } catch { /* silent */ }
    finally  { setCancelling(false); }
  }

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

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Booking not found</p>
        </div>
      </>
    );
  }

  const badge     = STATUS_BADGE[booking.status] ?? { label: booking.status, color: 'rgba(255,255,255,0.06)' };
  const canCancel = !['Completed', 'Cancelled', 'Rejected'].includes(booking.status);
  const accepted  = booking.artistSlots?.filter(s => s.artistDecision === 'Accepted').length ?? 0;
  const total     = booking.artistSlots?.length ?? 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Back */}
          <Link href="/dashboard/company" className="inline-flex items-center gap-2 text-xs text-saqqara-light/35 hover:text-saqqara-gold transition-colors font-cinzel tracking-[0.08em]">
            ← Back to Dashboard
          </Link>

          {/* Header */}
          <div className="text-center space-y-2">
            <p className="script text-saqqara-gold text-2xl">{booking.title}</p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.06em]"
              style={{ background: badge.color, color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.06)' }}>
              {badge.label}
            </span>
          </div>

          {/* Event Details */}
          <div className="card space-y-3">
            <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase mb-4">Event Details</h2>
            {[
              ['Date',      new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                + (booking.eventEndDate ? ` → ${new Date(booking.eventEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '')],
              booking.location     ? ['Location',  booking.location]                                    : null,
              booking.ndaRequired  ? ['NDA',       'Required from all artists']                          : null,
              booking.packageLabel ? ['Package',   booking.packageLabel + (booking.packageDiscountPercent ? ` · ${booking.packageDiscountPercent}% discount` : '')] : null,
              ['Artists',   `${accepted}/${total} accepted`],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2 text-xs"
                style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                <span className="font-cinzel tracking-[0.08em] text-saqqara-light/35">{k}</span>
                <span className="text-saqqara-light/65">{v}</span>
              </div>
            ))}

            {booking.description && (
              <div className="rounded-2xl px-4 py-3 mt-2"
                style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-saqqara-light/35 mb-1 font-cinzel tracking-[0.08em]">Description</p>
                <p className="text-xs text-saqqara-light/55 leading-relaxed">{booking.description}</p>
              </div>
            )}
          </div>

          {/* Artist Slots */}
          {total > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">
                Artists · {accepted}/{total} Accepted
              </h2>

              {booking.artistSlots!.map(slot => (
                <SlotRow key={slot.slotId} slot={slot} />
              ))}
            </div>
          )}

          {/* Actions */}
          {canCancel && (
            <div className="flex justify-center pt-2">
              <button
                onClick={cancelBooking}
                disabled={cancelling}
                className="btn btn-ghost text-xs disabled:opacity-40"
                style={{ color: 'rgba(239,68,68,0.6)', borderColor: 'rgba(239,68,68,0.15)' }}
              >
                {cancelling ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function SlotRow({ slot }: { slot: CompanyBookingArtistSlot }) {
  const decisionBg = DECISION_COLORS[slot.artistDecision] ?? 'rgba(255,255,255,0.04)';

  return (
    <div className="card flex items-center justify-between gap-4"
      style={{ borderLeft: `2px solid ${slot.artistDecision === 'Accepted' ? 'rgba(16,185,129,0.5)' : slot.artistDecision === 'Declined' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}` }}>
      <div className="flex-1 min-w-0">
        <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">
          Artist #{slot.artistId}
          {slot.artistName ? ` · ${slot.artistName}` : ''}
        </p>
        <p className="text-saqqara-light/40 text-xs mt-0.5">{slot.serviceRequested}</p>
        {slot.feeCents && (
          <p className="text-saqqara-gold/60 text-xs mt-0.5">
            ${(slot.feeCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>

      <span className="px-2.5 py-1 rounded-full text-xs font-cinzel tracking-[0.06em] flex-shrink-0"
        style={{ background: decisionBg, color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.06)' }}>
        {slot.artistDecision}
      </span>
    </div>
  );
}
