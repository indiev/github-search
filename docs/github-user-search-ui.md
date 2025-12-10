# GitHub User Search UI – Implementation Plan

## Overview

- UI-only implementation of an exploratory GitHub user search screen within the existing Turborepo stack (Next.js App Router + @repo/ui).
- Focus: filters, sort, mock results list, infinite scroll scaffolding, rate-limit messaging, responsive layout, and local/component state.
- **Scope notice:** This document covers UI surfaces only; API calls, data fetching, Redux wiring, and real GitHub integrations are explicitly out of scope for now.

### Status Checklist

- [x] Extend `@repo/ui` primitives/components/layouts for filtering, sorting, lists, and layout scaffolding.
- [x] Build reusable filter components (text search, number range, multi-chip autocomplete, date presets).
- [x] Compose the `/github-search` page with mock data, responsive sidebar layout, infinite scroll simulation, and rate-limit banner.
- [x] Add Jest + Cypress component tests for filter logic, summary chips, and list/infinite scroll behaviors.
- [x] Finalize docs, prompts log, and usage instructions.

---

## Architecture & Layering

1. **UI primitives (`packages/ui/src/primitives`)**
   - Added wrappers for `Alert`, `Switch`, `Checkbox`, `FormControlLabel`, maintaining the rule that `apps/web` never imports `@mui/material` directly.
2. **Components (`packages/ui/src/components`)**
   - New domain-agnostic blocks: `FilterSection`, `SegmentedControl`, `NumberRangeFilter`, `MultiChipAutocomplete`, `DateRangeFilter`, `FilterSummaryBar`, `FilterSummaryChips`, `SortBar`, `InfiniteScrollContainer`, `UserCard`, `UserCardSkeleton`.
   - All components live under `packages/ui/src/components` so any screen in the monorepo can compose them.
3. **Layouts (`packages/ui/src/layouts`)**
   - Introduced `AppShell`, `PageHeader`, `SidebarLayout` to standardize header rendering and responsive sidebar/drawer behavior.
4. **apps/web**
   - `/app/github-search/page.tsx` is a client component that consumes the UI kit, owns mock data, and orchestrates filter state + pagination.
   - Utilities (`filterUtils.ts`, `constants.ts`, `types.ts`) keep the page readable and provide pure helpers for tests.
5. **Dependency direction**
   - `apps/web` → `@repo/ui` (primitives/components/layouts/providers) → `@mui/material` (only inside `@repo/ui`).

---

## Screen Structure

| Region | Description | Responsive Behavior |
| --- | --- | --- |
| **Header** | `PageHeader` within `AppShell` shows title/subtitle + rate-limit badge / status. | Always visible; rate-limit stacks on small screens. |
| **Sidebar Filter Panel** | `SidebarLayout` left column hosts stacked `FilterSection`s with segmented controls, switches, text inputs, range pickers, multi-select chips, joined-date presets (`apps/web/app/github-search/FilterPanel.tsx`). | `lg+`: sticky ~280px column; `md/sm`: collapsible drawer button (`필터 열기`) that renders the same content inside an MUI `Drawer`. |
| **Filter Summary Line + Chips** | `FilterSummaryBar` surfaces a one-line narrative (`Type: Users · Sponsorable · Repos ≥ 40`) plus reset CTA, followed by a dense `FilterSummaryChips` row for precise removal. | Summary line clamps to two rows on `sm`, chips wrap or scroll when needed. |
| **Sort Bar** | `SortBar` select paired with `metaLabel` text (`총 12명 (필터 적용됨)`) so counts always explain filter impact. | Aligns right on desktop, stacks below summary tools on mobile. |
| **Results List** | `UserCard`s display avatar/login/name, type + sponsorable chips, location icon, languages, stats row. | Cards stretch full width with vertical spacing; `data-testid=\"user-card\"` aids testing. |
| **Infinite Scroll & Load More** | `InfiniteScrollContainer` uses an IntersectionObserver sentinel and always-visible fallback button. Shows two `UserCardSkeleton`s and final “모든 결과” message. | Works identically across breakpoints; sentinel sits beneath cards. |
| **Rate Limit Alert** | When `rateLimit.exceeded` flips true, `Alert` renders message + disabled Retry button and summary chip turns `color=\"error\"`. | Alert sits between sort bar and results; spans column width regardless of viewport. |
| **State Feedback** | Initial render shows a six-card skeleton grid; filter/sort updates trigger a brief “필터 적용됨” chip; empty searches show a dashed reset card. | Feedback components keep full column width and stay readable on compact screens. |

---

## Filters & Controls

