"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FileTextIcon,
  LinkIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  deleteAssetAction,
  uploadAssetAction,
} from "@/app/_actions/asset-upload";
import { cn } from "@/lib/utils";

import { FieldHint } from "./FieldRow";
import type {
  CompanyOption,
  TopicOption,
  WizardValues,
} from "./types";

export function Step4ReviewAndSubmit({
  companies,
  topics,
  submitting,
  submitLabel,
  onSubmit,
}: {
  companies: CompanyOption[];
  topics: TopicOption[];
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void | Promise<void>;
}) {
  const {
    watch,
    formState: { isValid },
  } = useFormContext<WizardValues>();
  const values = watch();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Assets &amp; review</h2>
        <p className="text-muted-foreground text-sm">
          Upload prep PDFs and external links, then check the preview and
          submit.
        </p>
      </header>

      <Assets />

      <Separator />

      <Preview companies={companies} topics={topics} values={values} />

      <div className="flex items-center justify-end">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !isValid}
        >
          {submitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Submitting…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}

function Assets() {
  const { watch, setValue } = useFormContext<WizardValues>();
  const assets = watch("assets");
  const rounds = watch("rounds");

  const interviewFileAsset = assets.find(
    (a) => a.scope === "interview" && a.kind !== "external_link",
  );
  const externalLinks = assets.filter((a) => a.kind === "external_link");

  function setAssets(next: WizardValues["assets"]) {
    setValue("assets", next, { shouldDirty: true, shouldValidate: true });
  }

  function addExternalLink() {
    setAssets([
      ...assets,
      {
        scope: "interview",
        roundIndex: null,
        kind: "external_link",
        path: null,
        url: "",
        label: "",
      },
    ]);
  }

  function updateExternalLink(
    indexInExternal: number,
    patch: { url?: string; label?: string },
  ) {
    let cursor = 0;
    const next = assets.map((a) => {
      if (a.kind !== "external_link") return a;
      if (cursor++ !== indexInExternal) return a;
      return { ...a, ...patch };
    });
    setAssets(next);
  }

  function removeExternalLink(indexInExternal: number) {
    let cursor = 0;
    const next = assets.filter((a) => {
      if (a.kind !== "external_link") return true;
      return cursor++ !== indexInExternal;
    });
    setAssets(next);
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold">Interview-level prep file</h3>
        <FieldHint>
          Optional single PDF or DOCX, up to 10 MB. Uploads to Supabase Storage
          immediately.
        </FieldHint>
        <FileUploadRow
          prefix="interviews"
          existing={interviewFileAsset ?? null}
          onUploaded={(asset) => {
            setAssets([
              ...assets.filter(
                (a) => !(a.scope === "interview" && a.kind !== "external_link"),
              ),
              { ...asset, scope: "interview", roundIndex: null },
            ]);
          }}
          onCleared={() => {
            setAssets(
              assets.filter(
                (a) => !(a.scope === "interview" && a.kind !== "external_link"),
              ),
            );
          }}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Per-round files</h3>
        {rounds.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No rounds yet. Add some on step 2.
          </p>
        ) : (
          <div className="space-y-2">
            {rounds.map((r, idx) => {
              const existing = assets.find(
                (a) =>
                  a.scope === "round" &&
                  a.roundIndex === idx &&
                  a.kind !== "external_link",
              );
              return (
                <div
                  key={idx}
                  className="rounded-md border p-3 text-sm"
                >
                  <div className="mb-2 font-medium">
                    <span className="text-muted-foreground mr-2 font-mono">
                      #{idx + 1}
                    </span>
                    {r.roundName || `Round ${idx + 1}`}
                  </div>
                  <FileUploadRow
                    prefix="rounds"
                    existing={existing ?? null}
                    onUploaded={(asset) => {
                      setAssets([
                        ...assets.filter(
                          (a) =>
                            !(
                              a.scope === "round" &&
                              a.roundIndex === idx &&
                              a.kind !== "external_link"
                            ),
                        ),
                        { ...asset, scope: "round", roundIndex: idx },
                      ]);
                    }}
                    onCleared={() => {
                      setAssets(
                        assets.filter(
                          (a) =>
                            !(
                              a.scope === "round" &&
                              a.roundIndex === idx &&
                              a.kind !== "external_link"
                            ),
                        ),
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">External links</h3>
        <FieldHint>
          LeetCode lists, blog writeups, GitHub repos — anything that lives
          elsewhere.
        </FieldHint>
        {externalLinks.length > 0 ? (
          <div className="space-y-2">
            {externalLinks.map((link, i) => (
              <div
                key={`ext-${i}`}
                className="flex flex-wrap items-center gap-2 rounded-md border p-2"
              >
                <Input
                  placeholder="Label (e.g. LeetCode list)"
                  value={link.label ?? ""}
                  onChange={(e) =>
                    updateExternalLink(i, { label: e.target.value })
                  }
                  className="max-w-xs"
                />
                <Input
                  placeholder="https://…"
                  value={link.url}
                  onChange={(e) =>
                    updateExternalLink(i, { url: e.target.value })
                  }
                  className="min-w-[16rem] flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeExternalLink(i)}
                  aria-label="Remove link"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addExternalLink}
        >
          <PlusIcon className="size-4" />
          Add link
        </Button>
      </div>
    </section>
  );
}

function FileUploadRow({
  prefix,
  existing,
  onUploaded,
  onCleared,
}: {
  prefix: "interviews" | "rounds";
  existing: WizardValues["assets"][number] | null;
  onUploaded: (asset: WizardValues["assets"][number]) => void;
  onCleared: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", prefix);
      const { path, publicUrl } = await uploadAssetAction(formData);
      onUploaded({
        scope: prefix === "interviews" ? "interview" : "round",
        roundIndex: null,
        kind: "prep_pdf",
        path,
        url: publicUrl,
        label: file.name,
      });
      toast.success("Uploaded.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed.";
      toast.error(message);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleClear() {
    if (!existing) return;
    setBusy(true);
    try {
      if (existing.path) {
        await deleteAssetAction(existing.path).catch(() => {
          /* best-effort */
        });
      }
      onCleared();
    } finally {
      setBusy(false);
    }
  }

  if (existing) {
    return (
      <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
        <FileTextIcon className="size-4" />
        <a
          href={existing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate underline"
        >
          {existing.label || existing.path}
        </a>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={busy}
        >
          {busy ? <Loader2Icon className="size-4 animate-spin" /> : <Trash2Icon className="size-4" />}
          Remove
        </Button>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm",
        busy && "opacity-50",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        disabled={busy}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await handleFile(f);
        }}
      />
      {busy ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <UploadIcon className="size-4" />
      )}
      <span className="text-muted-foreground">
        {busy ? "Uploading…" : "Click to upload a PDF or DOCX"}
      </span>
    </label>
  );
}

function Preview({
  companies,
  topics,
  values,
}: {
  companies: CompanyOption[];
  topics: TopicOption[];
  values: WizardValues;
}) {
  const cmp = values.company;
  const company =
    cmp.mode === "existing"
      ? (companies.find((c) => c.id === cmp.companyId)?.name ??
        "(unknown company)")
      : `${cmp.data.name} (new)`;

  const topicNameById = new Map(topics.map((t) => [t.id, t.name]));

  return (
    <section className="space-y-4">
      <h3 className="font-semibold">Preview</h3>
      <Card>
        <CardHeader>
          <CardTitle>
            {company} · {values.interview.role || "(role)"}
          </CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">{values.interview.roleLevel}</Badge>
            <Badge variant="outline">
              {values.interview.season} {values.interview.year}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                values.interview.finalOutcome === "SELECTED" &&
                  "border-emerald-300",
                values.interview.finalOutcome === "REJECTED" &&
                  "border-red-300",
              )}
            >
              {values.interview.finalOutcome}
            </Badge>
            <Badge variant="outline">
              {values.interview.isOnCampus ? "On-campus" : "Off-campus"}
            </Badge>
          </div>
        </CardHeader>
        {values.interview.biggestTip ? (
          <CardContent className="text-sm">
            <p className="text-muted-foreground mb-1 text-xs uppercase">
              Biggest tip
            </p>
            <p className="whitespace-pre-wrap">{values.interview.biggestTip}</p>
          </CardContent>
        ) : null}
      </Card>

      <div className="space-y-3">
        {values.rounds.map((r, ri) => (
          <Card key={ri}>
            <CardHeader>
              <CardTitle className="text-base">
                <span className="text-muted-foreground mr-2 font-mono text-sm">
                  #{ri + 1}
                </span>
                {r.roundName || `Round ${ri + 1}`}
              </CardTitle>
              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                <Badge variant="secondary">{r.roundType}</Badge>
                <Badge variant="secondary">{r.mode}</Badge>
                <Badge variant="secondary">{r.outcome}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {r.questions.length === 0 ? (
                <p className="text-muted-foreground italic">
                  No questions in this round.
                </p>
              ) : (
                r.questions.map((q, qi) => (
                  <div
                    key={qi}
                    className="rounded-md border p-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        Q{qi + 1}
                      </Badge>
                      <span className="font-medium">
                        {q.title || "(untitled)"}
                      </span>
                      <Badge variant="secondary">{q.category}</Badge>
                      <Badge
                        className={cn(
                          q.difficulty === "EASY" &&
                            "bg-emerald-100 text-emerald-700",
                          q.difficulty === "MEDIUM" &&
                            "bg-amber-100 text-amber-700",
                          q.difficulty === "HARD" && "bg-red-100 text-red-700",
                        )}
                      >
                        {q.difficulty}
                      </Badge>
                    </div>
                    {q.topicIds.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {q.topicIds.map((id) => (
                          <Badge
                            key={id}
                            variant="outline"
                            className="text-xs"
                          >
                            {topicNameById.get(id) ?? id}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {values.assets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {values.assets.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  {a.kind === "external_link" ? (
                    <LinkIcon className="size-3" />
                  ) : (
                    <FileTextIcon className="size-3" />
                  )}
                  <span className="text-muted-foreground">
                    [{a.scope}
                    {a.roundIndex !== null && a.roundIndex !== undefined
                      ? ` #${a.roundIndex + 1}`
                      : ""}
                    ]
                  </span>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {a.label || a.url}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

    </section>
  );
}
