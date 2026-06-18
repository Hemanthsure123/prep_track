# Performance & Bundle Audit (Baseline)

This document provides a disciplined audit of the bundle size, Largest Contentful Paint (LCP) candidates, and `"use client"` boundaries across the Interview Experience Platform.

---

## 1. Bundle Size Analysis (Build Output)

After executing the production build command (`ANALYZE=true npm run build`), we gathered the exact JS chunk weights per route:

### Route-Specific Chunk Sizes

| Route | Size | First Load JS | Notes / Potential Bloat |
| :--- | :--- | :--- | :--- |
| **Shared by all (Core)** | **102 kB** | **102 kB** | Includes `lucide-react`, `next`, `react`, and client framework. |
| `/` (Landing Page) | 3.35 kB | 167 kB | Solid baseline, relies on shared chunks. |
| `/companies` (Catalog) | 3.82 kB | 128 kB | Uses basic filters and cards. |
| `/companies/[slug]` (Details) | 12.7 kB | 251 kB | **Bloated.** Imports heavy tab components and sub-components. |
| `/experiences/[id]` (Infographic) | 6.03 kB | 270 kB | **Heaviest Public Route.** Large layout, SVGs, steppers, and related cards. |
| `/sub-topics/[slug]` (Code Transcripts) | 2.71 kB | 127 kB | Moderate. Custom code transcripts and topic clouds. |
| `/admin` (Dashboard Hub) | 825 B | 106 kB | Extremely lean. |
| `/admin/analytics/...` | ~2.0 kB | **241 kB** | **High JS weight.** Static imports of charts (`recharts`, `@tremor/react`). |
| `/admin/interviews/new` | 478 B | **267 kB** | **High JS weight.** Imports entire creation wizard client shell statically. |
| `/admin/interviews/[id]/edit` | 503 B | **267 kB** | **High JS weight.** Identical wizard client shell. |

### Top Chunks & Assets
* **Client Main Bundle:** `chunks/4bd1b696-100b9d70ed4e49c1.js` (54.2 kB) & `chunks/1255-eae4096fb21f1304.js` (46 kB).
* **Heavy Libraries (Dynamic candidates):** `recharts`, `@tremor/react`, `framer-motion` inside admin analytics dashboards.

---

## 2. Largest Contentful Paint (LCP) Candidates

Applying DevTools performance throttling (Fast 3G + 4x CPU Slowdown), we identified the primary LCP candidate elements per route:

### `/` (Landing Page)
* **LCP Candidate:** Large headline `<h1>` element inside `Hero.tsx` (`"Real interview experiences. Structured for how you actually prep."`).
* **Current Status:** Text-based LCP. Loads fast because it uses CSS colors/gradients. No heavy images in hero.
* **Optimization:** Load target fonts with `display: swap` to prevent FOIT (Flash of Invisible Text).

### `/companies`
* **LCP Candidate:** The filtering header / first-row company cards.
* **Current Status:** Skeleton loaders and cards.
* **Optimization:** Implement clean Suspense boundaries around filter bar params to ensure initial shell paints immediately.

### `/companies/[slug]`
* **LCP Candidate:** Company logo element (`<img>` element) or the company title header.
* **Current Status:** Throws Next.js `<img>` warning.
* **Optimization:** Replace `<img>` logo with Next.js `<Image>` component with `priority={true}` and appropriate aspect ratio constraints to prevent layout shift.

### `/experiences/[id]`
* **LCP Candidate:** Company logo inside the top-banner `ExperienceHero` or the large role `<h1>` title text.
* **Current Status:** Throws Next.js `<img>` warning.
* **Optimization:**
  * Convert the company logo `<img>` to `<Image>` with `priority` attribute.
  * Keep the hero title clean and un-blocked by dynamic client hydration.

---

## 3. `"use client"` Directive Inventory

We inventoried the codebase to identify over-clientified files that introduce unnecessary JS payloads:

### Unnecessary `"use client"` in UI Primitives
* **`components/ui/button.tsx`**: Uses `@base-ui/react/button`.
* **`components/ui/badge.tsx`**: Uses `@base-ui/react/use-render` for custom element tagging.
* **`components/ui/input-group.tsx`**, **`components/ui/checkbox.tsx`**, **`components/ui/dialog.tsx`**: Inherit Base UI hook dependencies.
* *Note:* While using `@base-ui/react` requires client hooks, we must ensure these primitives do not pull excessive code down. Unused hooks can be minimized or visual-only wrappers kept simple.

### Heavy Analytics Client Roots
* All dashboard routes (`/admin/analytics/*`) import charts statically:
  * `components/charts/Heatmap.tsx`
  * `components/charts/trends`
  * `components/charts/HorizontalBarChart.tsx`
  * `components/charts/LineChart.tsx`
* **Correction:** Migrate all heavy interactive charts to dynamic imports `dynamic(() => import(...), { ssr: false })` with inline skeletons.

---

## 4. Key Performance Action Items (Phase 4 Targets)

1. **Deepen Client Boundaries**: Move client-only states (e.g. Expand/Collapse, Tooltips) down into leaf elements, keeping the main page shells strictly React Server Components (RSC).
2. **Implement Lazy / Dynamic Imports**: Apply Next.js `dynamic()` lazy-loading for heavy libraries:
   * Dynamic load `recharts` / Tremor components.
   * Dynamic load the code visualizers (`shiki`, `remark`, `rehype` parsers).
3. **Optimized Image Constraints**: Fully convert all `<img>` tags on core public views to Next.js `<Image>` with pre-specified aspect ratios and standard `sizes` configs.
4. **Define ISR Policies**: Lock page static-regeneration with `export const revalidate = 3600;` on discovery routes.
5. **Streaming Suspense Bounds**: Add `<Suspense fallback={<Skeleton />}>` around data-heavy sub-components to unlock instant initial paint.
