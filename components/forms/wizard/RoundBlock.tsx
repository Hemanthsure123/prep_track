"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Trash2Icon,
} from "lucide-react";
import {
  InterviewMode,
  RoundOutcome,
  RoundType,
} from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { FieldError, FieldHint, FieldLabel, FieldRow } from "./FieldRow";
import type { WizardValues } from "./types";

const ROUND_TYPES = Object.values(RoundType);
const ROUND_MODES = Object.values(InterviewMode);
const ROUND_OUTCOMES = Object.values(RoundOutcome);

const setValueAsOptionalInt = (raw: unknown) => {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export function RoundBlock({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  defaultOpen,
}: {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<WizardValues>();
  const roundErrors = errors.rounds?.[index];

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            #{index + 1}
          </Badge>
          <div className="min-w-0 flex-1">
            <Input
              placeholder="Round name (e.g. Tech 1 — DSA)"
              {...register(`rounds.${index}.roundName` as const)}
            />
            <FieldError message={roundErrors?.roundName?.message} />
          </div>
          <Controller
            control={control}
            name={`rounds.${index}.roundType` as const}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROUND_TYPES.map((rt) => (
                    <SelectItem key={rt} value={rt}>
                      {rt.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveUp}
              disabled={index === 0}
              aria-label="Move round up"
            >
              <ArrowUpIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveDown}
              disabled={index === total - 1}
              aria-label="Move round down"
            >
              <ArrowDownIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              aria-label="Delete round"
            >
              <Trash2Icon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Collapse round" : "Expand round"}
            >
              {open ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ChevronRightIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className={cn(!open && "hidden", "space-y-4")}>
          <FieldRow cols={3}>
            <div className="space-y-2">
              <FieldLabel optional>Duration (minutes)</FieldLabel>
              <Input
                type="number"
                min={0}
                {...register(`rounds.${index}.durationMinutes` as const, {
                  setValueAs: setValueAsOptionalInt,
                })}
              />
              <FieldError
                message={roundErrors?.durationMinutes?.message}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel required>Mode</FieldLabel>
              <Controller
                control={control}
                name={`rounds.${index}.mode` as const}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUND_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={roundErrors?.mode?.message} />
            </div>
            <div className="space-y-2">
              <FieldLabel optional># Interviewers</FieldLabel>
              <Input
                type="number"
                min={0}
                {...register(`rounds.${index}.numInterviewers` as const, {
                  setValueAs: setValueAsOptionalInt,
                })}
              />
              <FieldError
                message={roundErrors?.numInterviewers?.message}
              />
            </div>
          </FieldRow>

          <FieldRow cols={2}>
            <div className="space-y-2">
              <FieldLabel optional>Interview style</FieldLabel>
              <Input
                placeholder="Friendly / Stress / Whiteboard / etc."
                {...register(`rounds.${index}.interviewStyle` as const, {
                  setValueAs: (v: string) => (v?.trim() ? v : null),
                })}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel required>Outcome</FieldLabel>
              <Controller
                control={control}
                name={`rounds.${index}.outcome` as const}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUND_OUTCOMES.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={roundErrors?.outcome?.message} />
            </div>
          </FieldRow>

          <div className="space-y-2">
            <FieldLabel optional>Key learnings</FieldLabel>
            <Textarea
              rows={3}
              placeholder="What stood out, what you&apos;d do differently…"
              {...register(`rounds.${index}.keyLearnings` as const, {
                setValueAs: (v: string) => (v?.trim() ? v : null),
              })}
            />
            <FieldHint>Markdown supported.</FieldHint>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
