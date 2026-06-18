"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Code2, MonitorPlay } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const ICONS = [BookOpen, Code2, MonitorPlay] as const;
const INTERVAL_MS = 500;

const SIZE_MAP = {
  sm: { icon: "h-6 w-6", text: "text-xs" },
  md: { icon: "h-10 w-10", text: "text-sm" },
  lg: { icon: "h-14 w-14", text: "text-base" },
};

type Props = {
  label?: string;
  size?: keyof typeof SIZE_MAP;
  className?: string;
};

export function IconSequenceLoader({
  label,
  size = "md",
  className,
}: Props) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const s = SIZE_MAP[size];

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ICONS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const ActiveIcon = ICONS[index];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <div className={cn("relative flex items-center justify-center", s.icon)}>
        {reduceMotion ? (
          <ActiveIcon className={cn("text-brand", s.icon)} aria-hidden />
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ActiveIcon className={cn("text-brand", s.icon)} aria-hidden />
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      {label && (
        <p className={cn("text-foreground-muted font-medium", s.text)}>
          {label}
        </p>
      )}
    </div>
  );
}
