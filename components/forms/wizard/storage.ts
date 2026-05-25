import type { WizardValues } from "./types";

const DRAFT_KEY = "interview-draft-v1";

export function loadDraft(): WizardValues | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WizardValues;
  } catch {
    return null;
  }
}

export function saveDraft(values: WizardValues): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // localStorage may be full or disabled; ignore.
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
