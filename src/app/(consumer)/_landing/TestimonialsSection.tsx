import { Eyebrow } from "./Eyebrow"

// TODO: placeholder quotes from the design mockup — replace with real learner
// testimonials (or remove this section) before relying on it in production.
export function TestimonialsSection() {
  return (
    <section className="mx-auto px-6 py-27.5 w-full max-w-310">
      <Eyebrow>04 — From learners</Eyebrow>
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mt-9">
        <figure className="flex flex-col justify-between gap-10 bg-violet-soft p-7 md:p-11 rounded-[22px] md:col-span-2 min-w-0">
          <blockquote className="font-medium text-[clamp(26px,2.8vw,36px)] leading-[1.2] tracking-[-0.025em] text-pretty">
            “I&apos;d watched hours of tutorials and built nothing. Two weeks
            into the Node.js course I had an API running in production.”
          </blockquote>
          <Person
            name="Rafiq H."
            role="Junior backend developer"
            tone="violet"
          />
        </figure>
        <figure className="flex flex-col justify-between gap-8 bg-card p-7 md:p-9 border rounded-[22px] min-w-0">
          <blockquote className="text-[18px] leading-normal text-pretty">
            “The AI/ML course explains the math without drowning you in it.
            Finally clicked for me.”
          </blockquote>
          <Person name="Nadia S." role="CS student" tone="neutral" />
        </figure>
      </div>
    </section>
  )
}

function Person({
  name,
  role,
  tone,
}: {
  name: string
  role: string
  tone: "violet" | "neutral"
}) {
  return (
    <figcaption className="flex items-center gap-3.5">
      <span
        className={
          tone === "violet"
            ? "rounded-full size-11 bg-[repeating-linear-gradient(135deg,#D9D2FB_0_5px,#CFC6FA_5px_10px)]"
            : "rounded-full size-11 bg-[repeating-linear-gradient(135deg,#ECE8DF_0_5px,#E0DBCF_5px_10px)]"
        }
      />
      <div>
        <div className="font-semibold text-[15px]">{name}</div>
        <div className="text-muted-foreground text-sm">{role}</div>
      </div>
    </figcaption>
  )
}
