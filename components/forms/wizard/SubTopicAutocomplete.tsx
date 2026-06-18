"use client";

import { useState, useMemo } from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SubTopicOption } from "./types";

export function SubTopicAutocomplete({
  subTopics,
  topicAreaId,
  value,
  nameValue,
  onChange,
  error,
}: {
  subTopics: SubTopicOption[];
  topicAreaId: string;
  value: string;
  nameValue?: string | null;
  onChange: (subTopicId: string, subTopicName: string) => void;
  error?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const hasValidArea = !!topicAreaId && topicAreaId !== "__new__";

  const filteredByArea = useMemo(
    () =>
      hasValidArea
        ? subTopics.filter((st) => st.topicAreaId === topicAreaId)
        : [],
    [subTopics, topicAreaId, hasValidArea]
  );

  const buttonLabel = (() => {
    if (value === "__new__") {
      return nameValue ? `New: ${nameValue}` : "Select a sub-topic…";
    }
    if (!value) return "Select a sub-topic…";
    const match = subTopics.find((st) => st.id === value);
    return match?.name ?? "Select a sub-topic…";
  })();

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();
  
  const filtered = useMemo(() => {
    return filteredByArea.filter((st) =>
      st.name.toLowerCase().includes(lowerQuery)
    );
  }, [filteredByArea, lowerQuery]);

  const exactMatch = useMemo(() => {
    return filteredByArea.some(
      (st) => st.name.toLowerCase() === lowerQuery
    );
  }, [filteredByArea, lowerQuery]);

  function pickExisting(st: SubTopicOption) {
    onChange(st.id, st.name);
    setOpen(false);
    setQuery("");
  }

  function createNew() {
    if (!trimmedQuery) return;
    onChange("__new__", trimmedQuery);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="space-y-1 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-expanded={open}
              disabled={!hasValidArea}
              className="w-full justify-between font-normal text-left h-9 disabled:opacity-50"
            />
          }
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {buttonLabel}
          </span>
          <ChevronsUpDownIcon className="size-4 ml-2 opacity-50 shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create sub-topic…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {!hasValidArea ? (
                <CommandEmpty>Select a topic area first.</CommandEmpty>
              ) : filtered.length === 0 && !trimmedQuery ? (
                <CommandEmpty>No sub-topics yet for this area.</CommandEmpty>
              ) : filtered.length === 0 ? (
                <CommandEmpty>No matches. Use &ldquo;Create new&rdquo; below.</CommandEmpty>
              ) : null}

              {hasValidArea && filtered.length > 0 && (
                <CommandGroup heading="Existing">
                  {filtered.map((st) => {
                    const isSelected = value === st.id;
                    return (
                      <CommandItem
                        key={st.id}
                        value={st.name}
                        onSelect={() => pickExisting(st)}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span>{st.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {hasValidArea && trimmedQuery && !exactMatch ? (
                <CommandGroup heading="Create">
                  <CommandItem onSelect={createNew}>
                    <PlusIcon className="mr-2 size-4" />
                    Create new sub-topic:&nbsp;
                    <span className="font-medium">“{trimmedQuery}”</span>
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
