import { SkeletonArray, SkeletonButton, SkeletonText } from "@/components/Skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProductCard } from "@/features/products/components/ProductCard"

type Product = {
  id: string
  name: string
  description: string
  priceInDollars: number
  imageUrl: string
}

export function ProductSection({
  heading,
  products,
}: {
  heading: string
  products: Product[]
}) {
  if (products.length === 0) return null

  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold mb-6">{heading}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}

export function ProductSectionSkeleton({
  heading,
  amount,
}: {
  heading: string
  amount: number
}) {
  return (
    <section className="container py-8">
      <h2 className="text-2xl font-semibold mb-6">{heading}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        <SkeletonArray amount={amount}>
          <SkeletonProductCard />
        </SkeletonArray>
      </div>
    </section>
  )
}

function SkeletonProductCard() {
  return (
    <Card className="overflow-hidden flex flex-col w-full max-w-[500px] mx-auto">
      <div className="relative aspect-video w-full bg-secondary animate-pulse" />
      <CardHeader className="space-y-0">
        <CardDescription>
          <SkeletonText className="w-1/4" />
        </CardDescription>
        <CardTitle>
          <SkeletonText className="w-3/4" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SkeletonText rows={2} />
      </CardContent>
      <CardFooter className="mt-auto">
        <SkeletonButton className="w-full" />
      </CardFooter>
    </Card>
  )
}
