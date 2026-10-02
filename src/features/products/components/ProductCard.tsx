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
    <Link href={`/all-products/${id}`} className="group block h-full">
      <article className="flex flex-col bg-card group-hover:shadow-[0_30px_60px_-30px_rgba(40,30,10,0.3)] border rounded-[20px] h-full overflow-hidden text-foreground transition duration-200 group-hover:-translate-y-1">
        <div className="relative bg-secondary aspect-16/10">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col flex-1 gap-3 p-5.5">
          <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.03em]">
            {lessonsCount} {lessonsCount === 1 ? "lesson" : "lessons"}
          </div>
          <h3 className="font-semibold text-[22px] leading-tight tracking-[-0.03em]">
            {name}
          </h3>
          <p className="text-[14.5px] text-muted-foreground line-clamp-3 leading-normal text-pretty">
            {description}
          </p>
          <div className="flex justify-between items-center gap-2.5 mt-auto pt-4 border-t">
            {/* <Suspense> lets you pause rendering part of the UI until some async data or component is ready. While waiting, React shows the fallback content. */}
            <Suspense
              fallback={
                <PriceBlock>
                  <PriceText>{formatPrice(priceInDollars)}</PriceText>
                </PriceBlock>
              }
            >
              <Price price={priceInDollars} />
            </Suspense>
            <span className="bg-primary px-3.5 py-2.5 rounded-full font-medium text-[13px] text-primary-foreground whitespace-nowrap">
              Enroll →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon()
  if (price === 0 || coupon == null) {
    return (
      <PriceBlock>
        <PriceText>{formatPrice(price)}</PriceText>
      </PriceBlock>
    )
  }

  return (
    <PriceBlock>
      <div className="flex items-baseline gap-2">
        <PriceText>
          {formatPrice(price * (1 - coupon.discountPercentage))}
        </PriceText>
        <span className="opacity-50 text-xs line-through">
          {formatPrice(price)}
        </span>
      </div>
      <span className="font-mono text-[11px] text-accent">
        Regional pricing
      </span>
    </PriceBlock>
  )
}

function PriceBlock({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5">{children}</div>
}

function PriceText({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold text-2xl tracking-[-0.03em]">
      {children}
    </span>
  )
}
