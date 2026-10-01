import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/components/Skeleton"
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
  lessonsCount: number
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
    <section className="py-8 container">
      <h2 className="mb-6 font-semibold text-2xl">{heading}</h2>
      <div className="gap-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
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
    <section className="py-8 container">
      <h2 className="mb-6 font-semibold text-2xl">{heading}</h2>
      <div className="gap-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        <SkeletonArray amount={amount}>
          <SkeletonProductCard />
        </SkeletonArray>
      </div>
    </section>
  )
}

function SkeletonProductCard() {
  return (
    <Card className="flex flex-col mx-auto w-full max-w-125 overflow-hidden">
      <div className="relative bg-secondary w-full aspect-video animate-pulse" />
      <CardHeader className="space-y-0">
        <CardDescription>
          <SkeletonText className="w-1/4" />
        </CardDescription>
        <div className="flex justify-between items-center gap-2">
          <CardTitle className="w-3/4">
            <SkeletonText className="w-3/4" />
          </CardTitle>
          <SkeletonText className="w-16 shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <SkeletonText rows={2} />
      </CardContent>
      <div className="mx-6 border-t" />
      <CardFooter className="flex justify-between items-center gap-4 mt-auto pt-4">
        <div className="flex items-center gap-2">
          <div className="bg-secondary rounded-full size-8 animate-pulse shrink-0" />
          <SkeletonText className="w-20" />
        </div>
        <SkeletonButton />
      </CardFooter>
    </Card>
  )
}
