"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

type ApproachToggleProps = {
  children: React.ReactNode;
};

export function ApproachToggle({ children }: ApproachToggleProps) {
  const [showApproach, setShowApproach] = useState(false);

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <button
        onClick={() => setShowApproach(!showApproach)}
        className="flex items-center justify-between w-full py-2 text-sm font-bold text-brand-navy hover:text-brand-primary transition-colors focus:outline-none cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-primary" />
          <span>{showApproach ? "Hide Candidate's Approach" : "Show Candidate's Approach"}</span>
        </span>
        {showApproach ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {showApproach && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-brand-navy/[0.02] border rounded-2xl space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
