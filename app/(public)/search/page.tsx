import { search } from "@/lib/queries/search";
import { CompanyCard } from "@/components/public/CompanyCard";
import { InterviewCard } from "@/components/public/InterviewCard";
import { SubTopicChip } from "@/components/public/SubTopicChip";
import { EmptyState } from "@/components/public/EmptyState";
import { Building2, Layers, Tag, Search } from "lucide-react";
import type { Metadata } from "next";

// Dynamic metadata configuration
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || "";
  
  if (!q.trim()) {
    return {
      title: "Search Experiences — PrepIntel",
      robots: { index: false, follow: true }, // Noindex empty search pages
    };
  }

  return {
    title: `Search Results for "${q}" — PrepIntel`,
    description: `Browse matching company profiles, candidate interview timelines, and core sub-topic questions matching the term: "${q}".`,
  };
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const queryClean = q.trim();

  const { companies, interviews, subTopics } = await search(queryClean, 10);

  // Calculate total matched count
  const totalMatches = companies.length + interviews.length + subTopics.length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search Result Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          {queryClean ? `Results for "${queryClean}"` : "Search Platform"}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
          {queryClean
            ? `Found ${totalMatches} total match${totalMatches === 1 ? "" : "es"} across companies, interview transcripts, and sub-topics.`
            : "Type a query in the top search bar to scan our entire interview question database."}
        </p>
      </div>

      {!queryClean ? (
        <EmptyState
          title="Start Your Search"
          description="Type keywords (like 'Google', 'SDE-2', or 'Dynamic Programming') in the header search input to explore."
          icon={Search}
        />
      ) : totalMatches === 0 ? (
        <EmptyState
          title={`No Results for "${queryClean}"`}
          description="We couldn't find any direct matches. Try looking up broader keywords, exploring our catalog, or adjusting spelling."
          icon={Search}
        />
      ) : (
        <div className="space-y-12">
          
          {/* 1. Companies Matched */}
          {companies.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                <Building2 className="w-4 h-4 text-primary" />
                Matched Companies ({companies.length})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((c) => {
                  const formattedCompany = {
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    logoUrl: c.logoUrl,
                    description: c.description,
                    websiteUrl: c.websiteUrl,
                    interviewCount: c._count?.interviews ?? 0,
                    roleLevelsCovered: [] as { id: string; name: string; slug: string }[],
                    mostRecentYear: null as number | null,
                  };

                  return (
                    <div key={c.id} className="h-full">
                      <CompanyCard company={formattedCompany} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Interviews Matched */}
          {interviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                <Layers className="w-4 h-4 text-primary" />
                Matched Interview Experiences ({interviews.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviews.map((interview) => (
                  <div key={interview.id} className="h-full">
                    <InterviewCard interview={interview} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Subtopics Matched */}
          {subTopics.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                <Tag className="w-4 h-4 text-primary" />
                Matched Preparation Concepts ({subTopics.length})
              </h3>
              
              <div className="bg-card border border-border p-5 rounded-lg flex flex-wrap gap-2.5">
                {subTopics.map((st) => (
                  <SubTopicChip
                    key={st.id}
                    name={st.name}
                    slug={st.slug}
                    topicAreaSlug={st.topicArea.slug}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
