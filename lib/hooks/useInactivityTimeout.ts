'use client';

import { useEffect, useRef, useCallback } from 'react';

const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;

export function useInactivityTimeout(
  onWarn: () => void,
  onTimeout: () => void,
  timeoutMs = 10 * 60 * 1000,   // 10 minutes
  warnMs   =  9 * 60 * 1000,    // warn at 9 minutes
) {
  const warnTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warned       = useRef(false);

  const reset = useCallback(() => {
    if (warnTimer.current)   clearTimeout(warnTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    warned.current = false;

    warnTimer.current = setTimeout(() => {
      warned.current = true;
      onWarn();
      logoutTimer.current = setTimeout(onTimeout, timeoutMs - warnMs);
    }, warnMs);
  }, [onWarn, onTimeout, timeoutMs, warnMs]);

  useEffect(() => {
    reset();
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (warnTimer.current)   clearTimeout(warnTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [reset]);
}
