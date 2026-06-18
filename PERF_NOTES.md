# Performance Notes

> Static analysis of LCP candidates and the active optimisations on each
> heavy route. Re-confirm with Chrome DevTools (Slow 4G + 4× CPU) per route
> after a production deploy.

---

## `/` — landing

**Likely LCP element:** the `<h1>` inside `Hero.tsx` —
*"Real interview experiences, structured for how you prep."* — set in
`font-display` (Instrument Serif) at 48px.

**Why it's the LCP:** text element, painted in the first render pass, larger
than any other element on the initial viewport. There's no hero image; the
"Recently shared" cards live below the fold.

**Active optimisations:**
- `revalidate = 3600` → page is fully static between revalidations; first
  visitor pays the render cost, everyone else gets the CDN-cached HTML.
- The hero only depends on `interviewsCount` + `companiesCount`, which run
  inline (small `COUNT(*)` queries via `Promise.all`).
- Three downstream sections (`RecentExperiencesRow`, `FeaturedCompaniesRow`,
  `TopicAreaHighlights`) are each their own async server component wrapped
  in `<Suspense fallback={<RowSkeleton/>}>`, so the hero + stats paint
  immediately while the heavier queries stream in.
- Fonts use `display: swap` so the headline can paint with the fallback
  before Instrument Serif arrives.
- No client JS in the LCP path: Hero is a server component, no Framer Motion.

**Risk:** the Instrument Serif fallback substitution may shift the headline
height. The `letter-spacing: -0.018em` on headings is set; consider adding
`font-size-adjust` if FOUT is measurable.

---

## `/companies` — catalog

**Likely LCP element:** the first-row company card on the catalog grid, or
the page heading `<h1>Browse companies</h1>` (whichever is larger and
visible without scrolling). On wide viewports the first card wins because
the heading is small (32px) and the card is taller.

**Why it's the LCP:** real first-fold content; both heading and card are
server-rendered, no skeleton flash.

**Active optimisations:**
- `revalidate = 3600`.
- Catalog data fetched in a single `getCompaniesList()` query that
  joins `_count.interviews` server-side.
- Filter chips are URL-synced through `useTransition`, so changing a chip
  doesn't blow away the rendered card list.
- The CGPA / branch filter behind the `show_candidate_profile_filter` flag
  adds zero work when disabled.
- Card grid is fully streaming-safe (wrapped in a Suspense boundary inside
  `CompaniesListContainer`).

**Risk:** the `CompanyLogo` component runs a runtime fetch against
`img.logo.dev`. With ~20 cards, that's up to 20 image requests in parallel.
Mitigations already in place: logos are CDN-served by logo.dev, marked
`unoptimized` (no `next/image` server round-trip), and use a per-size
`sizes` attribute. Initial-letter fallback shows immediately on error.

---

## `/companies/[slug]` — company detail

**Likely LCP element:** the company `<h1>` set in `font-display` inside the
brand-band hero, or the `CompanyLogo` (size `lg`, 80px) — both first-fold,
both equal candidates depending on viewport.

**Why it's the LCP:** the brand-band header is the visual anchor; everything
else is below it.

**Active optimisations:**
- `revalidate = 3600`.
- `CompanyTabs` (the analytics + interview list panel) is dynamically
  imported with a skeleton fallback, so its recharts dependency doesn't
  block the hero.
- `CompanyLogo` carries `size="lg"` and renders inside a fixed-size box —
  no layout shift while the logo loads.

**Risk:** if recharts is needed above the fold for the Trends tab, that
tab's content can be slow on first click. Acceptable: only active-tab
content rendered.

---

## `/experiences/[id]` — the showpiece

**Likely LCP element:** the `<h1>` (role-level name) inside `ExperienceHero`
rendered with `font-display` at 48px on the indigo band. This is the single
largest text element visible without scrolling.

**Why it's the LCP:** brand-band hero forces this element into the dominant
visual position. The company logo is 80px and likely smaller in pixel area
than the headline.

**Active optimisations:**
- `revalidate = 3600` (long horizon — interview content doesn't change after
  publish).
- `RelatedExperiences` wrapped in `<Suspense>` so its `findMany` for similar
  interviews streams in after the main page paints.
- `TopicAreaDistribution` (recharts donut) dynamically imported. The fold
  contains hero + process stepper, which are both pure server-rendered text.
- `RecentlyViewedTracker` is a lightweight client component that runs in a
  `useEffect` — adds zero LCP cost.
- `MarkdownRenderer` has a Shiki → plain → escaped fallback chain so a code
  highlighter crash never blocks the page.
- `BookmarkButton` is the only client component above the fold and is
  ~2 KB.

**Risk:** the `MarkdownRenderer` for `biggestTip` runs Shiki on the server.
Shiki's first invocation in a serverless function can be slow (~500 ms).
Acceptable for an ISR-cached route.

---

## Cross-cutting active optimisations

- **Server-Component discipline.** No `page.tsx` or `layout.tsx` carries the
  `"use client"` directive. Verified via:
  ```bash
  grep -rln '"use client"' app/ | xargs -I{} grep -l "^export default" {} \
    | xargs -I{} basename {} | sort -u
  ```
  Result is only `*-form.tsx`, `*-client.tsx`, `delete-button.tsx`, and
  similar leaf components — never a page or layout.

- **Dynamic imports for heavy libs.** Every recharts/Tremor chart import is
  wrapped in `next/dynamic` with a skeleton fallback:
  - `app/admin/analytics/*` — `LineChart`, `HorizontalBarChart`, `Heatmap`,
    `CompanyComparisonChart`, `RoleLevelStackedChart`, `TrendsChart`.
  - `app/(public)/experiences/[id]/page.tsx` — `TopicAreaDistribution`.
  - `app/(public)/companies/[slug]/page.tsx` — `CompanyTabs` (the recharts
    consumer).

- **No decorative entrance animations.** `ScrollReveal` is now a plain
  passthrough — no `whileInView`, no Framer Motion JS shipped for the
  experience page rounds. Motion is reserved for hover/focus/loading.

- **ISR on every public discovery route:**
  ```bash
  grep -rn "export const revalidate" "app/(public)"
  # → /, /companies, /companies/[slug], /experiences/[id], /sub-topics/[slug]
  ```

- **Parallel data fetching.** All multi-query server components use
  `Promise.all`. Landing page, admin analytics, admin interviews list, the
  CSV review page all parallelise.

- **Image discipline.** Every `<img>` on a public surface is `next/image`.
  Company logos use `unoptimized` (logo.dev is already a CDN). Logos use a
  `sizes` attribute matching the rendered pixel box.

- **`prefers-reduced-motion`** honoured globally via the `@layer base`
  block in `globals.css` — every transition and animation collapses to 0 ms
  when the user has reduced-motion enabled.

---

## What hasn't been done (deliberate)

- **No Lighthouse run in this report.** That requires a deployed URL.
  Re-run Lighthouse on the production deploy and confirm the target scores
  (≥ 90 perf, ≥ 95 a11y/best-practices/SEO, LCP < 1.8 s).
- **No image preloading.** Could be added for the hero logo on each
  experience page (`<link rel="preload" as="image">`). Marginal win;
  evaluate after first real measurement.
- **No font subsetting beyond what `next/font` does.** Default Latin
  subset is already loaded; the headline characters fit.
