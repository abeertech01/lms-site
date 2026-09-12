# Next.js 16 Upgrade Plan (triple-a / lms-site)

## Progress log

**Status as of this session: Phases 0–7 executed, build/typecheck/lint all green.**
Nothing has been committed — everything below is still in the working tree, uncommitted, per
standing instructions to confirm before any `git commit`/`push` in this repo.

- **Phase 0–1**: Done. Ran `npx @next/codemod@canary upgrade latest`, which bumped
  next→16.3.5, react/react-dom→19.3.0, eslint-config-next→16.3.5, eslint→10.10.0 (later
  corrected, see below), and inserted `export const instant = false` opt-outs (with TODO
  comments) into 27 pages/layouts — Next 16.3's escape hatch from strict Cache Components
  enforcement, so the app didn't need a full Suspense rewrite just to build.
- **Node**: switched local dev to Node 24.20.0 via a new `.nvmrc` (the install pulled in
  `@arcjet/next@1.10.0`→now `1.12.0`, which needs Node ≥22.21 or ≥24.5; 22.18 didn't qualify).
- **Phase 2**: Done. `@clerk/nextjs` 6.39.6→7.9.2, `@arcjet/next`→1.12.0, `@stripe/stripe-js`
  8.2.0→9.16.0 + `@stripe/react-stripe-js` 5.3.0→6.10.0 (peer-linked, bumped together),
  `drizzle-orm`/`drizzle-kit` patch bumps, `@types/node`→^24 to match the new Node target.
- **Clerk v6→v7 (Core 3) breaking changes found and fixed** — beyond the plan's original scope,
  discovered by reading Clerk's Core 3 migration notes and grepping the codebase:
  - `src/app/layout.tsx`: `<ClerkProvider>` was wrapping `<html>`; Core 3 requires it inside
    `<body>`. Restructured.
  - `src/app/(consumer)/layout.tsx`: `<SignedIn>`/`<SignedOut>` are deprecated stubs in v7
    (confirmed via the installed package's type declarations, exported from
    `removedControlComponents`). Replaced with the unified `<Show when="signed-in" fallback={…}>`.
  - `auth.protect()` now returns 401 instead of 404 for unauthenticated requests in
    `src/proxy.ts` — checked, nothing in the codebase depends on the old 404, no fix needed.
- **Phase 3**: Done. `src/middleware.ts` → `src/proxy.ts` (`git mv`), default export renamed to
  a named `proxy` per the v16 convention. `config.matcher` untouched.
- **Phase 4**: Done. `next.config.ts`: `experimental.useCache` → `cacheComponents: true`.
- **Phase 5**: Done. Fixed the private `next/dist/server/use-cache/cache-tag` import in 20 files
  → public `next/cache`. For `revalidateTag`, traced every helper's actual callers (Server
  Action vs. Route Handler) rather than guessing:
  - `revalidateProductCache`, `revalidateCourseCache`, `revalidateCourseSectionCache`,
    `revalidateLessonCache`, `revalidateUserLessonCompleteCache` — called **only** from Server
    Actions with an immediate redirect → switched to **`updateTag`** (true read-your-writes).
  - `revalidatePurchaseCache`, `revalidateUserCourseAccessCache` — called from **both** a
    Server Action **and** the Stripe webhook route handler → kept **`revalidateTag(tag, 'max')`**
    (`updateTag` is Server-Actions-only, would break in the webhook). Left an inline code comment
    flagging this as the thing to watch if the purchase/"My Courses" flow shows stale data —
    `'max'` is stale-while-revalidate, not the old immediate-invalidation behavior.
  - `revalidateUserCache` — called only from the Clerk webhook / sync route → same reasoning,
    `revalidateTag(tag, 'max')`.
  - `src/features/users/db/users.ts:18`'s `revalidateTag("test")` — verified it's dead code
    inside a `/** */` block comment, not live code. Left untouched.
