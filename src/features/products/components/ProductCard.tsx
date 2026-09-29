import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatPrice } from "@/lib/formatters"
import { getUserCoupon } from "@/lib/userCountryHeader"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

export function ProductCard({
  id,
  imageUrl,
  name,
  priceInDollars,
  description,
  lessonsCount,
}: {
  id: string
  imageUrl: string
  name: string
  priceInDollars: number
  description: string
  lessonsCount: number
}) {
  return (
    <Link href={`/products/${id}`} className="block w-full max-w-125 mx-auto">
      <Card className="overflow-hidden flex flex-col size-full transition-shadow hover:shadow-md">
        <div className="relative aspect-video w-full">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
        <CardHeader className="space-y-0">
          <CardDescription className="text-violet-600 font-medium">
            {/* <Suspense> lets you pause rendering part of the UI until some async data or component is ready. While waiting, React shows the fallback content. */}
            <Suspense fallback={formatPrice(priceInDollars)}>
              <Price price={priceInDollars} />
            </Suspense>
          </CardDescription>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl">{name}</CardTitle>
            <Badge className="shrink-0 bg-violet-100 text-violet-700 hover:bg-violet-100">
              {lessonsCount} {lessonsCount === 1 ? "lesson" : "lessons"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon()
  if (price === 0 || coupon == null) {
    return formatPrice(price)
  }

  return (
    <div className="flex gap-2 items-baseline">
      <div className={"line-through text-xs opacity-50"}>
        {formatPrice(price)}
      </div>

      <div>{formatPrice(price * (1 - coupon.discountPercentage))}</div>
    </div>
  )
}
