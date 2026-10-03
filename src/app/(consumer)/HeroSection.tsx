import Link from "next/link"

const perks = ["Lifetime access", "Project-based lessons", "Regional pricing"]

const lessons = [
  { name: "Setting up your environment", done: true },
  { name: "Modules, npm & project structure", done: true },
  { name: "Building a REST API from scratch", current: true },
  { name: "Databases & authentication" },
]

export function HeroSection() {
  return (
    <section className="gap-16 grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-22 pb-18 w-full max-w-310 max-[720px]:gap-8 max-[720px]:pt-10">
      <div className="animate-rise">
        <div className="inline-flex items-center gap-2 bg-violet-soft px-3 py-1.5 border border-violet-line rounded-full font-mono text-accent text-xs uppercase tracking-[0.06em] whitespace-nowrap">
          <span className="bg-accent rounded-full size-1.5" />
          Learning, made practical
        </div>
        <h1 className="mt-6.5 font-semibold text-[clamp(48px,6.6vw,92px)] leading-[0.95] tracking-[-0.045em] text-balance max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
          Learn new skills.
          <br />
          <span className="text-accent">Build real</span> projects.
        </h1>
        <p className="mt-7 max-w-125 text-[19px] text-muted-foreground leading-[1.55] text-pretty">
          Hands-on courses where every lesson ends in working code. Follow along
          at your own pace, and finish with a project you can actually show.
        </p>
        <div className="flex flex-wrap gap-3 mt-9">
          <Link
            href="/all-products"
            className="flex items-center gap-2.5 bg-primary px-6.5 py-4 rounded-full font-medium text-[15px] text-primary-foreground hover:text-white transition-colors hover:bg-accent"
          >
            Browse products <span>→</span>
          </Link>
          <Link
            href="/#how"
            className="px-6.5 py-4 border border-line-strong hover:border-foreground rounded-full font-medium text-[15px] transition-colors"
          >
            See how it works
          </Link>
        </div>
        <ul className="flex flex-wrap gap-7 mt-11 text-muted-foreground text-sm">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* NOTE: decorative lesson-player preview, not real course data */}
      <div
        aria-hidden="true"
        className="relative animate-rise [animation-delay:150ms]"
      >
        <div className="bg-card shadow-[0_30px_80px_-30px_rgba(40,30,10,0.25)] border rounded-[22px] overflow-hidden">
          <div className="relative place-items-center grid bg-[repeating-linear-gradient(135deg,#1E1B14_0_10px,#25211A_10px_20px)] aspect-video">
            <span className="font-mono text-ink-soft text-xs">
              lesson video still
            </span>
            <div className="right-4.5 bottom-4 left-4.5 absolute flex items-center gap-3 text-background">
              <span className="place-items-center grid bg-lime rounded-full size-10 text-[14px] text-foreground">
                ▶
              </span>
              <div className="flex-1">
                <div className="opacity-70 text-[13px]">
                  Node.js Course · Lesson 3 of 5
                </div>
                <div className="font-medium text-[15px]">
                  Building a REST API from scratch
                </div>
              </div>
              <span className="opacity-70 font-mono text-xs">18:42</span>
            </div>
          </div>
          <div className="px-5.5 pt-5.5 pb-2.5">
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>Your progress</span>
              <span className="font-mono">60%</span>
            </div>
            <div className="bg-secondary mt-2.5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-accent rounded-full w-[60%] h-full" />
            </div>
          </div>
          <div className="flex flex-col px-3 pt-2 pb-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.name}
                className={
                  lesson.current
                    ? "flex items-center gap-3 bg-violet-soft p-2.5 rounded-[10px] font-medium text-sm"
                    : lesson.done
                      ? "flex items-center gap-3 p-2.5 text-ink-soft text-sm"
                      : "flex items-center gap-3 p-2.5 text-sm"
                }
              >
                {lesson.done ? (
                  <span className="place-items-center grid bg-foreground rounded-full size-5.5 text-[11px] text-lime">
                    ✓
                  </span>
                ) : lesson.current ? (
                  <span className="place-items-center grid bg-accent rounded-full size-5.5 text-[10px] text-white">
                    ▶
                  </span>
                ) : (
                  <span className="border-[1.5px] border-line-strong rounded-full size-5.5" />
                )}
                <span
                  className={lesson.done ? "flex-1 line-through" : "flex-1"}
                >
                  {lesson.name}
                </span>
                {lesson.current && (
                  <span className="font-mono text-[11px] text-accent">NOW</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="-bottom-6.5 -left-7 max-[720px]:left-2 absolute flex items-center gap-3 bg-lime shadow-[0_16px_40px_-16px_rgba(40,30,10,0.35)] px-4.5 py-3.5 rounded-2xl -rotate-3">
          <span className="font-bold text-xl tracking-[-0.02em]">Shipped.</span>
          <span className="text-[13px] leading-[1.3]">
            Final project
            <br />
            deployed live
          </span>
        </div>
      </div>
    </section>
  )
}
