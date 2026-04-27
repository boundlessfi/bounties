"use client";

import { useState, useEffect } from "react";

/**
 * Returns whether the given deadline has passed, updating every 10 s.
 * Initializes as `false` (not `Date.now()`) to avoid SSR/client hydration
 * mismatches — the real value is set on mount.
 */
export function useDeadlinePassed(
  deadline: string | null | undefined,
): boolean {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const check = () => setPassed(Date.now() > new Date(deadline).getTime());
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, [deadline]);

  return passed;
}
