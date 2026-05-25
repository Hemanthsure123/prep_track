"use client";

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { STEP_TITLES, TOTAL_STEPS, WizardStep } from "./types";

export function StepIndicator({
  current,
  maxReached,
  onJump,
}: {
  current: WizardStep;
  maxReached: WizardStep;
  onJump: (target: WizardStep) => void;
}) {
  return (
    <nav aria-label="Wizard progress">
      <ol className="flex items-center gap-2">
        {([1, 2, 3, 4] as const).map((step, idx) => {
          const isActive = step === current;
          const isComplete = step < current;
          const canJump = step <= maxReached;
          return (
            <li key={step} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canJump && onJump(step)}
                disabled={!canJump}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                  isActive &&
                    "border-foreground bg-foreground text-background",
                  !isActive && isComplete && "border-foreground/40",
                  !isActive && !isComplete && "text-muted-foreground",
                  !canJump && "cursor-not-allowed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border text-xs",
                    isActive && "border-background bg-background text-foreground",
                    !isActive && isComplete && "border-foreground/40",
                  )}
                >
                  {isComplete ? <CheckIcon className="size-3" /> : step}
                </span>
                <span className="hidden sm:inline">{STEP_TITLES[step]}</span>
              </button>
              {idx < TOTAL_STEPS - 1 ? (
                <span
                  aria-hidden="true"
                  className="bg-border h-px w-6 sm:w-10"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
