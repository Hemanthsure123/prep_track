"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import type { QuestionCategory } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
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

import type { TopicOption } from "./types";

export function TopicMultiSelect({
  topics,
  category,
  value,
  onChange,
  disabled,
}: {
  topics: TopicOption[];
  category: QuestionCategory;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const eligible = useMemo(
    () => topics.filter((t) => t.category === category),
    [topics, category],
  );

  const byId = useMemo(() => {
    const map = new Map<string, TopicOption>();
    for (const t of topics) map.set(t.id, t);
    return map;
  }, [topics]);

  const selected = value.map((id) => byId.get(id)).filter((t): t is TopicOption => Boolean(t));

  function toggle(id: string) {
    const next = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selected.map((t) => (
            <Badge
              key={t.id}
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {t.name}
              <button
                type="button"
                onClick={() => toggle(t.id)}
                aria-label={`Remove topic ${t.name}`}
                className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
                disabled={disabled}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-expanded={open}
              className="w-full justify-between font-normal"
              disabled={disabled}
            />
          }
        >
          <span className={cn(selected.length === 0 && "text-muted-foreground")}>
            {selected.length === 0
              ? `Pick topics (${category})…`
              : `${selected.length} selected`}
          </span>
          <ChevronsUpDownIcon className="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={`Search ${category} topics…`} />
            <CommandList>
              <CommandEmpty>No matching topic.</CommandEmpty>
              <CommandGroup>
                {eligible.map((t) => {
                  const isSelected = value.includes(t.id);
                  return (
                    <CommandItem
                      key={t.id}
                      value={t.name}
                      onSelect={() => toggle(t.id)}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 size-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {t.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
