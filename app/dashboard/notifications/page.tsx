'use client';

import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useNotifications } from '@/lib/hooks/useNotifications';
import Navbar from '@/components/Navbar';

const EVENT_ICONS: Record<string, string> = {
  BookingRequest:         '📋',
  BookingAccepted:        '✅',
  BookingDeclined:        '❌',
  BookingCancelled:       '🚫',
  BookingCompleted:       '🎉',
  NewReview:              '⭐',
  RepresentationRequest:  '🤝',
  RepresentationAccepted: '✦',
  RepresentationDeclined: '✦',
  SystemMessage:          '📢',
};

export default function NotificationCenterPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { notifications, unread, markAllRead, markRead } = useNotifications(user?.id);

  if (userLoading) {
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
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="script text-saqqara-gold text-xl">Notifications</p>
              {unread > 0 && (
                <p className="text-saqqara-light/35 text-xs font-cinzel tracking-[0.08em]">{unread} unread</p>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} className="btn btn-ghost text-xs">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="card text-center py-16 space-y-3">
              <div className="text-2xl text-saqqara-gold/20">🔔</div>
              <p className="text-saqqara-light/25 text-xs font-cinzel tracking-[0.1em]">No notifications yet</p>
              <p className="text-saqqara-light/15 text-xs">We'll alert you when something important happens</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <button
                  key={n.notificationId}
                  type="button"
                  onClick={() => !n.isRead && markRead(Number(n.notificationId))}
                  className="w-full text-left card flex items-start gap-4 transition-all duration-200"
                  style={{ background: n.isRead ? undefined : 'rgba(201,168,76,0.04)' }}
                >
                  <span className="text-xl flex-shrink-0">{EVENT_ICONS[n.eventType] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-saqqara-light/75 text-xs leading-relaxed">{n.body}</p>
                    <time className="text-saqqara-light/25 text-[0.6rem] font-cinzel mt-1 block">
                      {new Date(n.createdAt).toLocaleString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </time>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: '#C9A84C' }} />
                  )}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
