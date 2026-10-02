import { Eyebrow } from "./Eyebrow"

const steps = [
  {
    title: "Pick a course",
    text: "One-time payment, no subscription. Sign in and it's yours for good — including every future update.",
  },
  {
    title: "Build along",
    text: "Short, focused video lessons. Each one adds a real piece to your project, and your progress saves automatically.",
  },
  {
    title: "Ship it",
    text: "Finish with a working, deployed project for your portfolio — not a certificate of watching videos.",
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how"
      className="mx-auto px-6 py-27.5 w-full max-w-310 scroll-mt-16"
    >
      <Eyebrow>02 — How it works</Eyebrow>
      <h2 className="mt-3.5 max-w-195 font-semibold text-[clamp(38px,4.6vw,60px)] leading-none tracking-[-0.04em]">
        From first lesson to{" "}
        <span className="text-accent">shipped project</span> in three steps.
      </h2>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] mt-14 border-foreground border-t">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="px-0 md:px-8 py-8 md:first:pl-0 md:last:pr-0 md:not-last:border-r"
          >
            <div className="font-mono font-medium text-accent text-[44px] leading-none tracking-[-0.04em]">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-6 mb-2.5 font-semibold text-[22px] tracking-[-0.02em]">
              {step.title}
            </h3>
            <p className="text-[16px] text-muted-foreground leading-[1.55]">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
