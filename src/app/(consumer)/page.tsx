import {
  getLatestProducts,
  getMostPurchasedProducts,
} from "@/features/products/db/products"
import { Suspense } from "react"
import { HeroSection } from "./HeroSection"
import { ProductSection, ProductSectionSkeleton } from "./ProductSection"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense
        fallback={<ProductSectionSkeleton heading="Most Popular" amount={4} />}
      >
        <MostPopularSection />
      </Suspense>
      <Suspense
        fallback={<ProductSectionSkeleton heading="Newly Added" amount={4} />}
      >
        <NewlyAddedSection />
      </Suspense>
    </>
  )
}

async function MostPopularSection() {
  const products = await getMostPurchasedProducts(4)
  return <ProductSection heading="Most Popular" products={products} />
}

async function NewlyAddedSection() {
  const products = await getLatestProducts(4)
  return <ProductSection heading="Newly Added" products={products} />
}
