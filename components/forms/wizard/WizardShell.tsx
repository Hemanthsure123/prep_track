"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
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

import { Step1Interview } from "./Step1Interview";
import { Step2Rounds } from "./Step2Rounds";
import { Step3Questions } from "./Step3Questions";
import { Step4ReviewAndSubmit } from "./Step4ReviewAndSubmit";
import { StepIndicator } from "./StepIndicator";
import {
  useInterviewWizardForm,
  useWizardDraft,
  useWizardNavigation,
} from "./useInterviewWizard";
import type {
  CompanyOption,
  TopicOption,
  WizardMode,
  WizardStep,
  WizardValues,
} from "./types";
import { TOTAL_STEPS } from "./types";

export type InterviewWizardProps = {
  mode: WizardMode;
  initialValues?: WizardValues;
  companies: CompanyOption[];
  topics: TopicOption[];
  onSubmit: (values: WizardValues) => Promise<{ id: string }>;
  cancelHref: string;
};

export function InterviewWizard({
  mode,
  initialValues,
  companies,
  topics,
  onSubmit,
  cancelHref,
}: InterviewWizardProps) {
  const router = useRouter();
  const form = useInterviewWizardForm({ mode, initialValues });
  const nav = useWizardNavigation(form);
  const { discardDraft } = useWizardDraft(mode);
  const [submitting, setSubmitting] = useState(false);

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
        mode === "create" ? "Interview created." : "Interview updated.",
      );
      router.push(`/admin/interviews/${id}`);
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
            <Step1Interview companies={companies} />
          ) : null}
          {nav.currentStep === 2 ? <Step2Rounds /> : null}
          {nav.currentStep === 3 ? <Step3Questions topics={topics} /> : null}
          {nav.currentStep === 4 ? (
            <Step4ReviewAndSubmit
              companies={companies}
              topics={topics}
              submitting={submitting}
              submitLabel={
                mode === "create" ? "Create interview" : "Save changes"
              }
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
          submitLabel={
            mode === "create" ? "Create interview" : "Save changes"
          }
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
  submitLabel,
}: {
  step: WizardStep;
  onBack: () => void;
  onNext: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
  submitting: boolean;
  submitLabel: string;
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
            {submitting ? "Submitting…" : submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
