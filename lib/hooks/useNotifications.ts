'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { NotificationPayload } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unread,        setUnread]        = useState(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Load initial notifications
    fetch(`${API_URL}/api/notifications`, { credentials: 'include' })
      .then(r => r.json())
      .then((data: NotificationPayload[]) => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnread(data.filter(n => !n.isRead).length);
        }
      })
      .catch(() => {});

    // SSE for real-time
    const es = new EventSource(`${API_URL}/api/notifications/stream`, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const payload: NotificationPayload = JSON.parse(e.data);
        setNotifications(prev => [payload, ...prev]);
        setUnread(prev => prev + 1);
      } catch { /* ignore malformed */ }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [userId]);

  const markAllRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-read`, {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
  }, []);

  const markRead = useCallback(async (notificationId: number) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications(prev => prev.map(n => Number(n.notificationId) === notificationId ? { ...n, isRead: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  }, []);

  return { notifications, unread, markAllRead, markRead };
}
