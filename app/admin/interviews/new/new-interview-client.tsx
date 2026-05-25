"use client";

import { createFullInterview } from "@/app/_actions/interview";
import { InterviewWizard } from "@/components/forms/wizard/WizardShell";
import type {
  CompanyOption,
  TopicOption,
  WizardValues,
} from "@/components/forms/wizard/types";

export function NewInterviewClient({
  companies,
  topics,
}: {
  companies: CompanyOption[];
  topics: TopicOption[];
}) {
  return (
    <InterviewWizard
      mode="create"
      companies={companies}
      topics={topics}
      cancelHref="/admin/interviews"
      onSubmit={async (values: WizardValues) => createFullInterview(values)}
    />
  );
}
