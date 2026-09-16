import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatPrice } from "@/lib/formatters"
import { getUserCoupon } from "@/lib/userCountryHeader"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

// TODO: replace with real per-course author data once the schema supports it
const AUTHOR_NAME = "Abdul Ahad"

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
    <Card className="overflow-hidden flex flex-col w-full max-w-[500px] mx-auto">
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
      <div className="mx-6 border-t" />
      <CardFooter className="mt-auto flex items-center justify-between gap-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {getInitials(AUTHOR_NAME)}
          </div>
          <span className="truncate text-sm font-medium">{AUTHOR_NAME}</span>
        </div>
        <Button
          variant="outline"
          className="border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white"
          asChild
        >
          <Link href={`/products/${id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
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
