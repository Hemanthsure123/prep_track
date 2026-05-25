"use client";

import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import {
  Difficulty,
  QuestionCategory,
  SolvedStatus,
} from "@prisma/client";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  FieldError,
  FieldHint,
  FieldLabel,
  FieldRow,
} from "./FieldRow";
import { TopicMultiSelect } from "./TopicMultiSelect";
import {
  makeEmptyQuestion,
  type TopicOption,
  type WizardValues,
} from "./types";

const CATEGORIES = Object.values(QuestionCategory);
const DIFFICULTIES = Object.values(Difficulty);
const SOLVED_STATUSES = Object.values(SolvedStatus);

const setValueAsOptionalInt = (raw: unknown) => {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export function Step3Questions({ topics }: { topics: TopicOption[] }) {
  const { watch } = useFormContext<WizardValues>();
  const rounds = watch("rounds");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Questions</h2>
        <p className="text-muted-foreground text-sm">
          Add questions to each round. Topic options are filtered by category.
          Rounds with zero questions are fine (e.g. HR).
        </p>
      </header>

      {rounds.map((r, roundIndex) => (
        <QuestionListForRound
          key={roundIndex}
          roundIndex={roundIndex}
          roundLabel={r.roundName || `Round ${roundIndex + 1}`}
          topics={topics}
        />
      ))}
    </div>
  );
}

