"use client";

import { InterviewDetail } from "@/lib/queries/interview-detail";
import { cn } from "@/lib/utils";
import { Clock, Users, Video } from "lucide-react";

type Round = InterviewDetail["rounds"][number];

export function ProcessStepper({ rounds }: { rounds: Round[] }) {
  const handleScroll = (roundNumber: number) => {
    const el = document.getElementById(`round-${roundNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const outcomeDot: Record<string, string> = {
    CLEARED: "bg-emerald-500 ring-emerald-500/20",
    REJECTED: "bg-rose-500 ring-rose-500/20",
    PENDING: "bg-amber-500 ring-amber-500/20",
    NO_SHOW: "bg-slate-400 ring-slate-400/20",
  };

  return (
    <div className="bg-card rounded-md border border-border p-6 shadow-sm no-print">
      <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-6">
        Interview Process Steps
      </h2>

      {/* Desktop view (horizontal) */}
      <div className="hidden md:flex items-center w-full relative pb-10">
        {rounds.map((round, index) => {
          const isLast = index === rounds.length - 1;
          const colorClass = outcomeDot[round.outcome] || "bg-slate-300";
          const displayName = round.roundName.replace(/Technical Round \d+: |Round \d+: /i, "");

          return (
            <div key={round.id} className="flex items-center flex-1 last:flex-initial">
              {/* Bubble & Tooltip wrapper */}
              <div className="relative group cursor-pointer" onClick={() => handleScroll(round.roundNumber)}>
                {/* Bubble */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-200",
                    "bg-foreground text-background hover:bg-primary hover:text-white hover:border-primary border-border"
                  )}
                >
                  {round.roundNumber}
                </div>

                {/* Outcome Indicator Dot */}
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-4 border-2 border-card",
                  colorClass
                )} />

                {/* Pure CSS Tooltip */}
                <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-foreground text-background text-xs rounded-md shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                  <p className="font-bold text-[12px] border-b border-background/10 pb-1 mb-1.5 leading-tight">
                    {round.roundName}
                  </p>
                  <div className="space-y-1 text-background/80 leading-normal">
                    <p className="flex items-center gap-1">
                      <span className="font-semibold text-background/60">Type:</span> {round.roundType.replace(/_/g, " ")}
                    </p>
                    {round.durationMinutes && (
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{round.durationMinutes} minutes</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1">
                      <Video className="w-3 h-3 text-primary" />
                      <span>{round.mode.replace(/_/g, " ")}</span>
                    </p>
                    {round.numInterviewers != null && (
                      <p className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        <span>{round.numInterviewers} interviewer(s)</span>
                      </p>
                    )}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground" />
                </div>

                {/* Title labels under step */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center w-24">
                  <p className="text-[11px] font-bold text-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    {round.roundType.replace(/_ROUND|_ASSESSMENT|TECHNICAL_/i, "")}
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 h-px mx-4 bg-border relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-foreground/10 rounded" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view (vertical list) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {rounds.map((round) => {
          const colorClass = outcomeDot[round.outcome] || "bg-slate-300";
          return (
            <button
              key={round.id}
              onClick={() => handleScroll(round.roundNumber)}
              className="flex items-center gap-3 text-left p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                  {round.roundNumber}
                </div>
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 border border-card",
                  colorClass
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">
                  {round.roundName}
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">
                  {[
                    round.roundType.replace(/_/g, " "),
                    round.durationMinutes ? `${round.durationMinutes}m` : null,
                    round.mode.replace(/_/g, " "),
                  ].filter(Boolean).join(" • ")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
