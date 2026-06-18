/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CompanyCard } from "./CompanyCard";

interface FeaturedCompaniesRowProps {
  companies: any[];
}

export function FeaturedCompaniesRow({ companies }: FeaturedCompaniesRowProps) {
  if (companies.length === 0) return null;

  return (
    <section className="border-b border-border bg-background-subtle py-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Featured companies
            </h2>
            <p className="text-sm text-foreground-muted">
              Top hiring companies with the most robust interview coverage on
              the platform.
            </p>
          </div>
          <Link
            href="/companies"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-dim"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
