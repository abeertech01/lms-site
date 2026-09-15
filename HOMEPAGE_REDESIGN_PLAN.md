# Home Page Redesign — Plan

Branch: `homepage` (based on latest `main`). Nothing implemented yet.

## What's changing
- **Home (`/`)**: stop showing the full catalog → hero/intro + "Most Popular" section + "Newly
  Added" section + "Browse all products" link.
- **New route** `src/app/(consumer)/products/page.tsx`: the full catalog listing, moved from the
  current home page as-is. Coexists with the existing `/products/[productId]` and
  `/products/purchase-failure`.
- **Route rename** `/admin/products` → `/admin/my-products` (heading also becomes "My Products"),
  so it's unambiguous from the new consumer `/products`.

## Admin route rename — what it touches
- Move: `page.tsx`, `new/page.tsx`, `[productId]/edit/page.tsx`
- Update links/redirects in: `admin/layout.tsx` nav, the "New Product" link, `ProductTable.tsx`'s
  "Edit" link, and 2 `redirect("/admin/products")` calls in `products/actions/products.ts`

## New data queries

**"Most Popular" section.** No ready-to-use query for this exists today, but there's a close
starting point to adapt: `src/app/admin/products/page.tsx` already counts how many customers
bought each product (it's what powers the sales numbers in the admin product table). The new
query reuses that same counting logic, with 4 changes:
1. Only count **public** products — the admin version also includes private/draft ones, which
   shouldn't appear on the public home page.
2. **Exclude refunded purchases** — the admin version currently counts a refund as a sale, which
   would be wrong for a "Most Popular" ranking.
3. **Sort by the count, highest first, and only take the top 3–4** — the admin version lists
   every product alphabetically instead, since it's a management table, not a ranking.
4. **Make it refresh when a new purchase happens**, not only when a product itself changes — add
   the purchase cache tag alongside the product one. (The admin version is missing this too, but
   that's a smaller problem there than it would be for a homepage that's meant to show what's
   trending right now.)

The count is **all-time**, not a rolling window — simpler, and that's the call that was made.

**"Newly Added" section.** Simpler — no existing counterpart needed here, since it's just the
same "list public products" query already used elsewhere in the app, sorted by creation date
(newest first) instead of by name, and capped to the top 3–4.

**Products vs. Courses in these sections.** Both sections pull from the same pool as the
`/products` catalog page — there's no separate "courses" listing to pick from. In this schema, a
"Course" is content bundled *inside* a Product; the sellable, listable, catalog-visible unit is
always a Product. So "feature whatever meets the trait (popular or new), whether it's a product
or a course" is already satisfied by just sourcing both sections from `ProductTable` — no extra
filtering or type-handling needed.

## New components
- `HeroSection` — static, no data fetching. Content (headline, subtext, CTA) written during
  implementation, not placeholder text. If a media asset (image/illustration) would make it
  better, that'll be asked for at that point rather than guessed at now.
- `ProductSection` — reusable heading + row of `ProductCard`s, used for both Most Popular and
  Newly Added.
- Both follow the app's existing `SuspenseBoundary` + skeleton convention (same pattern used
  everywhere else already).

## Order of work
1. Build `/products` listing page
2. Rename `/admin/products` → `/admin/my-products`
3. Add the two new queries
4. Build `ProductSection` + `HeroSection`
5. Assemble new home page
6. QA: empty state (no purchases yet), refund exclusion, mobile layout, cache invalidation after
   a purchase
