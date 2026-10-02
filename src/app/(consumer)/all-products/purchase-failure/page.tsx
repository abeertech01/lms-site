import Link from "next/link"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const reasons = [
  "Card declined or insufficient funds",
  "Incorrect card details",
  "Payment window timed out",
]

export default async function ProductPurchaseFailurePage() {
  return (
    <section className="items-center gap-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] mx-auto px-6 pt-20 pb-27.5 w-full max-w-310">
      <div className="animate-rise">
        <div className="place-items-center grid bg-destructive/15 rounded-full size-16 font-semibold text-[28px] text-destructive animate-pop">
          !
        </div>
        <div className="mt-8 font-mono text-destructive text-xs uppercase tracking-[0.08em]">
          Payment not completed
        </div>
        <h1 className="mt-3.5 font-semibold text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.045em] text-balance">
          Purchase <span className="text-destructive">failed.</span>
        </h1>
        <p className="mt-5.5 max-w-120 text-[19px] text-muted-foreground leading-[1.55]">
          There was a problem purchasing your product. You haven&apos;t been
          charged. Please try again.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-8.5">
          <Link
            href="/all-products"
            className="bg-primary px-7 py-4 rounded-full font-medium text-[16px] text-primary-foreground hover:text-white whitespace-nowrap transition-colors hover:bg-accent"
          >
            Try again →
          </Link>
          <Link
            href="/"
            className="px-6.5 py-3.75 border border-foreground rounded-full font-medium text-[16px] hover:text-background whitespace-nowrap transition-colors hover:bg-foreground"
          >
            Back to home
          </Link>
        </div>
      </div>
      <div className="bg-card p-7 border rounded-[20px] animate-rise [animation-delay:100ms]">
        <div className="font-semibold text-[15px]">Common reasons</div>
        <ul className="mt-3.5 pl-5 text-[15px] text-muted-foreground leading-[1.8] list-disc">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
