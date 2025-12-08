# Testing Strategy & Development Guide

This document serves as a guide for developers and LLMs to understand the division of responsibilities between Jest and Cypress Component Testing (CT) in the project. It specifically targets the Next.js 16, React 19, RTK, and Turborepo environment.

## 1. Jest vs Cypress CT Role Division

### Jest (+ React Testing Library)

**Focus:** Pure logic, domain logic, state management, and simple component interactions.
**Rule of thumb:** If it doesn't _really_ need a browser, put it here.

- **Pure Logic / Domain Logic**
  - Utility functions, data transformation, validation logic.
  - Date calculations, sorting/filtering functions.
- **State Management (Redux Toolkit / RTK Query / Zustand)**
  - Slice reducer logic.
  - Thunks and `extraReducers`.
  - RTK Query `queryFn` verification (correct endpoint calls for given inputs).
- **Small / Simple Components**
  - Buttons, Toggles, Dropdowns, Tabs, simple Form fields.
  - Tests that only verify "DOM structure + Event Handlers".
- **Hooks**
  - Custom hooks like `useDebounce`, `useInfiniteScroll` (logic part), `useAuth`, `useFeatureFlag`.

### Cypress Component Testing (CT)

**Focus:** Complex interactions, browser/layout dependencies, and integration with browser APIs.
**Rule of thumb:** "This is too hard with jsdom, I want to see it in a real browser."

- **Complex Interactions**
  - Modals, Drawers, Dialogs (Focus traps, ESC key, outside references).
  - Autocomplete search bars, Mentions, Rich-text editor toolbars, Tag input fields.
  - Composite widgets (e.g., Filter Panel + Result List + Pagination working together).
- **Browser / Layout Dependencies**
  - Responsive layouts (viewport size changes).
  - Scroll events, `IntersectionObserver`, `ResizeObserver`, Drag & Drop.
  - Actual CSS animations and transitions (checking for jank or correctness).
- **Integration with Router / Network / Browser APIs**
  - Next.js Router, Query Strings, History API.
  - `localStorage`, `sessionStorage`, Cookies.
  - Real API request/response flows (using `cy.intercept`).
  - Environment scenarios like Dark Mode, System Theme synchronization.

---

## 2. Strategies to Minimize Overlap

### 2.1. The "Test Pyramid" Approach

- **Bottom:** Jest Unit & Component Tests (Majority)
- **Middle:** Cypress Component Tests (Selected key components)
- **Top:** Cypress E2E (Few critical flows)

**Core Principle:** Do not test the same behavior at all layers. If it can be fully verified at a lower layer, do not repeat it at a higher layer.

### 2.2. Naming Conventions

Use separate naming patterns to clearly distinguish the intent and layer of tests.

- `*.unit.test.ts` / `*.component.test.tsx` -> **Jest**
- `*.component.cy.tsx` -> **Cypress CT**
- `*.e2e.cy.ts` -> **Cypress E2E**

_Benefit: During PR reviews, checking `_.component.cy.tsx`prompts the question: "Is this case already covered by`_.component.test.tsx`?"_

### 2.3. Documentation & Planning

For each component or domain feature, explicitly note where testing happens. This can be in a Notion doc, Spec file, or a comment in `tests/README.md`.

**Example: Search Feature**

- **Jest:** Search parameter generation, RTK Query endpoints, Filter logic.
- **Cypress CT:** Search UI, Filter combinations + Result list interaction, Responsive layout.
- **Cypress E2E:** Login -> Search -> Go to Detail Page (Happy Path).

### 2.4. Bug Fix Strategy

When a bug occurs, add a test at the _lowest_ possible level that reproduces it.

- **Pure Logic Issue** -> Add **Jest** test.
- **UI / Layout / Interaction Issue** -> Add **Cypress CT** test.
- **Cross-System / Page Flow Issue** -> Add **Cypress E2E** test.
