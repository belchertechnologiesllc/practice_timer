import { useEffect, useRef } from 'react';

interface WakeLockSentinel {
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
}

interface WakeLockNavigator {
  wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinel> };
}

/** Keeps the screen from sleeping mid-countdown; re-acquires when the tab regains focus. */
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const nav = navigator as unknown as WakeLockNavigator;
    if (!nav.wakeLock) return;

    let cancelled = false;

    async function acquire() {
      if (!active || document.visibilityState !== 'visible') return;
      try {
        const sentinel = await nav.wakeLock.request('screen');
        if (cancelled) {
          void sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
      } catch {
        // Wake lock is best-effort (denied, unsupported, low battery, etc).
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') void acquire();
    }

    void acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [active]);
}
