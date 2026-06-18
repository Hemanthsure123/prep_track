import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-6 py-12 select-none">
      <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center animate-bounce shadow-sm">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight">
          Experience Not Found
        </h1>
        <p className="text-brand-muted text-sm max-w-sm mx-auto font-medium leading-relaxed">
          The requested interview experience doesn&apos;t exist, has been removed, or the link is incorrect.
        </p>
      </div>

      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/95 text-sm font-bold shadow-md hover:shadow transition-all"
      >
        Back to Home
      </Link>
    </main>
  );
}