1. **Type Filter**
   - Segmented buttons: "전체(All)", "사용자(Users)", "조직(Organizations)".
   - Local state: `type: "user" | "org"`.
   - Maps to future GitHub query `type:user` or `type:org`.
2. **Sponsorable Filter**
   - Switch labeled "후원 가능한 사용자".
   - State: `sponsorableOnly: boolean`.
   - Future query: inclusion of `is:sponsorable`.
3. **Text Search**
   - Labeled text field "계정 이름, 성명, 메일".
   - Checkbox group for target fields (`login`, `name`, `email`), stored under `filters.textFields`.
   - State: `{ text: string; textFields: { login: boolean; name: boolean; email: boolean } }`.
   - Future: build `in:login` etc.
4. **Repository Count Filter**
   - `NumberRangeFilter` with operator select (`=`, `>=`, `<=`, `between`), numeric input(s), optional slider preview.
   - State: `{ operator: "eq" | "gte" | "lte" | "between"; value: number | { min: number; max: number } }`.
   - Future query uses `repos:>=X` etc.
5. **Location Filter**
   - `MultiChipAutocomplete` using suggestion list; supports chip removal.
   - State: `string[]`.
   - Future: `location:"Seoul"` repeated per entry.
6. **Language Filter**
   - Same multi-chip component with language suggestions.
   - State: `string[]`.
7. **Follower Count Filter**
   - Another `NumberRangeFilter` configured for follower stats.
8. **Joined Date Filter**
   - Preset select (Any / Last 1 year / 1–3 years / 3+ years) plus optional custom date range pickers.
   - State: `{ preset: "any" | "last1" | "oneToThree" | "threePlus" | "custom"; from?: string; to?: string }`.
   - Future: convert to `created:YYYY-MM-DD..`.
9. **Compact 모드 & Summaries**
   - Panel-wide toggle collapses helper copy, tightens spacing, and shows a visual chip of the current density.
   - Number filters bubble up succinct summaries (`Repos ≥ 40`, `Followers 0 - 500`) so users can scan conditions without opening sections.

Active filters flow into both `FilterSummaryBar` (narrative text built via `buildFilterSummaryLine`) and `FilterSummaryChips`, where each chip represents one slice with `onRemove` callbacks from `filterUtils.buildFilterSummaryEntries`.

---

## Mock Data Strategy

- Fixture file: `apps/web/app/github-search/_mock/users.ts` exposes 21 entries covering users + organizations.
- Each record includes login, name, type, sponsorable flag, stats, languages, location, and optional bio/email for future integration.
- `apps/web/app/github-search/page.tsx` keeps mock data in-memory, slices by `PAGE_SIZE = 6`, and simulates load latency with `setTimeout`.
- `InfiniteScrollContainer` stops requesting once `visibleUsers.length === filteredUsers.length` and shows an “end of results” message.
- An additional 400 ms client-side delay renders a 6-card skeleton grid on first mount to mirror future data fetching latency.

---

## Testing Plan

### Jest

- `apps/web/__tests__/github-search/FilterPanel.test.tsx`: verifies segmented control and sponsorable switch propagate updates.
- `packages/ui/src/__tests__/NumberRangeFilter.test.tsx`: ensures operator & numeric inputs normalize values (including `between` min/max shape).
- `packages/ui/src/components/__tests__/FilterSummaryChips.test.tsx`: validates chip rendering + removal callbacks.
- `packages/ui/src/components/__tests__/UserCard.test.tsx`: smoke test for login/name/language rendering.

### Cypress Component Tests (`apps/web/app/github-search/page.cy.tsx`)

1. **Filter interactions**
   - Toggle type to “조직” + sponsorable switch and assert summary chips + all rendered cards show “Organization”.
2. **Infinite scroll**
   - Use fallback button to trigger skeleton state (`cy.clock` + `cy.tick`), then confirm card count increases and end-state message appears.
3. **Responsive layout**
   - Mobile viewport shows drawer trigger/close button; re-mount on desktop ensures persistent sidebar and no drawer button.

### Out of Scope

- Full E2E hitting GitHub API.
- Redux slices, RTK Query, or server routes.

---

## How to Run

- **Dev server (Next.js):** `pnpm dev` (root) to run Turbo + Next (navigate to `/github-search`).
- **UI package tests:** `pnpm --filter @repo/ui test`.
- **Web app tests:** `pnpm --filter web test --watchman=false` (watchman disabled due to sandbox restriction).
- **Cypress component tests:** `pnpm --filter web test:component` (headless) or `pnpm --filter web test:component -- --headed` for debugging.
- **Lint/Format:** `pnpm lint`, `pnpm format`.

> This document will be updated as each checklist item is completed with notes about implementation details and testing status.
