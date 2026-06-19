import Link from "next/link";
import type { Metadata } from "next";
import { Compass, Home, Building2, BookOpen, MapPinOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found — PrepIntel",
};

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center gap-8 text-center px-6 py-16 select-none">
      {/* Illustration */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 blur-2xl opacity-40 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT),transparent_60%)]" />
        <div className="relative flex items-center justify-center w-32 h-32 rounded-3xl bg-card border border-border shadow-sm">
          <Compass className="w-16 h-16 text-primary animate-[spin_6s_linear_infinite]" />
          <span className="absolute -bottom-3 -right-3 flex items-center justify-center w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <MapPinOff className="w-6 h-6" />
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-6xl font-black tracking-tighter text-foreground/90">404</p>
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          You&apos;ve wandered off the map
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, may have moved, or
          the link is incorrect. Let&apos;s get you back to the good stuff.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-secondary text-sm font-bold shadow-sm transition-all"
        >
          <Building2 className="w-4 h-4 text-primary" />
          Browse Companies
        </Link>
        <Link
          href="/topic-areas"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-secondary text-sm font-bold shadow-sm transition-all"
        >
          <BookOpen className="w-4 h-4 text-primary" />
          Browse Topics
        </Link>
      </div>
    </main>
  );
}
