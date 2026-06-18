"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type StatusCounts = Record<string, number>;

type Props = {
  batchId: string;
  initialCounts: StatusCounts;
};

const TERMINAL = ["PUBLISHED", "APPROVED", "FAILED", "READY_FOR_REVIEW"];

export function BatchPoller({ batchId, initialCounts }: Props) {
  const router = useRouter();
  const lastSignatureRef = useRef(JSON.stringify(initialCounts));

  useEffect(() => {
    // Decide whether to poll: any QUEUED or EXTRACTING means work is in flight.
    function shouldKeepPolling(counts: StatusCounts) {
      const queued = counts["QUEUED"] ?? 0;
      const extracting = counts["EXTRACTING"] ?? 0;
      return queued + extracting > 0;
    }
    if (!shouldKeepPolling(initialCounts)) return;

    let active = true;
    const intervalId = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/imports/${batchId}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { counts: StatusCounts };
        const sig = JSON.stringify(data.counts);
        if (sig !== lastSignatureRef.current) {
          lastSignatureRef.current = sig;
          router.refresh();
        }
        if (!shouldKeepPolling(data.counts)) {
          window.clearInterval(intervalId);
          active = false;
        }
      } catch {
        // network blip — keep polling
      }
    }, 3000);

    return () => {
      if (active) window.clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  // Surface terminal counts to satisfy unused-var lint
  void TERMINAL;
  return null;
}
