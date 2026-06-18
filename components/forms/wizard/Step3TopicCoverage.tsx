"use client";

import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { PlusIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FieldLabel, FieldError } from "./FieldRow";
import { SubTopicAutocomplete } from "./SubTopicAutocomplete";
import { TopicAreaAutocomplete } from "./TopicAreaAutocomplete";
import {
  makeEmptyTopicCoverage,
  makeEmptySubTopicEntry,
  type TopicAreaOption,
  type SubTopicOption,
  type WizardValues,
} from "./types";

export function Step3TopicCoverage({
  topicAreas,
  subTopics,
}: {
  topicAreas: TopicAreaOption[];
  subTopics: SubTopicOption[];
}) {
  const { control } = useFormContext<WizardValues>();
  const { fields: rounds } = useFieldArray({
    control,
    name: "rounds",
  });

  const [openRounds, setOpenRounds] = useState<Record<number, boolean>>({ 0: true });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Topic Coverage</h2>
        <p className="text-muted-foreground text-sm">
          Specify what topic areas and sub-topics were covered in each round.
        </p>
      </header>

      <div className="space-y-4">
        {rounds.map((round, roundIdx) => {
          const isOpen = !!openRounds[roundIdx];
          return (
            <Card key={round.id} className="border border-slate-200 shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors border-b text-left"
                onClick={() => setOpenRounds((prev) => ({ ...prev, [roundIdx]: !prev[roundIdx] }))}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    Round #{roundIdx + 1}
                  </Badge>
                  <span className="font-semibold text-slate-800">
                    {round.roundName || `Round ${roundIdx + 1}`}
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {round.roundType.toLowerCase().replace(/_/g, " ")}
                  </Badge>
                </div>
                {isOpen ? <ChevronDownIcon className="size-4 opacity-50" /> : <ChevronRightIcon className="size-4" />}
              </button>

              {isOpen && (
                <CardContent className="p-4 space-y-4">
                  <RoundTopicCoverages
                    roundIndex={roundIdx}
                    topicAreas={topicAreas}
                    subTopics={subTopics}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function RoundTopicCoverages({
  roundIndex,
  topicAreas,
  subTopics,
}: {
  roundIndex: number;
  topicAreas: TopicAreaOption[];
  subTopics: SubTopicOption[];
}) {
  const { control } = useFormContext<WizardValues>();
  const { fields: coverages, append, remove, move } = useFieldArray({
    control,
    name: `rounds.${roundIndex}.topicCoverages` as const,
  });

  return (
    <div className="space-y-4">
      {coverages.map((cov, covIdx) => (
        <TopicCoverageBlock
          key={cov.id}
          roundIndex={roundIndex}
          coverageIndex={covIdx}
          totalCoverages={coverages.length}
          topicAreas={topicAreas}
          subTopics={subTopics}
          onMoveUp={() => covIdx > 0 && move(covIdx, covIdx - 1)}
          onMoveDown={() => covIdx < coverages.length - 1 && move(covIdx, covIdx + 1)}
          onRemove={() => remove(covIdx)}
        />
      ))}

      {topicAreas.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full justify-center border-dashed border-2 opacity-50 mt-2 text-destructive"
        >
          No topic areas configured — set them up at /admin/topic-areas
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => append(makeEmptyTopicCoverage(coverages.length))}
          className="w-full justify-center border-dashed border-2 hover:bg-slate-50 mt-2"
        >
          <PlusIcon className="size-4 mr-2" />
          Add Topic Area
        </Button>
      )}
    </div>
  );
}

function TopicCoverageBlock({
  roundIndex,
  coverageIndex,
  totalCoverages,
  topicAreas,
  subTopics,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  roundIndex: number;
  coverageIndex: number;
  totalCoverages: number;
  topicAreas: TopicAreaOption[];
  subTopics: SubTopicOption[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { control, watch, setValue } = useFormContext<WizardValues>();
  const topicAreaId = watch(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.topicAreaId`);
  const subTopicCount = watch(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.subTopicCount`) || 0;

  const { fields: entries, append: appendEntry, remove: removeEntry, move: moveEntry } = useFieldArray({
    control,
    name: `rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries` as const,
  });

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Math.max(0, Math.min(50, parseInt(e.target.value) || 0));
    setValue(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.subTopicCount`, newCount, { shouldValidate: true });

    const currentLength = entries.length;
    if (newCount > currentLength) {
      for (let i = currentLength; i < newCount; i++) {
        appendEntry(makeEmptySubTopicEntry(i));
      }
    } else if (newCount < currentLength) {
      for (let i = currentLength - 1; i >= newCount; i--) {
        removeEntry(i);
      }
    }
  };

  const handleRemoveEntry = (entryIdx: number) => {
    removeEntry(entryIdx);
    const newCount = Math.max(0, subTopicCount - 1);
    setValue(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.subTopicCount`, newCount, { shouldValidate: true });
  };

  const handleTopicAreaChange = (newAreaId: string, onChange: (v: string) => void) => {
    const hasSelectedSubTopics = entries.some((e) => e.subTopicId);
    if (hasSelectedSubTopics) {
      const ok = window.confirm("Changing topic area will clear selected sub-topics — continue?");
      if (!ok) return;
    }
    onChange(newAreaId);
    setValue(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.subTopicCount`, 0);
    for (let i = entries.length - 1; i >= 0; i--) {
      removeEntry(i);
    }
  };

  return (
    <Card className="border border-slate-100 shadow-sm bg-white">
      <CardContent className="p-4 space-y-4">
        {/* Coverage Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <FieldLabel required>Topic Area</FieldLabel>
            <Controller
              control={control}
              name={`rounds.${roundIndex}.topicCoverages.${coverageIndex}.topicAreaId` as const}
              render={({ field, fieldState }) => (
                <TopicAreaAutocomplete
                  topicAreas={topicAreas}
                  value={field.value}
                  onChange={(val) => handleTopicAreaChange(val, field.onChange)}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="w-32">
            <FieldLabel required>Sub-Topics</FieldLabel>
            <Input
              type="number"
              min={0}
              max={50}
              value={subTopicCount}
              onChange={handleCountChange}
              disabled={!topicAreaId}
            />
          </div>

          <div className="flex items-end h-9 mt-6 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveUp}
              disabled={coverageIndex === 0}
              aria-label="Move coverage up"
            >
              <ArrowUpIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onMoveDown}
              disabled={coverageIndex === totalCoverages - 1}
              aria-label="Move coverage down"
            >
              <ArrowDownIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              aria-label="Remove topic coverage"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Entries List */}
        {topicAreaId && subTopicCount > 0 && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sub-Topic Entries ({entries.length})
            </p>
            <div className="space-y-3">
              {entries.map((entryField, entryIdx) => (
                <SubTopicEntryRow
                  key={entryField.id}
                  roundIndex={roundIndex}
                  coverageIndex={coverageIndex}
                  entryIndex={entryIdx}
                  totalEntries={entries.length}
                  topicAreaId={topicAreaId}
                  subTopics={subTopics}
                  onMoveUp={() => entryIdx > 0 && moveEntry(entryIdx, entryIdx - 1)}
                  onMoveDown={() => entryIdx < entries.length - 1 && moveEntry(entryIdx, entryIdx + 1)}
                  onRemove={() => handleRemoveEntry(entryIdx)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubTopicEntryRow({
  roundIndex,
  coverageIndex,
  entryIndex,
  totalEntries,
  topicAreaId,
  subTopics,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  roundIndex: number;
  coverageIndex: number;
  entryIndex: number;
  totalEntries: number;
  topicAreaId: string;
  subTopics: SubTopicOption[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<WizardValues>();
  const subTopicName = watch(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.subTopicName`);
  const exactQuestionText = watch(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.exactQuestionText`);

  const [showQuestion, setShowQuestion] = useState(!!exactQuestionText);

  const entryErrors = errors.rounds?.[roundIndex]?.topicCoverages?.[coverageIndex]?.entries?.[entryIndex];

  const handleSubTopicChange = (id: string, name: string) => {
    setValue(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.subTopicId`, id, { shouldValidate: true, shouldDirty: true });
    setValue(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.subTopicName`, name, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          ST #{entryIndex + 1}
        </Badge>

        <div className="flex-1 min-w-[200px]">
          <Controller
            control={control}
            name={`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.subTopicId` as const}
            render={({ field }) => (
              <SubTopicAutocomplete
                subTopics={subTopics}
                topicAreaId={topicAreaId}
                value={field.value}
                nameValue={subTopicName}
                onChange={handleSubTopicChange}
                error={entryErrors?.subTopicId?.message || entryErrors?.subTopicName?.message}
              />
            )}
          />
        </div>

        {!showQuestion && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowQuestion(true)}
            className="text-indigo-600 hover:text-indigo-700 text-xs"
          >
            + Add exact question
          </Button>
        )}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onMoveUp}
            disabled={entryIndex === 0}
            aria-label="Move sub-topic entry up"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onMoveDown}
            disabled={entryIndex === totalEntries - 1}
            aria-label="Move sub-topic entry down"
          >
            <ArrowDownIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Remove entry"
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      {showQuestion && (
        <div className="border-t border-slate-200/50 pt-2 space-y-2 pl-6 relative">
          <button
            type="button"
            onClick={() => {
              setShowQuestion(false);
              setValue(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.exactQuestionText`, "");
              setValue(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.referenceUrl`, "");
            }}
            className="absolute top-2 right-2 text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Remove question details
          </button>

          <div className="space-y-1">
            <FieldLabel optional>Exact Question Text</FieldLabel>
            <Textarea
              placeholder="Paste the coding prompt or questions asked..."
              rows={2}
              {...register(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.exactQuestionText` as const)}
            />
            <FieldError message={entryErrors?.exactQuestionText?.message} />
          </div>

          <div className="space-y-1">
            <FieldLabel optional>Reference URL</FieldLabel>
            <Input
              type="text"
              placeholder="https://leetcode.com/problems/..."
              {...register(`rounds.${roundIndex}.topicCoverages.${coverageIndex}.entries.${entryIndex}.referenceUrl` as const)}
            />
            <FieldError message={entryErrors?.referenceUrl?.message} />
          </div>
        </div>
      )}
    </div>
  );
}
