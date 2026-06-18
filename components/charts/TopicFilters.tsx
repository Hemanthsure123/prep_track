"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface DropdownOption {
  id: string;
  name: string;
  count?: number;
}

interface TopicFiltersProps {
  topicAreas: DropdownOption[];
  subTopics: DropdownOption[];
  selectedTopicAreaId: string;
  selectedSubTopicId: string;
}

export function TopicFilters({
  topicAreas,
  subTopics,
  selectedTopicAreaId,
  selectedSubTopicId,
}: TopicFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTopicAreaChange = (topicAreaId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("topicAreaId", topicAreaId);
    params.delete("subTopicId"); // Clear subtopic selection on parent change
    router.push(`?${params.toString()}`);
  };

  const handleSubTopicChange = (subTopicId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("subTopicId", subTopicId);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-border bg-card p-5 dark:border-border dark:bg-card">
      {/* Topic Area Selection */}
      <div className="space-y-1.5">
        <label
          htmlFor="topic-area-select"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400"
        >
          Select Topic Area
        </label>
        <select
          id="topic-area-select"
          value={selectedTopicAreaId}
          onChange={(e) => handleTopicAreaChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {topicAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name} ({area.count || 0} coverages)
            </option>
          ))}
        </select>
      </div>

      {/* Subtopic Selection */}
      <div className="space-y-1.5">
        <label
          htmlFor="sub-topic-select"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400"
        >
          Select Subtopic Drill-down
        </label>
        <select
          id="sub-topic-select"
          value={selectedSubTopicId}
          onChange={(e) => handleSubTopicChange(e.target.value)}
          disabled={subTopics.length === 0}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {subTopics.length === 0 ? (
            <option value="">No subtopics in this area</option>
          ) : (
            subTopics.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.count || 0} mentions)
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
