'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/lib/hooks/useNotifications';
import type { NotificationPayload } from '@/lib/types';

interface Props {
  userId?: string;
}

const EVENT_ICONS: Record<string, string> = {
  BookingRequest:       '📋',
  BookingAccepted:      '✅',
  BookingDeclined:      '❌',
  BookingCancelled:     '🚫',
  BookingCompleted:     '🎉',
  NewReview:            '⭐',
  RepresentationRequest:'🤝',
  RepresentationAccepted:'✦',
  RepresentationDeclined:'✦',
  SystemMessage:        '📢',
};

function NotifItem({ n, onRead }: { n: NotificationPayload; onRead: (id: number) => void }) {
  const icon = EVENT_ICONS[n.eventType] ?? '🔔';
  return (
    <button
      type="button"
      onClick={() => !n.isRead && onRead(n.notificationId)}
      className="w-full text-left px-4 py-3 transition-colors duration-150 flex items-start gap-3"
      style={{
        background: n.isRead ? 'transparent' : 'rgba(201,168,76,0.04)',
        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
      }}
    >
      <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-saqqara-light/75 text-xs leading-snug">{n.message}</p>
        <time className="text-saqqara-light/25 text-[0.6rem] font-cinzel mt-0.5 block">
          {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </time>
      </div>
      {!n.isRead && (
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#C9A84C' }} />
      )}
    </button>
  );
}

export default function NotificationBell({ userId }: Props) {
  const { notifications, unread, markAllRead, markRead } = useNotifications(userId);
  const [open,    setOpen]    = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
        style={{ background: open ? 'rgba(201,168,76,0.1)' : 'transparent', border: '0.5px solid rgba(255,255,255,0.06)' }}
        aria-label="Notifications"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: unread > 0 ? '#C9A84C' : 'rgba(237,237,237,0.35)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[0.55rem] font-bold"
            style={{ background: '#C9A84C', color: '#080808' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 z-50 overflow-hidden"
          style={{
            background: 'rgba(13,13,13,0.98)',
            border: '0.5px solid rgba(201,168,76,0.15)',
            borderRadius: '1rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
            <span className="font-cinzel text-xs tracking-[0.1em] text-saqqara-light/60">Notifications</span>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-[0.6rem] font-cinzel text-saqqara-gold/60 hover:text-saqqara-gold transition-colors">
                  Mark all read
                </button>
              )}
              <Link href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-[0.6rem] font-cinzel text-saqqara-light/30 hover:text-saqqara-gold transition-colors">
                See all →
              </Link>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-saqqara-light/20 text-xs font-cinzel tracking-[0.08em]">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <NotifItem key={n.notificationId} n={n} onRead={markRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
