"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search, RotateCcw, Filter, Check, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/public/EmptyState";
import type { TopicAreaFilterMeta } from "@/lib/queries/topic-area-detail";

export interface ExplorerItem {
  key: string;
  node: ReactNode;
  companySlug: string;
  roleLevelId: string;
  year: number;
  subTopicSlug: string;
  text: string; // pre-lowercased searchable blob
}

export function TopicQuestionExplorer({
  items,
  meta,
}: {
  items: ExplorerItem[];
  meta: TopicAreaFilterMeta;
}) {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Set<string>>(new Set());
  const [roleLevels, setRoleLevels] = useState<Set<string>>(new Set());
  const [years, setYears] = useState<Set<number>>(new Set());
  const [subTopic, setSubTopic] = useState<string>("");

  const toggle = <T,>(
    setter: React.Dispatch<React.SetStateAction<Set<T>>>,
    value: T,
  ) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (q && !it.text.includes(q)) return false;
      if (companies.size > 0 && !companies.has(it.companySlug)) return false;
      if (roleLevels.size > 0 && !roleLevels.has(it.roleLevelId)) return false;
      if (years.size > 0 && !years.has(it.year)) return false;
      if (subTopic && it.subTopicSlug !== subTopic) return false;
      return true;
    });
  }, [items, search, companies, roleLevels, years, subTopic]);

  const hasFilters =
    search.trim() !== "" ||
    companies.size > 0 ||
    roleLevels.size > 0 ||
    years.size > 0 ||
    subTopic !== "";

  const reset = () => {
    setSearch("");
    setCompanies(new Set());
    setRoleLevels(new Set());
    setYears(new Set());
    setSubTopic("");
  };

  return (
    <div className="space-y-6">
      {/* Filter panel */}
      <div className="bg-card border border-border rounded-lg p-5 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            Filter questions
          </h3>
          {hasFilters && (
            <Button
              onClick={reset}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Column label="Search question text">
            <div className="relative">
              <Search className="size-4 absolute inset-y-0 left-3 my-auto text-muted-foreground/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. indexing, JWT, rate limit…"
                className="w-full text-sm pl-9 pr-3 h-9 rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-colors"
              />
            </div>
          </Column>

          <Column label="Sub-topic concept">
            <select
              value={subTopic}
              onChange={(e) => setSubTopic(e.target.value)}
              className="w-full text-sm px-3 h-9 rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-colors"
            >
              <option value="">All sub-topics ({meta.subTopics.length})</option>
              {meta.subTopics.map((st) => (
                <option key={st.id} value={st.slug}>
                  {st.name} ({st.count})
                </option>
              ))}
            </select>
          </Column>
        </div>

        {meta.companies.length > 0 && (
          <Column label="Company">
            <ChipRow>
              {meta.companies.map((c) => (
                <Chip
                  key={c.id}
                  active={companies.has(c.slug)}
                  onClick={() => toggle(setCompanies, c.slug)}
                >
                  {companies.has(c.slug) && <Check className="size-3" />}
                  {c.name}
                </Chip>
              ))}
            </ChipRow>
          </Column>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          {meta.roleLevels.length > 0 && (
            <Column label="Role level">
              <ChipRow>
                {meta.roleLevels.map((rl) => (
                  <Chip
                    key={rl.id}
                    active={roleLevels.has(rl.id)}
                    onClick={() => toggle(setRoleLevels, rl.id)}
                  >
                    {roleLevels.has(rl.id) && <Check className="size-3" />}
                    {rl.name}
                  </Chip>
                ))}
              </ChipRow>
            </Column>
          )}
          {meta.years.length > 0 && (
            <Column label="Year">
              <ChipRow>
                {meta.years.map((y) => (
                  <Chip
                    key={y}
                    active={years.has(y)}
                    onClick={() => toggle(setYears, y)}
                  >
                    {y}
                  </Chip>
                ))}
              </ChipRow>
            </Column>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Showing {visible.length} of {items.length} question
        {items.length === 1 ? "" : "s"}
      </p>

      {/* Question list */}
      {visible.length === 0 ? (
        <EmptyState
          title="No questions match your filters"
          description="Try clearing a filter or broadening your search to see more candidate-reported questions."
          icon={HelpCircle}
        />
      ) : (
        <div className="space-y-5">
          {visible.map((it) => (
            <div key={it.key}>{it.node}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function Column({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground block">{label}</label>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-medium border transition-colors duration-200 cursor-pointer select-none",
        active
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-background hover:bg-secondary border-border text-foreground",
      )}
    >
      {children}
    </button>
  );
}
