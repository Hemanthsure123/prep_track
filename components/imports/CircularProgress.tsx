"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { ImportStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

type Props = {
  status: ImportStatus;
  size?: number;
};

export function CircularProgress({ status, size = 56 }: Props) {
  const reduce = useReducedMotion();
  const stroke = 3;
  const radius = (size - stroke) / 2;

  if (status === "EXTRACTING") {
    return (
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        aria-label="Extracting"
      >
        <svg width={size} height={size} className="text-border">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
          />
        </svg>
        <motion.svg
          width={size}
          height={size}
          className="absolute inset-0 text-primary"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={`${radius * Math.PI * 0.6} ${radius * Math.PI * 2}`}
            strokeLinecap="round"
          />
        </motion.svg>
      </div>
    );
  }

  if (status === "QUEUED") {
    return (
      <div
        className="inline-flex items-center justify-center rounded-full border border-border text-muted-foreground"
        style={{ width: size, height: size }}
        aria-label="Queued"
      >
        <Clock className="size-5" />
      </div>
    );
  }

  if (status === "READY_FOR_REVIEW") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        )}
        style={{ width: size, height: size }}
        aria-label="Ready for review"
      >
        <Check className="size-6" strokeWidth={2.5} />
      </div>
    );
  }

  if (status === "APPROVED" || status === "PUBLISHED") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        )}
        style={{ width: size, height: size }}
        aria-label={status === "APPROVED" ? "Approved" : "Published"}
      >
        <CheckCircle2 className="size-6" strokeWidth={2.2} />
      </div>
    );
  }

  // FAILED
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "bg-destructive/15 text-destructive",
      )}
      style={{ width: size, height: size }}
      aria-label="Failed"
    >
      <AlertCircle className="size-6" strokeWidth={2.2} />
    </div>
  );
}