- **Phase 6**: Done. `eslint.config.mjs` rewritten to native flat presets
  (`eslint-config-next/core-web-vitals` + `/typescript`), `package.json` `"lint"` script
  changed to `"eslint ."`, unused `@eslint/eslintrc` removed.
  - **Found during verification**: the codemod's `eslint@10.10.0` bump crashes
    `eslint-config-next`'s bundled `eslint-plugin-react@7.37.5` (`context.getFilename is not a
    function` — ESLint 10 removed that context method, the plugin hasn't caught up). Pinned
    `eslint` to the latest **9.x** (`9.39.5`) instead, which is what `eslint-config-next@16.3.5`
    actually supports today. Lint is now clean (0 errors, 8 pre-existing warnings unrelated to
    this upgrade).
- **Phase 7**: Mostly done. `cacheComponents: true` requires every route segment config to be
  compatible — `export const dynamic = "force-dynamic"` is now an outright build error (it's
  disallowed under `cacheComponents`), so it was removed from 5 admin pages (`admin/page.tsx`,
  `admin/courses/page.tsx`, `admin/products/page.tsx`, `admin/products/new/page.tsx`,
  `admin/sales/page.tsx`) — their existing `instant = false` opt-out already preserves the same
  "always dynamic, no special caching" behavior. Separately, `<SignIn />` and `<SignUp />`
  (Clerk) failed static prerendering outright under `cacheComponents` with an unhelpful,
  swallowed error (reproduced identically under Turbopack and webpack, with `--debug-prerender`,
  and isolated by swapping in a placeholder component to rule out the route/config machinery
  before landing on Clerk's components specifically as the cause). Fixed by wrapping both in
  `<Suspense>`, the standard Cache Components pattern for a component that reads dynamic
  per-request state during SSR.
- **Build/typecheck/lint status**: `npx tsc --noEmit` clean, `npm run lint` clean (0 errors),
  `npm run build` succeeds — all 26 routes generate, Turbopack, cache tags/updateTag calls,
  `<Suspense>` fixes all verified working together.
- **Unplanned, informational**: `next dev` auto-generated `AGENTS.md` and `CLAUDE.md` at the
  project root (a stock Next.js 16 feature — a managed block pointing AI agents at the
  version-matched bundled docs in `node_modules/next/dist/docs/`, re-written by `next dev` each
  time). Left in place; harmless and arguably useful, disable via `agentRules: false` in
  `next.config.ts` if unwanted. Also noticed but did **not** act on: `src/proxy.ts` logs a Clerk
  deprecation warning that `createRouteMatcher`-based middleware auth is deprecated in favor of
  per-route resource-based auth checks — that's a larger architectural change Clerk is
  recommending for the future, out of scope for this compatibility upgrade.
- **Not yet done**: Phase 8 (`next typegen` adoption, optional/cosmetic — skipped), and the live
  manual QA part of Phase 9 (sign-in, purchase flow end-to-end, admin CRUD in a real browser
  against the dockerized Postgres) — needs a human/browser pass with real Clerk/Stripe test
  credentials, which wasn't done in this session. **This is the highest-value remaining step**
  given the `'max'`-profile caching risk flagged above on the purchase flow specifically.


Researched against the official Next.js 16 upgrade guide (nextjs.org, v16.3.5 docs) and this
repo's actual code (grepped, not guessed). Sources are linked at the bottom.

## 1. Current state

| Package | Current | Notes |
|---|---|---|
| next | ^15.5.23 | App Router only, no `pages/` dir |
| react / react-dom | ^19.2.8 | already React 19 |
| @clerk/nextjs | ^6.39.6 | auth, used in middleware |
| @arcjet/next | ^1.0.0-beta.13 | bot/shield/rate-limit in middleware |
| @stripe/stripe-js | ^8.2.0 | |
| @stripe/react-stripe-js | ^5.3.0 | |
| eslint-config-next | ^15.5.23 | consumed via `FlatCompat` legacy shim |
| eslint | ^9 | already flat-config-capable |
| drizzle-orm / drizzle-kit | ^0.45.2 / ^0.31.4 | not Next-coupled |
| Node.js | v22.18.0 (local) | already satisfies v16's floor |
| TypeScript | ^5 | already satisfies v16's floor (5.1+) |

Package manager: npm (`package-lock.json`). No CI workflow, Dockerfile, or `vercel.json` in the
repo to update. No `engines` field set.

## 2. Target versions

| Package | Target |
|---|---|
| next | 16.3.5 (or `latest` at upgrade time) |
| react / react-dom | latest 19.x (19.3.0 as of research time) |
| @clerk/nextjs | ^7.9.2 — **major bump, required**. v6 does not declare support for Next 16 in its peer range; v7's peer range explicitly includes `^16.0.10 \|\| ^16.1.0-0` |
| @arcjet/next | ^1.12.0 — peer range is just `next >= 13`, but you're 20+ minor versions behind a beta; move off beta |
| @stripe/stripe-js | ^9.16.0+ — **required**, see below |
| @stripe/react-stripe-js | ^6.10.0 — its peer dep requires `@stripe/stripe-js >=9.16.0 <10.0.0`, which is higher than what's currently installed, so these two must move together |
| eslint-config-next | ^16.3.5 |
| drizzle-orm / drizzle-kit | latest patch (0.45.x / 0.31.10) — routine, not Next-driven |

## 3. Findings specific to this codebase (from grepping `src/`)

These are the parts of the guide that actually touch this repo — the rest of the official
breaking-changes list (AMP, `pages/`, parallel routes, legacy image, runtime config, sync
`params`/`cookies`/`headers`) does **not** apply here; see §5.

1. **`next.config.ts` uses the removed `experimental.useCache` flag.**
   That flag is deleted in v16. Since this app actively uses the `"use cache"` directive (23
   files, see below), the correct replacement is the new stable top-level `cacheComponents: true`
   — not just deleting the flag. This is explicitly *not* a pure rename: Next's own docs warn it
   "can surface build errors for uncached data outside of `<Suspense>`."

2. **23 files import `cacheTag` from a private internal path**, not the public API:
   ```ts
   import { cacheTag } from "next/dist/server/use-cache/cache-tag"
   ```
   instead of the stable, public:
   ```ts
   import { cacheTag } from "next/cache"
   ```
   Reaching into `next/dist/...` is unsupported and can silently break on any Next release, major
   or not — this needs fixing regardless of the v16 move, and v16 is a good forcing function.
   Affected files: `src/app/(consumer)/page.tsx`, `.../purchases/page.tsx`,
   `.../purchases/[purchaseId]/page.tsx`, `.../products/[productId]/page.tsx`,
   `.../products/[productId]/purchase/page.tsx`, `.../products/[productId]/purchase/success/page.tsx`,
   `.../courses/page.tsx`, `.../courses/[courseId]/layout.tsx`, `.../courses/[courseId]/page.tsx`,
   `.../courses/[courseId]/lessons/[lessonId]/page.tsx`, `src/app/admin/page.tsx`,
   `src/app/admin/products/page.tsx`, `src/app/admin/products/new/page.tsx`,
   `src/app/admin/products/[productId]/edit/page.tsx`, `src/app/admin/sales/page.tsx`,
   `src/app/admin/courses/page.tsx`, `src/app/admin/courses/[courseId]/edit/page.tsx` (plus a few
   more under `src/features/**` and `src/services/clerk.ts` per the grep — re-verify full list at
   fix time with `grep -rl 'next/dist/server/use-cache/cache-tag' src`).

3. **`revalidateTag()` is called with a single argument in ~29 call sites across 9 files.**
   v16 requires a second `cacheLife` profile argument; the single-arg form is now a **TypeScript
   error**, so the build won't even compile until these are fixed:
   - `src/features/purchases/db/cache.ts` (3 calls)
   - `src/features/products/db/cache.ts` (2 calls)
   - `src/features/courses/db/cache/courses.ts` (2 calls)
   - `src/features/courses/db/cache/userCourseAccess.ts` (3 calls)
   - `src/features/courseSections/db/cache.ts` (3 calls)
   - `src/features/users/db/cache.ts` (2 calls)
   - `src/features/users/db/users.ts` (1 call — `revalidateTag("test")` at line 18; this looks like
     leftover debug code unrelated to the tag-helper pattern used everywhere else, flag for review
     rather than mechanically "fixing" it)
   - `src/features/lessons/db/cache/userLessonComplete.ts` (3 calls)
   - `src/features/lessons/db/cache/lessons.ts` (2 calls)

   This needs a judgment call, not just typing `'max'` everywhere: these `revalidate*Cache()`
   helpers all run right after a DB mutation in Server Actions, and several feed pages the user
   is redirected to immediately after (e.g. purchases → "My Courses", which was the subject of
   your two most recent commits on this repo). For those, Next's new `updateTag()` (read-your-writes,
   expires + refreshes in the same request) is the closer match to current behavior than
   `revalidateTag(tag, 'max')` (stale-while-revalidate — user could briefly see stale data).
   Recommendation: use `updateTag` for tags read immediately after the mutating Server Action
   returns; use `revalidateTag(tag, 'max')` for tags only consumed by unrelated background flows
   (e.g. webhook-driven revalidation with no immediate UI read). Decide per call site during
   Phase 5, don't blanket-apply one profile.

4. **`src/middleware.ts` needs to become `src/proxy.ts`.**
   It wraps `clerkMiddleware()` (Clerk) with Arcjet's `shield`/`detectBot`/`slidingWindow`. Per
   Clerk's own v16 migration notes, the fix is a rename only — `clerkMiddleware()` from
   `@clerk/nextjs/server` already supports being the default export of `proxy.ts` — but this must
   be verified against the Clerk v7 package actually installed (their docs during v16's rollout
   were still catching up in places). The `config.matcher` export is unaffected. This repo doesn't
   use `skipMiddlewareUrlNormalize`, so that particular renamed flag isn't a concern. Also
   confirm: the `edge` runtime is **not** supported under `proxy.ts` (Node.js-only) — this repo's
   middleware doesn't set `runtime: "edge"`, so it's unaffected, but worth a explicit check since
   Arcjet has historically had edge-runtime-specific builds.

5. **`eslint.config.mjs` uses the legacy shim.** It currently does:
   ```ts
   import { FlatCompat } from "@eslint/eslintrc"
   const compat = new FlatCompat({ baseDirectory: __dirname })
   export default [...compat.extends("next/core-web-vitals", "next/typescript")]
   ```
   `eslint-config-next` now ships native flat presets (`eslint-config-next/core-web-vitals`,
   `eslint-config-next/typescript`), so the `FlatCompat` indirection can be dropped entirely.

6. **`package.json`'s `"lint": "next lint"` script won't work.** `next lint` is removed in v16;
   lint via the ESLint CLI directly.

## 4. Non-issues (checked, no action needed)

- No `pages/` directory — pure App Router, so no AMP/legacy-image/runtime-config concerns (none
  of `next/legacy/image`, `useAmp`, `serverRuntimeConfig`/`publicRuntimeConfig` appear anywhere).
- No parallel routes (`@folder` segments) — the new mandatory `default.js` requirement doesn't
  apply.
- No synchronous `params`/`searchParams`/`cookies()`/`headers()` access found — this app was
  already written against Next 15's async APIs.
- No custom `webpack` block in `next.config.ts` — Turbopack becoming the default builder won't
  hit the "build fails because of a webpack config" case.
- No `images.domains` usage (already on `remotePatterns`), no `quality=` prop overrides, no local
  image `src` with query strings — so the new default `images.qualities: [75]` and
  `images.localPatterns` requirement don't need explicit config changes.
- No global `scroll-behavior: smooth` CSS to preserve, so no need for the
  `data-scroll-behavior="smooth"` attribute on `<html>`.
- `@t3-oss/env-nextjs`, Tailwind v4, `drizzle-orm`/`drizzle-kit`, `sonner`, `next-themes`, Radix,
  `cmdk`, `react-hook-form` etc. have no Next-version coupling; routine `npm outdated` bumps only.

## 5. Step-by-step plan

### Phase 0 — Prep
- Confirm a clean working tree (`git status`) and work on a dedicated branch (you're already on
  `upgrade`).
- Confirm Node ≥ 20.9 (local is 22.18.0 — fine) and note the requirement if this app is deployed
  anywhere with a pinned older Node version (no Dockerfile/CI found in-repo to check).

### Phase 1 — Run the official codemod
```bash
npx @next/codemod@canary upgrade latest
```
This is expected to: bump `next`, `react`, `react-dom` to latest; move `experimental.turbopack` →
top-level `turbopack` (n/a here, not currently set); migrate `middleware` naming/flags toward
`proxy` where mechanical; strip `unstable_` prefixes (n/a — this repo doesn't use
`unstable_cacheLife`/`unstable_cacheTag`); remove `experimental_ppr` (n/a — not used). Answer
prompts to accept React upgrade and Turbopack defaults.

**Do not trust the codemod alone for the Clerk/Arcjet/Stripe pieces** — it only touches Next's own
config surface, not third-party SDKs. Diff the result before continuing.

### Phase 2 — Manual dependency bumps
```bash
npm install @clerk/nextjs@latest
npm install @arcjet/next@latest
npm install @stripe/stripe-js@latest @stripe/react-stripe-js@latest
npm install drizzle-kit@latest drizzle-orm@latest
npm install eslint-config-next@latest
npm install -D @types/react@latest @types/react-dom@latest @types/node@latest
```
Then read the Clerk v6→v7 changelog/migration notes specifically (it's a major bump, independent
of the Next.js 16 changes) before assuming it's a drop-in replacement.

### Phase 3 — `middleware.ts` → `proxy.ts`
```bash
git mv src/middleware.ts src/proxy.ts
```
- Rename the exported function from `middleware`/default-export convention to `proxy` per the new
  naming (Clerk's `clerkMiddleware()` return value can still be the default export — verify
  against the Clerk version actually installed in Phase 2, since their docs were still catching up
  post-v16-launch).
- Leave `config.matcher` as-is; it isn't renamed.
- Re-verify Arcjet still initializes correctly under the Node-only proxy runtime.

### Phase 4 — `next.config.ts`
- Remove:
  ```ts
  experimental: { useCache: true }
  ```
- Add:
  ```ts
  cacheComponents: true
  ```
- Leave `images.remotePatterns` as-is.
- Optional (not required, since no code depends on old defaults): explicitly set
  `images.minimumCacheTTL` if you want to keep the old 60s revalidation window instead of the new
  4-hour default — only relevant if remote images change frequently.

### Phase 5 — Fix the cache API usage (the highest-risk phase)
1. In all 23 affected files, replace:
   ```ts
   import { cacheTag } from "next/dist/server/use-cache/cache-tag"
   ```
   with:
   ```ts
   import { cacheTag } from "next/cache"
   ```
2. Go through every `revalidateTag(tag)` call (listed in §3.3) and add the required second
   argument. For each, decide `updateTag(tag)` vs `revalidateTag(tag, 'max')` based on whether a
   page reading that tag is rendered immediately after the mutation (favor `updateTag`) or only
   later/out-of-band (favor `revalidateTag(tag, 'max')`). Pay particular attention to the purchase
   flow — this is exactly the path your last two commits (`Fix purchases silently not persisting`,
   `Filter "My Courses" to only courses the user actually owns`) touched, so a wrong caching
   profile here would visibly regress what you just fixed.
3. Investigate `src/features/users/db/users.ts:18` (`revalidateTag("test")`) before touching it —
   confirm whether it's dead debug code to delete or something load-bearing that was just poorly
   named.

### Phase 6 — ESLint flat config cleanup
Replace `eslint.config.mjs`:
```ts
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])
```
- Drop `@eslint/eslintrc` from `devDependencies` if nothing else needs `FlatCompat`.
- Update `package.json`:
  ```diff
  - "lint": "next lint"
  + "lint": "eslint ."
  ```

### Phase 7 — `cacheComponents` / Suspense audit
Enabling `cacheComponents: true` is stricter than the old `experimental.useCache` flag about
uncached dynamic reads happening outside a `<Suspense>` boundary. Run `next build` and `next dev`
and watch for errors on each of the 23 `"use cache"` routes listed in §3.2 — pay closest attention
to routes that mix `cacheTag`-tagged cached data with Clerk's `auth()`/`currentUser()` (a dynamic,
per-request read) in the same component tree, since those two need to be separated by a Suspense
boundary rather than read together inside one function.

### Phase 8 — Optional: `next typegen`
```bash
npx next typegen
```
Generates `PageProps`/`LayoutProps`/`RouteContext` helper types. Not required, but worth adopting
incrementally for stronger typing on `params`/`searchParams` now that you're touching these files
anyway.

### Phase 9 — Verification
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (now runs on Turbopack by default — confirms no hidden webpack-config conflicts,
  already ruled out in §4, and confirms the Phase 5 TypeScript fixes actually compile)
- `npm run dev`, then manually smoke-test:
  - Public pages (home, products, courses) — confirm cached pages still render post-`cacheComponents`
  - Sign-in/sign-up and the `/admin` role-gated route — confirms `proxy.ts` + Clerk v7 auth works
  - Arcjet shield/bot-detection/rate-limit still trigger under the new proxy runtime
  - Full purchase flow (Stripe checkout → webhook → "My Courses") end to end — highest regression
    risk given Phase 5 changes and your recent purchase-persistence fixes
  - Admin CRUD (product/course/section/lesson create/edit) — confirm revalidation still reflects
    immediately in the relevant list pages

### Phase 10 — Cleanup
- Remove any now-unused deps (e.g. `@eslint/eslintrc` if dropped in Phase 6).
- Re-run `grep -rn "next/dist/" src` to confirm no other private imports remain.
- Confirm each dependency bump in `package.json` reflects what's actually installed
  (`npm ls next react react-dom @clerk/nextjs @arcjet/next @stripe/stripe-js @stripe/react-stripe-js`).

## 6. Suggested commit structure

Since this repo's convention (per recent commits) is small, focused commits, split the upgrade
rather than one giant commit:
1. Dependency bumps (`package.json`/`package-lock.json` only)
2. `next.config.ts` + `middleware.ts` → `proxy.ts` rename
3. Cache API fixes (`cacheTag` import path + `revalidateTag`/`updateTag` call sites) — likely the
   largest, most review-worthy commit
4. ESLint flat-config cleanup + script rename

(As always in this repo: confirm with you before committing or pushing any of these.)

## Sources
- [Upgrading: Version 16 — Next.js docs](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Upgrading: Codemods — Next.js docs](https://nextjs.org/docs/app/guides/upgrading/codemods)
- [ESLint Plugin config — Next.js docs](https://nextjs.org/docs/app/api-reference/config/eslint)
- npm registry `peerDependencies` for `@clerk/nextjs@latest`, `@arcjet/next@latest`,
  `@stripe/react-stripe-js@latest`, `eslint-config-next@16.3.5`, `next@16.3.5` (queried directly)
