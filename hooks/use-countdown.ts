"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function compute(targetMs: number): CountdownTime {
  const diff = targetMs - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * Counts down to a target timestamp (ms).
 * Accepts a number rather than a Date so callers can pass a stable primitive —
 * new Date(str) produces a new object identity on every render which would
 * force a new subscription each cycle.
 */
export function useCountdown(targetMs: number | null): CountdownTime | null {
  // Cache the last snapshot so getSnapshot returns the same object reference
  // when nothing has changed. useSyncExternalStore uses Object.is to detect
  // changes — returning a new object each call causes infinite re-renders.
  const snapshotRef = useRef<CountdownTime | null>(null);

  // Memoized so useSyncExternalStore doesn't re-subscribe on every render
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (targetMs === null) return () => {};
      const id = setInterval(() => {
        onStoreChange();
        if (targetMs - Date.now() <= 0) clearInterval(id);
      }, 1000);
      return () => clearInterval(id);
    },
    [targetMs],
  );

  // Returns the cached ref unless the computed value has actually changed
  const getSnapshot = useCallback(() => {
    const next = targetMs !== null ? compute(targetMs) : null;
    const prev = snapshotRef.current;
    if (
      prev &&
      next &&
      prev.days === next.days &&
      prev.hours === next.hours &&
      prev.minutes === next.minutes &&
      prev.seconds === next.seconds
    ) {
      return prev;
    }
    snapshotRef.current = next;
    return next;
  }, [targetMs]);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