function QuestionListForRound({
  roundIndex,
  roundLabel,
  topics,
}: {
  roundIndex: number;
  roundLabel: string;
  topics: TopicOption[];
}) {
  const { control } = useFormContext<WizardValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `rounds.${roundIndex}.questions` as const,
  });

  return (
    <section className="space-y-3 rounded-md border p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          <span className="text-muted-foreground mr-2 font-mono text-sm">
            #{roundIndex + 1}
          </span>
          {roundLabel}
        </h3>
        <span className="text-muted-foreground text-xs">
          {fields.length} question{fields.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="space-y-3">
        {fields.map((f, qIndex) => (
          <QuestionBlock
            key={f.id}
            roundIndex={roundIndex}
            questionIndex={qIndex}
            total={fields.length}
            topics={topics}
            onMoveUp={() => qIndex > 0 && move(qIndex, qIndex - 1)}
            onMoveDown={() =>
              qIndex < fields.length - 1 && move(qIndex, qIndex + 1)
            }
            onRemove={() => remove(qIndex)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(makeEmptyQuestion())}
      >
        <PlusIcon className="size-4" />
        Add question
      </Button>
    </section>
  );
}

function QuestionBlock({
  roundIndex,
  questionIndex,
  total,
  topics,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  roundIndex: number;
  questionIndex: number;
  total: number;
  topics: TopicOption[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WizardValues>();

  const basePath = `rounds.${roundIndex}.questions.${questionIndex}` as const;
  const qErrors =
    errors.rounds?.[roundIndex]?.questions?.[questionIndex];

  const category = watch(`${basePath}.category` as const);

  function handleCategoryChange(next: QuestionCategory) {
    const current = watch(`${basePath}.topicIds` as const);
    if (current && current.length > 0) {
      setValue(`${basePath}.topicIds` as const, [], {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.message(
        `Cleared ${current.length} topic${current.length === 1 ? "" : "s"} after category change.`,
      );
    }
    setValue(`${basePath}.category` as const, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            Q{questionIndex + 1}
          </Badge>
          <div className="min-w-0 flex-1">
            <Input
              placeholder="Question title"
              {...register(`${basePath}.title` as const)}
            />
            <FieldError message={qErrors?.title?.message} />
          </div>
          <Controller
            control={control}
            name={`${basePath}.category` as const}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) =>
                  handleCategoryChange(v as QuestionCategory)
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            control={control}
            name={`${basePath}.difficulty` as const}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex items-center gap-2"
              >
                {DIFFICULTIES.map((d) => (
                  <label
                    key={d}
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
                      d === "EASY" && "border-emerald-200",
                      d === "MEDIUM" && "border-amber-200",
                      d === "HARD" && "border-red-200",
                    )}
                  >
                    <RadioGroupItem value={d} />
                    <span>{d}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveUp}
              disabled={questionIndex === 0}
              aria-label="Move question up"
            >
              <ArrowUpIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveDown}
              disabled={questionIndex === total - 1}
              aria-label="Move question down"
            >
              <ArrowDownIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              aria-label="Delete question"
            >
              <Trash2Icon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Collapse question" : "Expand question"}
            >
              {open ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ChevronRightIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className={cn(!open && "hidden", "space-y-3")}>
          <div className="space-y-2">
            <FieldLabel required>Statement</FieldLabel>
            <Textarea
              rows={4}
              placeholder="Full problem statement…"
              {...register(`${basePath}.statement` as const)}
            />
            <FieldHint>Markdown supported.</FieldHint>
            <FieldError message={qErrors?.statement?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel required>Topics</FieldLabel>
            <Controller
              control={control}
              name={`${basePath}.topicIds` as const}
              render={({ field }) => (
                <TopicMultiSelect
                  topics={topics}
                  category={category}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <FieldError message={qErrors?.topicIds?.message} />
          </div>

          <div className="space-y-2">
            <FieldLabel optional>Approach</FieldLabel>
            <Textarea
              rows={4}
              placeholder="How you (or the panelist) approached this…"
              {...register(`${basePath}.approach` as const, {
                setValueAs: (v: string) => (v?.trim() ? v : null),
              })}
            />
            <FieldHint>Markdown supported.</FieldHint>
          </div>

          <FieldRow cols={3}>
            <div className="space-y-2">
              <FieldLabel optional>Time given (min)</FieldLabel>
              <Input
                type="number"
                min={0}
                {...register(`${basePath}.timeGivenMin` as const, {
                  setValueAs: setValueAsOptionalInt,
                })}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel optional>Time taken (min)</FieldLabel>
              <Input
                type="number"
                min={0}
                {...register(`${basePath}.timeTakenMin` as const, {
                  setValueAs: setValueAsOptionalInt,
                })}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel optional>Solved status</FieldLabel>
              <Controller
                control={control}
                name={`${basePath}.solvedStatus` as const}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOLVED_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </FieldRow>

          <FollowUpsField roundIndex={roundIndex} questionIndex={questionIndex} />

          <div className="space-y-2">
            <FieldLabel optional>Reference URL</FieldLabel>
            <Input
              type="url"
              placeholder="https://leetcode.com/problems/..."
              {...register(`${basePath}.referenceUrl` as const, {
                setValueAs: (v: string) => (v?.trim() ? v : null),
              })}
            />
            <FieldError message={qErrors?.referenceUrl?.message} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FollowUpsField({
  roundIndex,
  questionIndex,
}: {
  roundIndex: number;
  questionIndex: number;
}) {
  const { control, register, watch, setValue } = useFormContext<WizardValues>();
  const path =
    `rounds.${roundIndex}.questions.${questionIndex}.followUps` as const;
  const values = (watch(path) as string[] | undefined) ?? [];

  function add() {
    setValue(path, [...values, ""], { shouldDirty: true });
  }
  function removeAt(i: number) {
    setValue(
      path,
      values.filter((_, idx) => idx !== i),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  // Subscribe to control so RHF watches changes.
  void control;

  return (
    <div className="space-y-2">
      <FieldLabel optional>Follow-ups</FieldLabel>
      {values.length > 0 ? (
        <div className="space-y-2">
          {values.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="What if N is 10^9? What if memory is constrained?"
                {...register(`${path}.${i}` as const)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeAt(i)}
                aria-label="Remove follow-up"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <PlusIcon className="size-4" />
        Add follow-up
      </Button>
    </div>
  );
}
