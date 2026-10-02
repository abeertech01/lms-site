import { Eyebrow } from "./Eyebrow"

const features = [
  {
    tag: "/video",
    title: "Focused video lessons",
    text: "Tight, edited lessons you can finish in one sitting.",
  },
  {
    tag: "/code",
    title: "Source code per lesson",
    text: "Starter and finished files so you never get stuck on setup.",
  },
  {
    tag: "/progress",
    title: "Progress that sticks",
    text: "Pick up exactly where you left off, on any device.",
  },
  {
    tag: "/forever",
    title: "Lifetime access",
    text: "Pay once. Keep the course and all future updates.",
  },
]

export function InsideSection() {
  return (
    <section id="inside" className="bg-foreground text-background scroll-mt-16">
      <div className="mx-auto px-6 py-27.5 max-w-310">
        <div className="items-end gap-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          <div>
            <Eyebrow className="text-lime">03 — What&apos;s inside</Eyebrow>
            <h2 className="mt-3.5 font-semibold text-[clamp(38px,4.6vw,60px)] leading-none tracking-[-0.04em]">
              Everything you need.{" "}
              <span className="text-lime">Nothing you don&apos;t.</span>
            </h2>
          </div>
          <p className="max-w-115 text-[18px] text-[#b5afa3] leading-[1.55]">
            A focused learning space built around doing the work — no feeds, no
            badges, no noise.
          </p>
        </div>
        <div className="gap-px grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] bg-[#2e2a22] mt-16 border border-[#2e2a22] rounded-[20px] overflow-hidden">
          {features.map((feature) => (
            <div
              key={feature.tag}
              className="flex flex-col gap-3 bg-foreground p-8 min-h-50"
            >
              <span className="font-mono text-lime text-xs">{feature.tag}</span>
              <h3 className="font-semibold text-xl">{feature.title}</h3>
              <p className="text-[15px] text-[#b5afa3] leading-[1.55]">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
