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
import { slugify } from "@/lib/slug";

import { FieldError } from "./FieldRow";
import type { CompanyOption, WizardValues } from "./types";

export function CompanyAutocomplete({
  companies,
}: {
  companies: CompanyOption[];
}) {
  const form = useFormContext<WizardValues>();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const company = form.watch("company");
  const error = form.formState.errors.company;

  const buttonLabel = (() => {
    if (company.mode === "existing") {
      if (!company.companyId) return "Select a company…";
      const match = companies.find((c) => c.id === company.companyId);
      return match?.name ?? "Select a company…";
    }
    return company.data.name
      ? `New: ${company.data.name}`
      : "Select a company…";
  })();

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();
  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(lowerQuery),
  );
  const exactMatch = companies.some(
    (c) => c.name.toLowerCase() === lowerQuery,
  );

  function pickExisting(c: CompanyOption) {
    form.setValue(
      "company",
      { mode: "existing", companyId: c.id },
      { shouldValidate: true, shouldDirty: true },
    );
    setOpen(false);
    setQuery("");
  }

  function createNew() {
    if (!trimmedQuery) return;
    form.setValue(
      "company",
      {
        mode: "new",
        data: {
          name: trimmedQuery,
          slug: slugify(trimmedQuery),
          logoUrl: null,
          websiteUrl: null,
          description: null,
        },
      },
      { shouldValidate: true, shouldDirty: true },
    );
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
          <span className={cn(!company.mode && "text-muted-foreground")}>
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
                  {filtered.map((c) => {
                    const isSelected =
                      company.mode === "existing" &&
                      company.companyId === c.id;
                    return (
                      <CommandItem
                        key={c.id}
                        value={c.name}
                        onSelect={() => pickExisting(c)}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span>{c.name}</span>
                        <span className="text-muted-foreground ml-auto font-mono text-xs">
                          {c.slug}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              {trimmedQuery && !exactMatch ? (
                <CommandGroup heading="Create">
                  <CommandItem onSelect={createNew}>
                    <PlusIcon className="mr-2 size-4" />
                    Create new company:&nbsp;
                    <span className="font-medium">“{trimmedQuery}”</span>
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error ? (
        <FieldError
          message={
            company.mode === "existing"
              ? (error as { companyId?: { message?: string } }).companyId
                  ?.message ?? "Pick or create a company."
              : "Provide a valid new company name."
          }
        />
      ) : null}
    </div>
  );
}
