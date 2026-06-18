"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  toggleFeatureFlag,
  updateFeatureFlagDescription,
} from "@/app/_actions/feature-flags";

type Flag = {
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
};

export function FeatureFlagsClient({ initialFlags }: { initialFlags: Flag[] }) {
  const [flags, setFlags] = useState<Flag[]>(initialFlags);
  const [pending, startTransition] = useTransition();

  function setFlagLocal(key: string, patch: Partial<Flag>) {
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  async function handleToggle(flag: Flag) {
    const nextValue = !flag.enabled;
    setFlagLocal(flag.key, { enabled: nextValue });
    startTransition(async () => {
      try {
        await toggleFeatureFlag({ key: flag.key, enabled: nextValue });
        toast.success(`${flag.key} → ${nextValue ? "ON" : "OFF"}`);
      } catch {
        setFlagLocal(flag.key, { enabled: flag.enabled });
        toast.error("Could not toggle flag.");
      }
    });
  }

  async function handleSaveDescription(flag: Flag, value: string) {
    if ((flag.description ?? "") === value) return;
    startTransition(async () => {
      try {
        await updateFeatureFlagDescription({
          key: flag.key,
          description: value.trim() === "" ? null : value,
        });
        setFlagLocal(flag.key, { description: value.trim() === "" ? null : value });
        toast.success("Description saved.");
      } catch {
        toast.error("Could not save description.");
      }
    });
  }

  if (flags.length === 0) {
    return (
      <Card className="py-12 text-center text-sm text-muted-foreground">
        No feature flags defined. Add some via Prisma seed or directly in the DB.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <FlagRow
          key={flag.key}
          flag={flag}
          pending={pending}
          onToggle={() => handleToggle(flag)}
          onSaveDescription={(value) => handleSaveDescription(flag, value)}
        />
      ))}
    </div>
  );
}

function FlagRow({
  flag,
  pending,
  onToggle,
  onSaveDescription,
}: {
  flag: Flag;
  pending: boolean;
  onToggle: () => void;
  onSaveDescription: (value: string) => void;
}) {
  const [description, setDescription] = useState(flag.description ?? "");

  return (
    <Card className="gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <code className="text-sm font-mono font-medium text-foreground">
            {flag.key}
          </code>
          <p className="text-xs text-muted-foreground">
            Last updated {new Date(flag.updatedAt).toLocaleString()}
          </p>
        </div>
        <ToggleSwitch
          checked={flag.enabled}
          disabled={pending}
          onChange={onToggle}
          label={`Toggle ${flag.key}`}
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this flag controls…"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSaveDescription(description)}
          disabled={pending || (flag.description ?? "") === description}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        } mt-px`}
      />
    </button>
  );
}
