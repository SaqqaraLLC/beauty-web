'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';
import type { CompanyBookingArtistSlot } from '@/lib/types';

interface RequestSlot extends CompanyBookingArtistSlot {
  bookingTitle:    string;
  companyName:     string;
  eventDate:       string;
  eventEndDate?:   string;
  location?:       string;
  ndaRequired:     boolean;
  companyBookingId: number;
}

export default function CompanyRequestsPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [slots,   setSlots]   = useState<RequestSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<number | null>(null);

  useEffect(() => {
    if (!userLoading && user?.artistId) {
      apiGet(`/api/artists/${user.artistId}/company-requests`)
        .then(setSlots)
        .catch(() => setSlots([]))
        .finally(() => setLoading(false));
    }
  }, [user, userLoading]);

  async function decide(slot: RequestSlot, decision: 'accept' | 'decline') {
    setActing(slot.slotId);
    try {
      await apiPost(`/api/company-bookings/${slot.companyBookingId}/slots/${slot.slotId}/${decision}`, {});
      setSlots(prev => prev.filter(s => s.slotId !== slot.slotId));
    } catch {
      /* silent — keep card visible */
    } finally {
      setActing(null);
    }
  }

  const pending   = slots.filter(s => s.artistDecision === 'Pending');
  const responded = slots.filter(s => s.artistDecision !== 'Pending');

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
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <p className="script text-saqqara-gold text-2xl mb-1">Incoming Requests</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">Company Booking Requests</h1>
            <p className="text-saqqara-light/35 text-xs mt-2">Review and respond to booking invitations from companies</p>
          </div>

          {/* Pending */}
          <section className="space-y-4">
            <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">
              Awaiting Your Response · {pending.length}
            </h2>

            {pending.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-2xl mb-3 text-saqqara-gold/30">✦</div>
                <p className="text-saqqara-light/30 text-xs">No pending requests</p>
              </div>
            ) : (
              pending.map(slot => (
                <RequestCard
                  key={slot.slotId}
                  slot={slot}
                  acting={acting === slot.slotId}
                  onDecide={decide}
                />
              ))
            )}
          </section>

          {/* Responded */}
          {responded.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">
                Already Responded · {responded.length}
              </h2>
              {responded.map(slot => (
                <RequestCard key={slot.slotId} slot={slot} responded />
              ))}
            </section>
          )}

        </div>
      </div>
    </>
  );
}

function RequestCard({
  slot,
  acting = false,
  responded = false,
  onDecide,
}: {
  slot: RequestSlot;
  acting?: boolean;
  responded?: boolean;
  onDecide?: (slot: RequestSlot, d: 'accept' | 'decline') => void;
}) {
  const decisionColor =
    slot.artistDecision === 'Accepted' ? 'text-emerald-400' :
    slot.artistDecision === 'Declined' ? 'text-red-400/70'  : '';

  return (
    <div className="card space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{slot.bookingTitle}</p>
          <p className="text-saqqara-gold/60 text-xs mt-0.5">{slot.companyName}</p>
        </div>
        {responded && (
          <span className={`text-xs font-cinzel tracking-[0.08em] ${decisionColor}`}>
            {slot.artistDecision}
          </span>
        )}
      </div>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-2">
        {[
          ['Event Date',  new Date(slot.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            + (slot.eventEndDate ? ` → ${new Date(slot.eventEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '')],
          slot.location ? ['Location', slot.location] : null,
          ['Service',    slot.serviceRequested],
          slot.feeCents  ? ['Proposed Fee', `$${(slot.feeCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`] : null,
          slot.ndaRequired ? ['NDA', 'Required'] : null,
        ].filter(Boolean).map(([k, v]) => (
          <div key={k as string} className="flex flex-col gap-0.5">
            <span className="text-saqqara-light/30 text-[0.6rem] font-cinzel tracking-[0.12em] uppercase">{k}</span>
            <span className="text-saqqara-light/70 text-xs">{v}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {!responded && onDecide && (
        <div className="flex gap-3 pt-1" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => onDecide(slot, 'accept')}
            disabled={acting}
            className="btn btn-primary flex-1 disabled:opacity-40"
          >
            {acting ? '…' : 'Accept'}
          </button>
          <button
            onClick={() => onDecide(slot, 'decline')}
            disabled={acting}
            className="btn btn-ghost flex-1 disabled:opacity-40"
            style={{ color: 'rgba(239,68,68,0.7)', borderColor: 'rgba(239,68,68,0.2)' }}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
