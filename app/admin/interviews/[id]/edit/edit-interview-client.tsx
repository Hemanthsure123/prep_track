"use client";

import { updateFullInterview } from "@/app/_actions/interview";
import { InterviewWizard } from "@/components/forms/wizard/WizardShell";
import type {
  CompanyOption,
  TopicOption,
  WizardValues,
} from "@/components/forms/wizard/types";

export function EditInterviewClient({
  id,
  companies,
  topics,
  initialValues,
}: {
  id: string;
  companies: CompanyOption[];
  topics: TopicOption[];
  initialValues: WizardValues;
}) {
  return (
    <InterviewWizard
      mode="edit"
      companies={companies}
      topics={topics}
      initialValues={initialValues}
      cancelHref={`/admin/interviews/${id}`}
      onSubmit={async (values: WizardValues) => updateFullInterview(id, values)}
    />
  );
}
