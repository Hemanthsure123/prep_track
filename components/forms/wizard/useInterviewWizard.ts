"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFormContext, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { interviewFullCreateSchema } from "@/lib/validations/interview-full";

import { clearDraft, loadDraft, saveDraft } from "./storage";
import {
  TOTAL_STEPS,
  WizardMode,
  WizardStep,
  WizardValues,
  makeEmptyValues,
} from "./types";

const STEP_FIELDS: Record<WizardStep, ReadonlyArray<Path<WizardValues>>> = {
  1: ["company", "interview"],
  2: ["rounds"],
  3: ["rounds"],
  4: ["rounds", "assets"],
};

export type UseWizardOptions = {
  mode: WizardMode;
  initialValues?: WizardValues;
};

export function useInterviewWizardForm({
  mode,
  initialValues,
}: UseWizardOptions) {
  const form = useForm<WizardValues>({
    resolver: zodResolver(interviewFullCreateSchema),
    defaultValues: initialValues ?? makeEmptyValues(),
    mode: "onBlur",
    shouldUnregister: false,
  });

  const hasHydratedRef = useRef(false);

  // Restore draft on mount (create mode only).
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    if (mode !== "create") return;
    const draft = loadDraft();
    if (draft) {
      form.reset(draft, { keepDefaultValues: true });
    }
  }, [mode, form]);

  // Debounced autosave on form change (create mode only).
  useEffect(() => {
    if (mode !== "create") return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const subscription = form.watch((values) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveDraft(values as WizardValues);
      }, 800);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [mode, form]);

  return form;
}

export function useWizardNavigation(form: ReturnType<typeof useInterviewWizardForm>) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [maxStepReached, setMaxStepReached] = useState<WizardStep>(1);

  const validateStep = useCallback(
    async (step: WizardStep): Promise<boolean> => {
      const fields = STEP_FIELDS[step];
      return form.trigger(fields as Path<WizardValues>[]);
    },
    [form],
  );

  const goNext = useCallback(async () => {
    if (currentStep >= TOTAL_STEPS) return;
    const ok = await validateStep(currentStep);
    if (!ok) return;
    const next = (currentStep + 1) as WizardStep;
    setCurrentStep(next);
    setMaxStepReached((m) => (next > m ? next : m));
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => (s - 1) as WizardStep);
  }, [currentStep]);

  const goToStep = useCallback(
    async (target: WizardStep) => {
      if (target === currentStep) return;
      if (target < currentStep) {
        setCurrentStep(target);
        return;
      }
      // Forward jump: validate every intermediate step.
      for (let s = currentStep; s < target; s++) {
        const ok = await validateStep(s as WizardStep);
        if (!ok) {
          setCurrentStep(s as WizardStep);
          return;
        }
      }
      setCurrentStep(target);
      setMaxStepReached((m) => (target > m ? target : m));
    },
    [currentStep, validateStep],
  );

  return {
    currentStep,
    maxStepReached,
    goNext,
    goBack,
    goToStep,
  };
}

export function useWizardDraft(mode: WizardMode) {
  return useMemo(
    () => ({
      discardDraft: () => {
        if (mode === "create") clearDraft();
      },
    }),
    [mode],
  );
}

export function useWizardFormContext() {
  return useFormContext<WizardValues>();
}
