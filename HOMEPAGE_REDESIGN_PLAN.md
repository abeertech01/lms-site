# Home Page Redesign — Plan

Branch: `homepage` (created from up-to-date `main`, which already includes the Next.js 16
upgrade). No implementation has started — this is the plan only.

## 1. Current state

`src/app/(consumer)/page.tsx` (the `/` route) currently renders **every public product** in a
plain grid, using `ProductCard`, sorted alphabetically by name. There is no hero/intro content,
and no curation — a new visitor sees the entire catalog immediately, unsorted by relevance.

A structural fact that shapes this plan: **there is currently no other page that browses the full
catalog.** The consumer-facing `/products` route only has child routes today —
`/products/[productId]` (a single product's detail page) and `/products/purchase-failure` — there
is no `src/app/(consumer)/products/page.tsx`. So the home page grid is, today, the *only* way to
see everything for sale. If home stops doing that, something needs to take over that job.

Separately, `/admin/products` already exists and lists every product the admin has authored
(`PageHeader title="Products"` in `src/app/admin/products/page.tsx`). This is a different page
for a different audience (admin-only, management view) — now that the consumer side is getting
its own `/products` listing, the admin one moves to **`/admin/my-products`** (route rename, not
just a heading change) to keep the two unambiguous from each other.

This is a folder rename in the App Router, so it touches every file under it plus every place
that links to the old path:

- Move `src/app/admin/products/page.tsx` → `src/app/admin/my-products/page.tsx` (and update its
  `PageHeader title="Products"` → `"My Products"`)
- Move `src/app/admin/products/new/page.tsx` → `src/app/admin/my-products/new/page.tsx`
- Move `src/app/admin/products/[productId]/edit/page.tsx` →
  `src/app/admin/my-products/[productId]/edit/page.tsx`
- Update the nav link in `src/app/admin/layout.tsx:41` (`href={"/admin/products"}`)
- Update the "New Product" link in the moved `page.tsx` (`href={"/admin/products/new"}`)
- Update the "Edit" link in `src/features/products/components/ProductTable.tsx:81`
  (`` href={`/admin/products/${product.id}/edit`} ``)
- Update both `redirect("/admin/products")` calls (after create and after update) in
  `src/features/products/actions/products.ts:27` and `:41`

## 2. Goal

Replace the "show everything" home page with:
1. An introduction/hero section (branding, value proposition).
2. A **"Most Popular"** section — courses/products with the most purchases.
3. A **"Latest"** section — most recently added products.
4. A way to still reach the full catalog (since nothing else currently provides that).

## 3. Proposed page structure

```
/  (home)
├─ Hero / intro section (static-ish marketing content)
├─ "Most Popular" — top N products by purchase count
├─ "Newly Added" — top N products by createdAt, most recent first
└─ "Browse all products" → links to /products (new listing page)
```

`/products` (i.e. `src/app/(consumer)/products/page.tsx`, which doesn't exist yet) becomes the
new full-catalog page — essentially the current home page grid, moved there unchanged (same
query, same `ProductCard`, same layout). It sits alongside the existing `/products/[productId]`
and `/products/purchase-failure` routes without conflicting with either. This keeps a "browse
everything" experience available without inventing a new pattern for it, and is exactly where the
home page's "Browse all products" button/link points.

## 4. Data layer — what's new

Two new query functions are needed; everything else (schema, tags, `ProductCard`) already exists
and can be reused as-is.

**"Most Popular"** — needs a new query, since nothing aggregates purchase counts per product yet
(the closest existing thing, `admin/sales/page.tsx`, lists individual purchases, not counts).
Rough shape, in `src/features/products/db/products.ts` (or a new file, see open question below):

```ts
async function getMostPurchasedProducts(limit = 6) {
  "use cache"
  cacheTag(getProductGlobalTag(), getPurchaseGlobalTag())

  return db
    .select({
      // product columns + a purchase count
    })
    .from(ProductTable)
    .leftJoin(PurchaseTable, and(
      eq(PurchaseTable.productId, ProductTable.id),
      isNull(PurchaseTable.refundedAt), // don't count refunded purchases
    ))
    .where(wherePublicProducts)
    .groupBy(ProductTable.id)
    .orderBy(desc(count(PurchaseTable.id)))
    .limit(limit)
}
```

Tagging with **both** `getProductGlobalTag()` and `getPurchaseGlobalTag()` matters: this section's
ranking changes whenever a purchase happens, not just when a product changes, so it needs to be
invalidated on both. (`revalidatePurchaseCache` already calls `revalidateTag(getPurchaseGlobalTag(),
"max")`, so no changes needed there — this new query just needs to depend on that same tag.)

**"Newly Added"** — simpler, just the existing product query with a different `orderBy` and a
`limit`:

```ts
async function getLatestProducts(limit = 6) {
  "use cache"
  cacheTag(getProductGlobalTag())

  return db.query.ProductTable.findMany({
    columns: { id: true, name: true, description: true, priceInDollars: true, imageUrl: true },
    where: wherePublicProducts,
    orderBy: desc(ProductTable.createdAt),
    limit,
  })
}
```

## 5. Component structure

- `HeroSection` — new, static-ish component (no data fetching). Content is copy/branding, not
  something to design without your input (see open questions).
- `ProductSection` — new, small wrapper component: a heading + a horizontal row or grid of
  `ProductCard`s + a "see more" link. Used twice (Most Popular, Newly Added) with different data
  and heading text, so one component serves both rather than duplicating markup.
- `ProductCard` — reused unchanged. No changes needed.
- Each `ProductSection`'s data-fetching part follows the codebase's existing convention: a
  `SuspenseBoundary`-named async component, wrapped in `<Suspense>` at the call site, matching
  every other dynamic/cached data section in this app (established during the Next 16 upgrade,
  see `NEXTJS_16_UPGRADE_PLAN.md`).

## 6. Non-functional considerations

- **Caching**: every new query follows the same `"use cache"` + `cacheTag(...)` pattern already
  used throughout the app — no new caching approach to invent.
- **Empty states**: a fresh install (or a slow week) might have zero purchases — "Most Popular"
  needs a sensible fallback (e.g., hide the section, or fall back to showing latest products)
  rather than rendering an empty section.
- **Refunds**: purchase-count ranking must exclude refunded purchases (`refundedAt IS NULL`) —
  already accounted for in the query sketch above.
- **Loading states**: reuse the existing `Skeleton`-style components (see
  `src/components/Skeleton.tsx`, already used on `/courses`) for each section's loading fallback,
  for visual consistency with the rest of the app.
- **Responsiveness**: this app's existing grid pattern
  (`grid-cols-[repeat(auto-fill,minmax(300px,1fr))]`) already handles mobile-to-desktop reasonably
  — reuse it for each section rather than inventing new breakpoints.

## 7. Open questions — need your input before implementation

1. **Hero content**: what should it actually say/show? Do you have copy, branding, or an image in
   mind, or should I draft placeholder copy to replace later?
2. **Section sizes**: how many products per section — I defaulted to 6 above, adjust as needed.
3. **"Most Popular" time window**: all-time purchase count, or a rolling window (e.g., last 30
   days)? All-time is simpler; a rolling window is more "currently trending" but needs a
   date-filtered query.
4. **Product vs. Course terminology**: the schema separates "Products" (what's purchased, can
   bundle multiple courses) from "Courses" (the actual content) — should the home sections show
   Products (consistent with the current catalog page) or surface individual Courses instead?
   Defaulting to Products in this plan since that's what `ProductCard`/purchasing already works
   with.
5. ~~Should `/products` (the new full-catalog page) keep the exact current home page layout, or do
   you want it redesigned too as part of this work?~~ **Resolved**: `/products` is the new
   full-catalog page (same layout as the current home grid), and it's what "Browse all products"
   links to.

## 8. Implementation phases (once the above is settled)

1. Build `/products` (`src/app/(consumer)/products/page.tsx`) as the new full-catalog page (move
   current home page content there essentially unchanged).
2. Rename `/admin/products` → `/admin/my-products` (folder move + heading text + every internal
   link/redirect listed in section 1) — independent of everything else here.
3. Add `getMostPurchasedProducts` and `getLatestProducts` query functions + cache tags.
4. Build `ProductSection` component with its `SuspenseBoundary` pattern and skeleton fallback.
5. Build `HeroSection` (content pending open question #1).
6. Assemble the new home page: Hero → Most Popular → Newly Added → "Browse all products" link
   (→ `/products`).
7. Manual QA: empty-purchase-history fresh state, refunded purchases excluded correctly, mobile
   layout, cache invalidation (buy something, confirm "Most Popular" can reflect it).
