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
    <Link
      href={`/all-products/${id}`}
      className="block mx-auto w-full max-w-125"
    >
      <Card className="flex flex-col hover:shadow-md size-full overflow-hidden transition-shadow">
        <div className="relative w-full aspect-video">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
        <CardHeader className="space-y-0">
          <CardDescription className="font-medium text-violet-600">
            {/* <Suspense> lets you pause rendering part of the UI until some async data or component is ready. While waiting, React shows the fallback content. */}
            <Suspense fallback={formatPrice(priceInDollars)}>
              <Price price={priceInDollars} />
            </Suspense>
          </CardDescription>
          <div className="flex justify-between items-center gap-2">
            <CardTitle className="text-xl">{name}</CardTitle>
            <Badge className="bg-violet-100 hover:bg-violet-100 text-violet-700 shrink-0">
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
    <div className="flex items-baseline gap-2">
      <div className={"line-through text-xs opacity-50"}>
        {formatPrice(price)}
      </div>

      <div>{formatPrice(price * (1 - coupon.discountPercentage))}</div>
    </div>
  )
}
