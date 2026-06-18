import { InterviewDetail } from "@/lib/queries/interview-detail";
import { Download, ExternalLink, FileText, FolderOpen } from "lucide-react";

type Asset = InterviewDetail["assets"][number];

export function AssetDownloads({
  interviewAssets,
  roundAssets,
}: {
  interviewAssets: Asset[];
  roundAssets: Asset[];
}) {
  const allAssets = [...interviewAssets, ...roundAssets];

  if (allAssets.length === 0) return null;

  return (
    <div className="bg-background rounded-lg border border-border p-5 md:p-6 hover:shadow-sm hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <FolderOpen className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-display">Shared Resources & Attachments</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4 font-medium leading-relaxed">
        Reference sheets, cheat sheets, prep guides, and external links attached to this experience.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {allAssets.map((asset) => {
          const isLink = asset.kind === "external_link";
          const filename = asset.url.split("/").pop()?.split("?")[0] || "File";

          return (
            <div
              key={asset.id}
              className="flex items-center justify-between p-3.5 rounded-[6px] border border-border bg-secondary/40 hover:bg-secondary/75 transition-colors gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[6px] bg-card border border-border flex items-center justify-center text-muted-foreground flex-shrink-0 shadow-sm">
                  {isLink ? (
                    <ExternalLink className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {asset.label || filename}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-xs">
                    {isLink ? "External URL Link" : filename}
                  </p>
                </div>
              </div>

              {isLink ? (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-card border border-border text-primary hover:bg-secondary shadow-sm transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href={asset.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-card border border-border text-emerald-500 hover:bg-secondary shadow-sm transition-colors flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
