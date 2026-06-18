"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

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
import type { TopicAreaOption } from "./types";

export function TopicAreaAutocomplete({
  topicAreas,
  value,
  onChange,
  error,
}: {
  topicAreas: TopicAreaOption[];
  value: string;
  onChange: (topicAreaId: string) => void;
  error?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = topicAreas.find((ta) => ta.id === value);
  const buttonLabel = selected ? selected.name : "Select topic area…";

  const lowerQuery = query.trim().toLowerCase();
  const filtered = lowerQuery
    ? topicAreas.filter((ta) => ta.name.toLowerCase().includes(lowerQuery))
    : topicAreas;

  function pickExisting(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  const triggerDisabled = topicAreas.length === 0;

  return (
    <div className="space-y-1 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-expanded={open}
              disabled={triggerDisabled}
              className="w-full justify-between font-normal text-left h-9 disabled:opacity-50"
            />
          }
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {triggerDisabled
              ? "No topic areas configured"
              : buttonLabel}
          </span>
          <ChevronsUpDownIcon className="size-4 ml-2 opacity-50 shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search topic area…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {filtered.length === 0 ? (
                <CommandEmpty>
                  {topicAreas.length === 0
                    ? "No topic areas. Configure them in /admin/topic-areas."
                    : "No matches."}
                </CommandEmpty>
              ) : (
                <CommandGroup heading="Existing">
                  {filtered.map((ta) => {
                    const isSelected = value === ta.id;
                    return (
                      <CommandItem
                        key={ta.id}
                        value={ta.name}
                        onSelect={() => pickExisting(ta.id)}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span>{ta.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
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
