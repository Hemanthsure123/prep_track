/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Layers, Tag, Loader2, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  companies: any[];
  interviews: any[];
  subTopics: any[];
}

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ companies: [], interviews: [], subTopics: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle global "/" shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced query fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults({ companies: [], interviews: [], subTopics: [] });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Failed to fetch search results", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const allItems = [
    ...results.companies.map((c) => ({ type: "company", label: c.name, slug: c.slug, href: `/companies/${c.slug}` })),
    ...results.interviews.map((i) => ({ type: "interview", label: `${i.company.name} - ${i.role}`, id: i.id, href: `/experiences/${i.id}` })),
    ...results.subTopics.map((st) => ({ type: "subtopic", label: st.name, slug: st.slug, href: `/sub-topics/${st.slug}` })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < allItems.length) {
        const selected = allItems[activeIndex];
        router.push(selected.href);
        setIsOpen(false);
        setQuery("");
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setQuery("");
      }
    }
  };

  const handleResultClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  const hasResults = results.companies.length > 0 || results.interviews.length > 0 || results.subTopics.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm md:max-w-md">
      {/* Search Input field */}
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-foreground-subtle transition-colors group-focus-within:text-brand">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search companies, sub-topics, roles…"
          className="h-9 w-full rounded-md border border-border bg-background-elevated/80 pl-9 pr-9 text-sm text-foreground outline-none ring-0 transition-all placeholder:text-foreground-subtle focus-visible:border-brand focus-visible:bg-background-elevated focus-visible:ring-2 focus-visible:ring-brand/25"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-foreground-subtle" />
          ) : (
            <kbd className="hidden rounded border border-border bg-background-subtle px-1.5 py-0.5 font-sans text-[10px] font-medium text-foreground-subtle sm:inline-block">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200 max-h-[400px] overflow-y-auto">
          {loading && !hasResults ? (
            <div className="p-8 text-center text-xs text-brand-muted font-semibold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
              Searching database...
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-xs text-brand-muted font-semibold">
              No direct matches for &ldquo;{query}&rdquo;
              <div className="text-[10px] text-slate-400 font-medium mt-1">
                Press Enter to search everywhere
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-3">
              {/* Companies section */}
              {results.companies.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                    Companies
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {results.companies.map((c, i) => {
                      const absoluteIndex = i;
                      const active = activeIndex === absoluteIndex;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleResultClick(`/companies/${c.slug}`)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all",
                            active ? "bg-slate-100 text-brand-primary" : "text-brand-navy hover:bg-slate-50"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 opacity-75 shrink-0" />
                            {c.name}
                          </span>
                          {active && <CornerDownLeft className="w-3 h-3 text-slate-400 shrink-0 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interviews section */}
              {results.interviews.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                    Interviews
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {results.interviews.map((item, i) => {
                      const absoluteIndex = results.companies.length + i;
                      const active = activeIndex === absoluteIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(`/experiences/${item.id}`)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all",
                            active ? "bg-slate-100 text-brand-primary" : "text-brand-navy hover:bg-slate-50"
                          )}
                        >
                          <span className="flex items-center gap-2 line-clamp-1">
                            <Layers className="w-3.5 h-3.5 opacity-75 shrink-0" />
                            <span className="text-brand-muted font-semibold">{item.company.name}</span>
                            <span>{item.role}</span>
                          </span>
                          {active && <CornerDownLeft className="w-3 h-3 text-slate-400 shrink-0 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Subtopics section */}
              {results.subTopics.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                    Sub-topics
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {results.subTopics.map((st, i) => {
                      const absoluteIndex = results.companies.length + results.interviews.length + i;
                      const active = activeIndex === absoluteIndex;
                      return (
                        <button
                          key={st.id}
                          onClick={() => handleResultClick(`/sub-topics/${st.slug}`)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all",
                            active ? "bg-slate-100 text-brand-primary" : "text-brand-navy hover:bg-slate-50"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 opacity-75 shrink-0" />
                            <span>{st.name}</span>
                            <span className="text-[9px] text-brand-muted bg-slate-100 px-1 rounded font-medium">
                              {st.topicArea.name}
                            </span>
                          </span>
                          {active && <CornerDownLeft className="w-3 h-3 text-slate-400 shrink-0 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
