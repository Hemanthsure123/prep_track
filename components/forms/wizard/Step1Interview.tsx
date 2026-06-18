"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { RoleLevelAutocomplete } from "./RoleLevelAutocomplete";
import { FieldError, FieldHint, FieldLabel, FieldRow } from "./FieldRow";
import type { CompanyOption, RoleLevelOption, WizardValues } from "./types";

const setValueAsOptionalInt = (raw: unknown) => {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export function Step1Interview({
  companies,
  roleLevels,
}: {
  companies: CompanyOption[];
  roleLevels: RoleLevelOption[];
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<WizardValues>();
  const interviewErrors = errors.interview;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Company & role</h2>
          <p className="text-muted-foreground text-sm">
            Who interviewed for what.
          </p>
        </header>

        <div className="space-y-2">
          <FieldLabel required>Company</FieldLabel>
          <CompanyAutocomplete companies={companies} />
          <FieldHint>
            Pick one from the seeded list, or type a new name to create it on
            submit.
          </FieldHint>
        </div>

        <FieldRow cols={2}>
          <div className="space-y-2">
            <FieldLabel htmlFor="role" required>
              Role
            </FieldLabel>
            <Input
              id="role"
              autoComplete="off"
              placeholder="Software Engineer Intern"
              {...register("interview.role")}
            />
            <FieldError message={interviewErrors?.role?.message} />
          </div>
          <div className="space-y-2">
            <FieldLabel required>Role level</FieldLabel>
            <RoleLevelAutocomplete roleLevels={roleLevels} />
            <FieldHint>
              Pick one from the list, or type to create a new role level.
            </FieldHint>
          </div>
        </FieldRow>

        <FieldRow cols={2}>
          <div className="space-y-2">
            <FieldLabel htmlFor="year" required>
              Year
            </FieldLabel>
            <Input
              id="year"
              type="number"
              inputMode="numeric"
              {...register("interview.year", { valueAsNumber: true })}
            />
            <FieldError message={interviewErrors?.year?.message} />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="totalSelected" optional>
              Total selected
            </FieldLabel>
            <Input
              id="totalSelected"
              type="number"
              min={0}
              {...register("interview.totalSelected", {
                setValueAs: setValueAsOptionalInt,
              })}
            />
            <FieldError message={interviewErrors?.totalSelected?.message} />
          </div>
        </FieldRow>
      </section>

      <Separator />

      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Tip & Takeaways</h2>
          <p className="text-muted-foreground text-sm">
            What is the one thing you would tell yourself before this interview?
          </p>
        </header>

        <div className="space-y-2">
          <FieldLabel htmlFor="biggestTip" optional>
            Biggest tip
          </FieldLabel>
          <Textarea
            id="biggestTip"
            rows={6}
            placeholder="Think aloud, explain space complexity, name variables descriptively..."
            {...register("interview.biggestTip", {
              setValueAs: (v: string) => (v?.trim() ? v : null),
            })}
          />
          <FieldHint>Markdown supported.</FieldHint>
        </div>
      </section>
    </div>
  );
}
