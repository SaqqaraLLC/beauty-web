'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPost } from '@/lib/api';
import Navbar from '@/components/Navbar';

type ApprovalDecision = 'Pending' | 'Approved' | 'Rejected';
type BookingStatus    = 'Requested' | 'FullyApproved' | 'Rejected' | 'Completed' | 'Cancelled';

interface ArtistBooking {
  bookingId:       number;
  customerId:      number;
  artistId:        number;
  serviceId:       number;
  locationId:      number;
  startsAt:        string;
  endsAt:          string;
  status:          BookingStatus;
  artistApproval:  ApprovalDecision;
  locationApproval: ApprovalDecision;
  rejectionReason?: string;
  // optional enriched fields from backend
  customerName?:   string;
  serviceName?:    string;
  locationName?:   string;
}

const STATUS_STYLE: Record<BookingStatus, { label: string; color: string }> = {
  Requested:    { label: 'Requested',     color: 'rgba(59,130,246,0.2)'  },
  FullyApproved:{ label: 'Approved',      color: 'rgba(16,185,129,0.2)'  },
  Rejected:     { label: 'Rejected',      color: 'rgba(239,68,68,0.15)'  },
  Completed:    { label: 'Completed',     color: 'rgba(201,168,76,0.2)'  },
  Cancelled:    { label: 'Cancelled',     color: 'rgba(255,255,255,0.08)' },
};

type Filter = 'all' | 'pending' | 'upcoming' | 'completed';

export default function ArtistBookingsPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [bookings, setBookings] = useState<ArtistBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<Filter>('pending');
  const [acting,   setActing]   = useState<number | null>(null);

  useEffect(() => {
    if (!userLoading && user?.artistId) {
      apiGet(`/api/artists/${user.artistId}/bookings`)
        .then(setBookings)
        .catch(() => setBookings([]))
        .finally(() => setLoading(false));
    }
  }, [user, userLoading]);

  async function decide(bookingId: number, decision: 'approve' | 'reject') {
    setActing(bookingId);
    try {
      await apiPost(`/api/bookings/${bookingId}/${decision}`, {});
      const updated = await apiGet(`/api/artists/${user!.artistId}/bookings`);
      setBookings(updated);
    } catch {
      /* silent */
    } finally {
      setActing(null);
    }
  }

  const now = new Date();

  const filtered = bookings.filter(b => {
    if (filter === 'pending')   return b.artistApproval === 'Pending';
    if (filter === 'upcoming')  return b.status === 'FullyApproved' && new Date(b.startsAt) > now;
    if (filter === 'completed') return b.status === 'Completed';
    return true;
  });

  const counts = {
    pending:   bookings.filter(b => b.artistApproval === 'Pending').length,
    upcoming:  bookings.filter(b => b.status === 'FullyApproved' && new Date(b.startsAt) > now).length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    all:       bookings.length,
  };

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
            <p className="script text-saqqara-gold text-2xl mb-1">Your Schedule</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em]">My Bookings</h1>
            <p className="text-saqqara-light/35 text-xs mt-2">Manage client booking requests and your upcoming appointments</p>
          </div>

          {/* Filter tabs */}
          <div className="flex justify-center gap-1"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
            {(['pending', 'upcoming', 'completed', 'all'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-3 font-cinzel text-xs tracking-[0.1em] uppercase transition-all duration-200 capitalize relative"
                style={{
                  color:        filter === f ? '#C9A84C' : 'rgba(237,237,237,0.3)',
                  borderBottom: filter === f ? '0.5px solid #C9A84C' : '0.5px solid transparent',
                  marginBottom: '-0.5px',
                }}>
                {f}
                {counts[f] > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[0.6rem]"
                    style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                    {counts[f]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-2xl mb-3 text-saqqara-gold/30">✦</div>
                <p className="text-saqqara-light/30 text-xs">No bookings in this category</p>
              </div>
            ) : (
              filtered.map(b => (
                <BookingCard
                  key={b.bookingId}
                  booking={b}
                  acting={acting === b.bookingId}
                  onDecide={decide}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}

function BookingCard({
  booking,
  acting,
  onDecide,
}: {
  booking: ArtistBooking;
  acting:  boolean;
  onDecide: (id: number, d: 'approve' | 'reject') => void;
}) {
  const badge = STATUS_STYLE[booking.status] ?? { label: booking.status, color: 'rgba(255,255,255,0.06)' };
  const isPendingMyApproval = booking.artistApproval === 'Pending';

  const dateStr = new Date(booking.startsAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
  const timeStr = new Date(booking.startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  }) + ' → ' + new Date(booking.endsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="card space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {booking.customerName && (
              <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{booking.customerName}</p>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs font-cinzel tracking-[0.06em]"
              style={{ background: badge.color, color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.06)' }}>
              {badge.label}
            </span>
          </div>
          {booking.serviceName && (
            <p className="text-saqqara-gold/60 text-xs">{booking.serviceName}</p>
          )}
        </div>
        {isPendingMyApproval && (
          <span className="text-xs font-cinzel tracking-[0.08em] text-amber-400/80">Awaiting Your Approval</span>
        )}
      </div>

      {/* Details */}
      <div className="grid sm:grid-cols-2 gap-2">
        {[
          ['Date',     dateStr],
          ['Time',     timeStr],
          booking.locationName ? ['Location', booking.locationName] : null,
          booking.rejectionReason ? ['Rejection Reason', booking.rejectionReason] : null,
        ].filter(Boolean).map(([k, v]) => (
          <div key={k as string} className="flex flex-col gap-0.5">
            <span className="text-saqqara-light/30 text-[0.6rem] font-cinzel tracking-[0.12em] uppercase">{k}</span>
            <span className="text-saqqara-light/70 text-xs">{v}</span>
          </div>
        ))}
      </div>

      {/* Approval status row */}
      <div className="flex gap-4 text-xs" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
        <div className="flex flex-col gap-0.5">
          <span className="text-saqqara-light/25 text-[0.6rem] font-cinzel tracking-[0.12em] uppercase">Your Approval</span>
          <span className={booking.artistApproval === 'Approved' ? 'text-emerald-400' : booking.artistApproval === 'Rejected' ? 'text-red-400/70' : 'text-amber-400/70'}>
            {booking.artistApproval}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-saqqara-light/25 text-[0.6rem] font-cinzel tracking-[0.12em] uppercase">Location Approval</span>
          <span className={booking.locationApproval === 'Approved' ? 'text-emerald-400' : booking.locationApproval === 'Rejected' ? 'text-red-400/70' : 'text-amber-400/70'}>
            {booking.locationApproval}
          </span>
        </div>
      </div>

      {/* Actions */}
      {isPendingMyApproval && (
        <div className="flex gap-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
          <button
            onClick={() => onDecide(booking.bookingId, 'approve')}
            disabled={acting}
            className="btn btn-primary flex-1 disabled:opacity-40"
          >
            {acting ? '…' : 'Approve'}
          </button>
          <button
            onClick={() => onDecide(booking.bookingId, 'reject')}
            disabled={acting}
            className="btn btn-ghost flex-1 disabled:opacity-40"
            style={{ color: 'rgba(239,68,68,0.7)', borderColor: 'rgba(239,68,68,0.2)' }}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
