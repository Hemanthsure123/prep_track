"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, History } from "lucide-react";

import { Card } from "@/components/ui/card";

const KEY = "recently-viewed-interviews";

type RecentInterview = {
  id: string;
  role: string;
  year: number;
  company: { name: string; slug: string; logoUrl: string | null };
  roleLevel: { name: string };
};

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentInterview[] | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    fetch(`/api/interviews/by-ids?ids=${encodeURIComponent(ids.join(","))}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: RecentInterview[]) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return null; // first render — server-rendered Suspense fallback handled it
  if (items.length === 0) return null; // empty → hide entirely, no noisy empty state

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Recently viewed
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/experiences/${it.id}`}
            className="block"
          >
            <Card size="sm" className="hover:border-primary/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-md border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {it.company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.company.logoUrl}
                      alt=""
                      className="size-7 object-contain"
                    />
                  ) : (
                    <Building2 className="size-4 text-muted-foreground/60" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {it.company.name} · {it.roleLevel.name}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {it.role}
                  </p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {it.year}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
