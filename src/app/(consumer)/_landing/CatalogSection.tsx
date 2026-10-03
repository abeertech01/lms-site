import { SkeletonArray, SkeletonText } from "@/components/Skeleton"
import {
  getLatestProducts,
  getMostPurchasedProducts,
} from "@/features/products/db/products"
import { ProductCard } from "@/features/products/components/ProductCard"
import { CatalogTabs } from "./CatalogTabs"
import { Eyebrow } from "./Eyebrow"

type Product = Parameters<typeof ProductCard>[0]

export async function CatalogSection() {
  const [popular, newest] = await Promise.all([
    getMostPurchasedProducts(3),
    getLatestProducts(3),
  ])
  if (popular.length === 0 && newest.length === 0) return null

  return (
    <CatalogTabs
      heading={<CatalogHeading />}
      popular={<ProductGrid products={popular} />}
      newest={<ProductGrid products={newest} />}
    />
  )
}

function CatalogHeading() {
  return (
    <div>
      <Eyebrow>01 — The catalog</Eyebrow>
      <h2 className="mt-3.5 font-semibold text-[clamp(38px,4.6vw,60px)] leading-none tracking-[-0.04em]">
        Products worth <span className="text-accent">finishing.</span>
      </h2>
    </div>
  )
}

const gridClass =
  "gap-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))]"

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="text-muted-foreground">Nothing here yet.</p>
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}

export function CatalogSectionSkeleton() {
  return (
    <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-27.5 pb-10 w-full max-w-310">
      <CatalogHeading />
      <div className={`${gridClass} mt-12`}>
        <SkeletonArray amount={3}>
          <SkeletonProductCard />
        </SkeletonArray>
      </div>
    </section>
  )
}

function SkeletonProductCard() {
  return (
    <div className="flex flex-col bg-card border rounded-[20px] overflow-hidden">
      <div className="bg-secondary aspect-16/10 animate-pulse" />
      <div className="flex flex-col gap-3 p-5.5">
        <SkeletonText className="w-1/4" />
        <SkeletonText className="w-3/4" />
        <SkeletonText rows={2} />
      </div>
    </div>
  )
}
