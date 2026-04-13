'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7044';

interface Reminder {
  reminderId: string;
  type: 'upcoming_booking' | 'checkin_due' | 'complete_service';
  title: string;
  body: string;
  bookingId: number;
  slotId?: number;
  startsAt: string;
  urgent: boolean;
  actionUrl: string;
}

const POLL_INTERVAL = 60_000; // re-check every 60s

export default function ReminderBanner() {
  const { user } = useCurrentUser();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/reminders`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data: Reminder[] = await res.json();
        setReminders(data);
      }
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    fetchReminders();
    const id = setInterval(fetchReminders, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchReminders]);

  const handleCheckin = async (r: Reminder) => {
    setActing(r.reminderId);
    try {
      const url = r.slotId
        ? `${API_URL}/api/company-bookings/slots/${r.slotId}/checkin`
        : `${API_URL}/api/bookings/${r.bookingId}/checkin`;
      await fetch(url, { method: 'POST', credentials: 'include' });
      setDismissed(prev => new Set([...prev, r.reminderId]));
      fetchReminders();
    } catch { /* silent */ }
    setActing(null);
  };

  const handleComplete = async (r: Reminder) => {
    setActing(r.reminderId);
    try {
      await fetch(`${API_URL}/api/bookings/${r.bookingId}/complete`, {
        method: 'POST', credentials: 'include',
      });
      setDismissed(prev => new Set([...prev, r.reminderId]));
      fetchReminders();
    } catch { /* silent */ }
    setActing(null);
  };

  const visible = reminders.filter(r => !dismissed.has(r.reminderId));
  if (!user || visible.length === 0) return null;

  // Show only the top reminder (most urgent first)
  const top = visible[0];

  const bgColor = top.urgent
    ? top.type === 'complete_service'
      ? 'rgba(16,185,129,0.08)'   // green tint for completion
      : 'rgba(220,38,38,0.08)'    // red tint for checkin
    : 'rgba(201,168,76,0.07)';    // gold tint for upcoming

  const borderColor = top.urgent
    ? top.type === 'complete_service' ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'
    : 'rgba(201,168,76,0.2)';

  const dotColor = top.urgent
    ? top.type === 'complete_service' ? '#10b981' : '#ef4444'
    : '#C9A84C';

  return (
    <div
      className="w-full px-4 py-2.5 flex items-center justify-between gap-4"
      style={{ background: bgColor, borderBottom: `0.5px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: dotColor }} />
        <div className="min-w-0">
          <span className="font-cinzel text-[0.65rem] tracking-[0.1em] text-saqqara-light/90 mr-2">
            {top.title}
          </span>
          <span className="text-saqqara-light/50 text-[0.65rem] font-cormorant truncate hidden sm:inline">
            {top.body}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {top.type === 'checkin_due' && (
          <button
            onClick={() => handleCheckin(top)}
            disabled={acting === top.reminderId}
            className="px-3 py-1 rounded-full text-[0.6rem] font-cinzel tracking-[0.1em] text-white transition-all disabled:opacity-50"
            style={{ background: 'rgba(220,38,38,0.7)', border: '0.5px solid rgba(248,113,113,0.4)' }}
          >
            {acting === top.reminderId ? '…' : 'Check In'}
          </button>
        )}

        {top.type === 'complete_service' && (
          <button
            onClick={() => handleComplete(top)}
            disabled={acting === top.reminderId}
            className="px-3 py-1 rounded-full text-[0.6rem] font-cinzel tracking-[0.1em] text-white transition-all disabled:opacity-50"
            style={{ background: 'rgba(16,185,129,0.7)', border: '0.5px solid rgba(52,211,153,0.4)' }}
          >
            {acting === top.reminderId ? '…' : 'Mark Complete'}
          </button>
        )}

        {top.type === 'upcoming_booking' && (
          <Link
            href={top.actionUrl}
            className="px-3 py-1 rounded-full text-[0.6rem] font-cinzel tracking-[0.1em] text-saqqara-gold transition-all"
            style={{ border: '0.5px solid rgba(201,168,76,0.3)' }}
          >
            View
          </Link>
        )}

        {visible.length > 1 && (
          <span className="text-saqqara-light/30 text-[0.6rem] font-cinzel">
            +{visible.length - 1} more
          </span>
        )}

        <button
          onClick={() => setDismissed(prev => new Set([...prev, top.reminderId]))}
          className="text-saqqara-light/25 hover:text-saqqara-light/60 transition-colors text-xs ml-1"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
