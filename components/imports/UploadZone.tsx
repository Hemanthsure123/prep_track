"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineSpinner } from "@/components/loading/InlineSpinner";
import {
  createImportBatch,
  processImportBatch,
} from "@/app/_actions/csv-import";
import {
  EXPECTED_HEADERS,
  validateRows,
  type CsvRowError,
  type ParsedCsvRow,
} from "@/lib/imports/csv-validate";
import { cn } from "@/lib/utils";

type Step = "upload" | "preview" | "cost" | "processing";

const ESTIMATED_INPUT_TOKENS_PER_ROW = 2500;
const ESTIMATED_OUTPUT_TOKENS_PER_ROW = 800;
// Gemini 2.5 Pro pricing (≤ 200K context).
const INPUT_COST_PER_MTOK = 1.25;
const OUTPUT_COST_PER_MTOK = 10.0;

export function UploadZone() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [filename, setFilename] = useState<string>("");
  const [rows, setRows] = useState<ParsedCsvRow[]>([]);
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [rowErrors, setRowErrors] = useState<CsvRowError[]>([]);
  const [, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please pick a .csv file.");
      return;
    }
    setFilename(file.name);
    Papa.parse<ParsedCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        if (result.errors.length > 0) {
          toast.error(
            `CSV parse error: ${result.errors[0].message ?? "unknown error"}`,
          );
          return;
        }
        const validation = validateRows(
          (result.meta.fields ?? []) as string[],
          result.data,
        );
        setHeaderErrors(validation.headerErrors);
        setRowErrors(validation.rowErrors);
        setRows(result.data);
        setStep("preview");
      },
      error: (err) => {
        toast.error(`Could not read CSV: ${err.message}`);
      },
    });
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setStep("upload");
    setRows([]);
    setRowErrors([]);
    setHeaderErrors([]);
    setFilename("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function confirmAndProcess() {
    setSubmitting(true);
    try {
      const { batchId } = await createImportBatch(filename, rows);
      setStep("processing");
      // Fire-and-await: the action processes all rows server-side, then returns.
      // For larger batches the client may time out before completion; in that
      // case the user lands on /admin/imports/[batchId] where polling picks up.
      startTransition(async () => {
        router.push(`/admin/imports/${batchId}`);
      });
      // Kick off processing in the background — don't await on the client
      // because Vercel HTTP can drop long-lived connections. The server action
      // itself drives the work to completion.
      processImportBatch(batchId).catch(() => {
        /* errors are surfaced via row.errorMessage; ignore here */
      });
      router.push(`/admin/imports/${batchId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create batch.");
      setSubmitting(false);
    }
  }

  const validRowCount = rows.length - rowErrors.length;
  const estimatedInputTokens = validRowCount * ESTIMATED_INPUT_TOKENS_PER_ROW;
  const estimatedOutputTokens = validRowCount * ESTIMATED_OUTPUT_TOKENS_PER_ROW;
  const estimatedCost =
    (estimatedInputTokens / 1_000_000) * INPUT_COST_PER_MTOK +
    (estimatedOutputTokens / 1_000_000) * OUTPUT_COST_PER_MTOK;
  const highCost = estimatedCost > 5;
  const canProceed = headerErrors.length === 0 && rowErrors.length === 0 && validRowCount > 0;

  return (
    <div className="space-y-6">
      <Stepper step={step} />

      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload your CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-10 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors",
              )}
            >
              <UploadCloud className="size-10 text-muted-foreground/60" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Drop a CSV here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  UTF-8, first row is header. Up to 200 rows per batch.
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border bg-secondary/50 p-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet className="size-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Don&apos;t have a CSV yet?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Download the template with two example rows.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={
                  <a href="/import-template.csv" download="import-template.csv" />
                }
              >
                <Download className="size-4" />
                Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "preview" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Preview &amp; validate</CardTitle>
            <Button variant="ghost" size="sm" onClick={reset}>
              Pick another file
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {filename} — {rows.length}{" "}
              {rows.length === 1 ? "row" : "rows"} parsed.
            </div>

            {headerErrors.length > 0 && (
              <ErrorList
                title="Column-header problems"
                items={headerErrors}
              />
            )}

            {rowErrors.length > 0 && (
              <ErrorList
                title="Per-row problems"
                items={rowErrors.map(
                  (e) =>
                    `Row ${e.rowIndex} (${e.companyName || "?"}): ${e.errors.join("; ")}`,
                )}
              />
            )}

            {rows.length > 0 && (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="min-w-full text-xs">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Company</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-left font-medium">Level</th>
                      <th className="px-3 py-2 text-left font-medium">Year</th>
                      <th className="px-3 py-2 text-left font-medium">Rounds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, i) => {
                      const rounds = [1, 2, 3, 4, 5].filter((n) => {
                        const c = r[`round_${n}_context`];
                        return c && c !== "NA" && c.trim() !== "";
                      }).length;
                      const hasErr = rowErrors.find((e) => e.rowIndex === i + 1);
                      return (
                        <tr
                          key={i}
                          className={cn(
                            "border-t border-border",
                            hasErr && "bg-destructive/5",
                          )}
                        >
                          <td className="px-3 py-2 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {r.company_name}
                          </td>
                          <td className="px-3 py-2">{r.role}</td>
                          <td className="px-3 py-2">{r.role_level}</td>
                          <td className="px-3 py-2">{r.year}</td>
                          <td className="px-3 py-2">{rounds}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {rows.length > 5 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                    Showing first 5 of {rows.length} rows.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
              <Button onClick={() => setStep("cost")} disabled={!canProceed}>
                Continue to cost preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "cost" && (
        <Card>
          <CardHeader>
            <CardTitle>Cost preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Rows to process" value={`${validRowCount}`} />
              <Stat
                label="Estimated input tokens"
                value={estimatedInputTokens.toLocaleString()}
              />
              <Stat
                label="Estimated output tokens"
                value={estimatedOutputTokens.toLocaleString()}
              />
              <Stat
                label="Estimated cost"
                value={`~$${estimatedCost.toFixed(2)}`}
                emphasis
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on Gemini 2.5 Pro pricing at $
              {INPUT_COST_PER_MTOK}/M input tokens, ${OUTPUT_COST_PER_MTOK}/M
              output tokens. Actual cost varies with the size of each row&apos;s
              round context. Processing runs server-side with a concurrency cap
              of 3 in-flight requests.
            </p>

            {highCost && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div className="text-xs">
                  This batch is estimated above $5. Double-check the row count
                  before proceeding.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("preview")}>
                Back
              </Button>
              <Button onClick={confirmAndProcess} disabled={submitting}>
                {submitting ? (
                  <>
                    <InlineSpinner className="mr-2" /> Starting…
                  </>
                ) : (
                  "Process batch"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "processing" && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <InlineSpinner className="size-6" />
            <p className="text-sm text-muted-foreground">
              Starting batch processing…
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items = [
    { key: "upload", label: "Upload" },
    { key: "preview", label: "Validate" },
    { key: "cost", label: "Cost preview" },
    { key: "processing", label: "Process" },
  ] as const;
  const activeIndex = items.findIndex((i) => i.key === step);
  return (
    <div className="flex items-center gap-2 text-xs">
      {items.map((it, idx) => {
        const done = idx < activeIndex;
        const active = idx === activeIndex;
        return (
          <div key={it.key} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center size-5 rounded-full border text-[10px] font-medium",
                done
                  ? "bg-primary text-primary-foreground border-primary"
                  : active
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground",
              )}
            >
              {idx + 1}
            </span>
            <span
              className={cn(
                active ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {it.label}
            </span>
            {idx < items.length - 1 && (
              <div className="w-8 h-px bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-base font-medium",
          emphasis ? "text-primary text-lg" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ErrorList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
      <p className="text-xs font-medium text-destructive">{title}</p>
      <ul className="text-xs text-destructive/90 list-disc list-inside space-y-0.5">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

// Re-export for backward compat
export { EXPECTED_HEADERS };
