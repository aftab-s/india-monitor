import { useEffect, useRef } from 'react';

/**
 * Custom hook to trigger a callback at a regular interval.
 * @param {Function} callback The function to call
 * @param {number} intervalMs The interval in milliseconds
 * @param {boolean} enabled Whether the auto-refresh is active
 */
export default function useAutoRefresh(callback, intervalMs = 60000, enabled = true) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
