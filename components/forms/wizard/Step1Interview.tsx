"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Branch,
  FinalOutcome,
  RoleLevel,
  Season,
} from "@prisma/client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { CompanyAutocomplete } from "./CompanyAutocomplete";
import { FieldError, FieldHint, FieldLabel, FieldRow } from "./FieldRow";
import type { CompanyOption, WizardValues } from "./types";

const ROLE_LEVELS = Object.values(RoleLevel);
const SEASONS = Object.values(Season);
const BRANCHES = Object.values(Branch);
const FINAL_OUTCOMES = Object.values(FinalOutcome);

const setValueAsOptionalInt = (raw: unknown) => {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const setValueAsOptionalFloat = (raw: unknown) => {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
};

export function Step1Interview({
  companies,
}: {
  companies: CompanyOption[];
}) {
  const {
    register,
    control,
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
            <Controller
              control={control}
              name="interview.roleLevel"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_LEVELS.map((rl) => (
                      <SelectItem key={rl} value={rl}>
                        {rl.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={interviewErrors?.roleLevel?.message} />
          </div>
        </FieldRow>

        <FieldRow cols={3}>
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
            <FieldLabel required>Season</FieldLabel>
            <Controller
              control={control}
              name="interview.season"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={interviewErrors?.season?.message} />
          </div>
          <div className="space-y-2">
            <FieldLabel>On-campus?</FieldLabel>
            <Controller
              control={control}
              name="interview.isOnCampus"
              render={({ field }) => (
                <label className="flex h-9 items-center gap-2 rounded-md border px-3">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                  <span className="text-sm">
                    {field.value ? "On-campus" : "Off-campus"}
                  </span>
                </label>
              )}
            />
          </div>
        </FieldRow>

        <FieldRow cols={3}>
          <div className="space-y-2">
            <FieldLabel htmlFor="source" optional>
              Source
            </FieldLabel>
            <Input
              id="source"
              placeholder="Campus drive, Referral, LinkedIn…"
              {...register("interview.source", {
                setValueAs: (v: string) => (v?.trim() ? v : null),
              })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="cgpaCutoff" optional>
              CGPA cutoff
            </FieldLabel>
            <Input
              id="cgpaCutoff"
              type="number"
              step="0.1"
              min={0}
              max={10}
              {...register("interview.cgpaCutoff", {
                setValueAs: setValueAsOptionalFloat,
              })}
            />
            <FieldError message={interviewErrors?.cgpaCutoff?.message} />
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
          <h2 className="text-lg font-semibold">Candidate profile</h2>
          <p className="text-muted-foreground text-sm">
            Captured now; shown to students later via a feature flag.
          </p>
        </header>

        <FieldRow cols={3}>
          <div className="space-y-2">
            <FieldLabel htmlFor="candidateCgpa" optional>
              CGPA
            </FieldLabel>
            <Input
              id="candidateCgpa"
              type="number"
              step="0.1"
              min={0}
              max={10}
              {...register("interview.candidateCgpa", {
                setValueAs: setValueAsOptionalFloat,
              })}
            />
            <FieldError message={interviewErrors?.candidateCgpa?.message} />
          </div>
          <div className="space-y-2">
            <FieldLabel optional>Branch</FieldLabel>
            <Controller
              control={control}
              name="interview.candidateBranch"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="candidateGradYear" optional>
              Graduation year
            </FieldLabel>
            <Input
              id="candidateGradYear"
              type="number"
              {...register("interview.candidateGradYear", {
                setValueAs: setValueAsOptionalInt,
              })}
            />
            <FieldError
              message={interviewErrors?.candidateGradYear?.message}
            />
          </div>
        </FieldRow>

        <div className="space-y-2">
          <FieldLabel htmlFor="candidateBackground" optional>
            Background
          </FieldLabel>
          <Textarea
            id="candidateBackground"
            rows={4}
            placeholder="Prior internships, projects, OSS, …"
            {...register("interview.candidateBackground", {
              setValueAs: (v: string) => (v?.trim() ? v : null),
            })}
          />
          <FieldHint>Markdown supported.</FieldHint>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Outcome</h2>
          <p className="text-muted-foreground text-sm">
            The final disposition and the one thing the candidate wishes
            they&apos;d known.
          </p>
        </header>

        <FieldRow cols={1}>
          <div className="space-y-2">
            <FieldLabel required>Final outcome</FieldLabel>
            <Controller
              control={control}
              name="interview.finalOutcome"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINAL_OUTCOMES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={interviewErrors?.finalOutcome?.message} />
          </div>
        </FieldRow>

        <div className="space-y-2">
          <FieldLabel htmlFor="biggestTip" optional>
            Biggest tip
          </FieldLabel>
          <Textarea
            id="biggestTip"
            rows={4}
            placeholder="The one thing you&apos;d tell yourself before this interview…"
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
