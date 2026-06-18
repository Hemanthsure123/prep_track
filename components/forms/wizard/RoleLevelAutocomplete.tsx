"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
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

import { FieldError } from "./FieldRow";
import type { RoleLevelOption, WizardValues } from "./types";

export function RoleLevelAutocomplete({
  roleLevels,
}: {
  roleLevels: RoleLevelOption[];
}) {
  const form = useFormContext<WizardValues>();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const roleLevelId = form.watch("interview.roleLevelId");
  const roleLevelName = form.watch("interview.roleLevelName");
  const error = form.formState.errors.interview;

  const buttonLabel = (() => {
    if (roleLevelId === "__new__") {
      return roleLevelName ? `New: ${roleLevelName}` : "Select a role level…";
    }
    if (!roleLevelId) return "Select a role level…";
    const match = roleLevels.find((rl) => rl.id === roleLevelId);
    return match?.name ?? "Select a role level…";
  })();

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();
  const filtered = roleLevels.filter((rl) =>
    rl.name.toLowerCase().includes(lowerQuery),
  );
  const exactMatch = roleLevels.some(
    (rl) => rl.name.toLowerCase() === lowerQuery,
  );

  function pickExisting(rl: RoleLevelOption) {
    form.setValue("interview.roleLevelId", rl.id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("interview.roleLevelName", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setOpen(false);
    setQuery("");
  }

  function createNew() {
    if (!trimmedQuery) return;
    form.setValue("interview.roleLevelId", "__new__", {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("interview.roleLevelName", trimmedQuery, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className={cn(!roleLevelId && "text-muted-foreground")}>
            {buttonLabel}
          </span>
          <ChevronsUpDownIcon className="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to search or create…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {trimmedQuery
                  ? "No matches. Use “Create new” below."
                  : "Start typing…"}
              </CommandEmpty>
              {filtered.length > 0 ? (
                <CommandGroup heading="Existing">
                  {filtered.map((rl) => {
                    const isSelected = roleLevelId === rl.id;
                    return (
                      <CommandItem
                        key={rl.id}
                        value={rl.name}
                        onSelect={() => pickExisting(rl)}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span>{rl.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              {trimmedQuery && !exactMatch ? (
                <CommandGroup heading="Create">
                  <CommandItem onSelect={createNew}>
                    <PlusIcon className="mr-2 size-4" />
                    Create new role level:&nbsp;
                    <span className="font-medium">“{trimmedQuery}”</span>
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error?.roleLevelId ? (
        <FieldError message={error.roleLevelId.message} />
      ) : null}
      {error?.roleLevelName ? (
        <FieldError message={error.roleLevelName.message} />
      ) : null}
    </div>
  );
}
