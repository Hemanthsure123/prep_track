"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ImportStatus } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineSpinner } from "@/components/loading/InlineSpinner";
import { retryRow } from "@/app/_actions/csv-import";

import { CircularProgress } from "./CircularProgress";

type Props = {
  rowId: string;
  batchId: string;
  rowIndex: number;
  companyName: string;
  status: ImportStatus;
  errorMessage: string | null;
  publishedInterviewId: string | null;
  costUsd: number | null;
};

const STATUS_LABEL: Record<ImportStatus, string> = {
  QUEUED: "Queued",
  EXTRACTING: "Extracting…",
  READY_FOR_REVIEW: "Ready for review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  FAILED: "Failed",
};

export function CompanyCard({
  rowId,
  batchId,
  rowIndex,
  companyName,
  status,
  errorMessage,
  publishedInterviewId,
  costUsd,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [, setNonce] = useState(0);

  function onRetry() {
    startTransition(async () => {
      try {
        const result = await retryRow(rowId);
        if (!result.ok) toast.error(result.error);
        else {
          toast.success("Re-queued.");
          setNonce((n) => n + 1);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Retry failed.");
      }
    });
  }

  return (
    <Card className="gap-4">
      <div className="flex items-start gap-4">
        <CircularProgress status={status} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              #{rowIndex}
            </span>
            <h3 className="text-base font-semibold text-foreground truncate">
              {companyName}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {STATUS_LABEL[status]}
            {costUsd != null && status !== "QUEUED" && status !== "EXTRACTING"
              ? ` · ~$${costUsd.toFixed(3)}`
              : ""}
          </p>
        </div>
      </div>

      {status === "FAILED" && errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-2">
        {status === "READY_FOR_REVIEW" && (
          <Button
            size="sm"
            render={<Link href={`/admin/imports/${batchId}/${rowId}/review`} />}
          >
            Review →
          </Button>
        )}
        {status === "FAILED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={pending}
          >
            {pending ? <InlineSpinner className="mr-2" /> : null}
            Retry
          </Button>
        )}
        {status === "PUBLISHED" && publishedInterviewId && (
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href={`/admin/interviews/${publishedInterviewId}`} />
            }
          >
            View interview →
          </Button>
        )}
      </div>
    </Card>
  );
}
