# `@repo/cypress-config`

Shared Cypress helpers that follow the official
[Cypress docs](https://docs.cypress.io) and the
[Next.js App Router Cypress guide](https://nextjs.org/docs/app/guides/testing/cypress).

## Usage

```ts
// apps/web/cypress.config.ts
import { createE2EConfig } from "@repo/cypress-config";

export default createE2EConfig({
  e2e: {
    // Put project specific overrides here.
  },
});
```
