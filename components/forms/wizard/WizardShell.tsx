"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InlineSpinner } from "@/components/loading/InlineSpinner";

import { Step1Interview } from "./Step1Interview";
import { Step2Rounds } from "./Step2Rounds";
import { Step3TopicCoverage } from "./Step3TopicCoverage";
import { Step4ReviewAndSubmit } from "./Step4ReviewAndSubmit";
import { StepIndicator } from "./StepIndicator";
import {
  useInterviewWizardForm,
  useWizardDraft,
  useWizardNavigation,
} from "./useInterviewWizard";
import type {
  CompanyOption,
  RoleLevelOption,
  TopicAreaOption,
  SubTopicOption,
  WizardMode,
  WizardStep,
  WizardValues,
} from "./types";
import { TOTAL_STEPS } from "./types";

export type InterviewWizardProps = {
  mode: WizardMode;
  initialValues?: WizardValues;
  companies: CompanyOption[];
  topicAreas: TopicAreaOption[];
  subTopics: SubTopicOption[];
  roleLevels: RoleLevelOption[];
  onSubmit: (values: WizardValues) => Promise<{ id: string }>;
  cancelHref: string;
  /** Optional banner shown above the wizard (e.g. for import-review mode). */
  banner?: { title: string; description?: string };
  /** Override the starting step. Defaults to 1; import-review usually passes 4. */
  initialStep?: WizardStep;
  /** Override the submit button label. */
  submitLabelOverride?: { idle: string; busy: string };
  /** Toast text after a successful submit. */
  successToast?: string;
  /** Where to navigate after a successful submit. */
  successHrefBuilder?: (id: string) => string;
};

export function InterviewWizard({
  mode,
  initialValues,
  companies,
  topicAreas,
  subTopics,
  roleLevels,
  onSubmit,
  cancelHref,
  banner,
  initialStep,
  submitLabelOverride,
  successToast,
  successHrefBuilder,
}: InterviewWizardProps) {
  const router = useRouter();
  const form = useInterviewWizardForm({ mode, initialValues });
  const nav = useWizardNavigation(form, { initialStep });
  const { discardDraft } = useWizardDraft(mode);
  const [submitting, setSubmitting] = useState(false);

  const idleLabel =
    submitLabelOverride?.idle ??
    (mode === "create"
      ? "Create interview"
      : mode === "edit"
        ? "Save changes"
        : "Approve & Publish");
  const busyLabel =
    submitLabelOverride?.busy ??
    (mode === "create"
      ? "Publishing interview…"
      : mode === "edit"
        ? "Saving changes…"
        : "Publishing…");

  async function handleSubmit() {
    const valid = await form.trigger();
    if (!valid) {
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const values = form.getValues();
      const { id } = await onSubmit(values);
      discardDraft();
      toast.success(
        successToast ??
          (mode === "create"
            ? "Interview created."
            : mode === "edit"
              ? "Interview updated."
              : "Interview approved & published."),
      );
      const href = successHrefBuilder
        ? successHrefBuilder(id)
        : `/admin/interviews/${id}`;
      router.push(href);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDiscard() {
    discardDraft();
    form.reset();
    toast.success("Draft cleared.");
    router.push(cancelHref);
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-1 flex-col gap-6 pb-24">
        {banner && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-amber-200">
            <Sparkles className="size-4 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">{banner.title}</p>
              {banner.description && (
                <p className="text-amber-900/80 dark:text-amber-200/80">
                  {banner.description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <StepIndicator
            current={nav.currentStep}
            maxReached={nav.maxStepReached}
            onJump={nav.goToStep}
          />
          {mode === "create" ? (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button type="button" variant="ghost" size="sm" />
                }
              >
                Discard draft
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard the draft?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anything you&apos;ve entered will be cleared from this
                    browser. Files already uploaded to storage will stay.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep editing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDiscard}>
                    Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>

        <div className="flex-1">
          {nav.currentStep === 1 ? (
            <Step1Interview companies={companies} roleLevels={roleLevels} />
          ) : null}
          {nav.currentStep === 2 ? <Step2Rounds /> : null}
          {nav.currentStep === 3 ? (
            <Step3TopicCoverage topicAreas={topicAreas} subTopics={subTopics} />
          ) : null}
          {nav.currentStep === 4 ? (
            <Step4ReviewAndSubmit
              companies={companies}
              topicAreas={topicAreas}
              subTopics={subTopics}
              submitting={submitting}
              submitLabel={idleLabel}
              onSubmit={handleSubmit}
            />
          ) : null}
        </div>

        <WizardFooter
          step={nav.currentStep}
          onBack={nav.goBack}
          onNext={nav.goNext}
          onSubmit={handleSubmit}
          submitting={submitting}
          idleLabel={idleLabel}
          busyLabel={busyLabel}
        />
      </div>
    </FormProvider>
  );
}

function WizardFooter({
  step,
  onBack,
  onNext,
  onSubmit,
  submitting,
  idleLabel,
  busyLabel,
}: {
  step: WizardStep;
  onBack: () => void;
  onNext: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
  submitting: boolean;
  idleLabel: string;
  busyLabel: string;
}) {
  return (
    <div className="bg-background fixed inset-x-0 bottom-0 z-40 border-t shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={step <= 1 || submitting}
        >
          Back
        </Button>
        <span className="text-muted-foreground text-sm">
          Step {step} of {TOTAL_STEPS}
        </span>
        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={onNext} disabled={submitting}>
            Next
          </Button>
        ) : (
          <Button type="button" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <InlineSpinner className="mr-2" />
                {busyLabel}
              </>
            ) : (
              idleLabel
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
