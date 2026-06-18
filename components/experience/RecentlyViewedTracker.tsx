"use client";

import { useEffect } from "react";

const KEY = "recently-viewed-interviews";
const MAX = 10;

export function RecentlyViewedTracker({ interviewId }: { interviewId: string }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      const filtered = list.filter((id) => id !== interviewId);
      filtered.unshift(interviewId);
      localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, MAX)));
    } catch {
      // localStorage might be unavailable (SSR / private mode); skip silently.
    }
  }, [interviewId]);

  return null;
}
