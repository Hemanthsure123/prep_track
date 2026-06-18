"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubTopicQuestionExpandableProps {
  children: React.ReactNode;
  questionCount: number;
}

export function SubTopicQuestionExpandable({
  children,
  questionCount,
}: SubTopicQuestionExpandableProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-extrabold border transition-all cursor-pointer h-8",
          isOpen
            ? "bg-foreground text-background border-foreground shadow-sm"
            : "bg-card hover:bg-secondary text-foreground border-border"
        )}
      >
        <FileText className="w-3.5 h-3.5 opacity-85 shrink-0" />
        <span>
          {isOpen ? "Hide exact question prompt" : `View exact question prompt (${questionCount})`}
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
      </button>

      {isOpen && (
        <div className="bg-secondary border border-border text-foreground p-4 md:p-5 rounded-md shadow-inner max-w-3xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest block mb-1">
            Exact Candidate Transcript / Code Prompt
          </div>
          <div className="bg-card p-4 rounded-md border border-border overflow-x-auto text-foreground prose dark:prose-invert max-w-none text-xs leading-relaxed font-mono">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
