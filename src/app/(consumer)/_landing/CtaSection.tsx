import Link from "next/link"

export function CtaSection() {
  return (
    <section className="px-6 pb-6">
      <div className="items-end gap-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] bg-accent mx-auto px-[clamp(28px,5vw,72px)] py-[clamp(48px,7vw,96px)] rounded-[28px] max-w-310 text-white">
        <h2 className="font-semibold text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.045em]">
          Stop watching.
          <br />
          <span className="text-lime">Start building.</span>
        </h2>
        <div className="flex flex-col items-start gap-5.5">
          <p className="max-w-105 text-[18px] leading-[1.55]">
            Create your account in under a minute. Regional pricing is applied
            automatically at checkout.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="bg-lime px-6.5 py-4 rounded-full font-semibold text-[15px] text-foreground transition-colors hover:bg-white"
            >
              Create free account →
            </Link>
            <Link
              href="/all-products"
              className="px-6.5 py-4 border border-white/50 hover:border-white rounded-full font-medium text-[15px] transition-colors"
            >
              View products
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
