import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Eyebrow } from "./Eyebrow"

const faqs = [
  {
    q: "Do I need any experience?",
    a: "The Node.js course starts from the basics — if you know a little JavaScript, you’re ready. AI/ML Engineering assumes some Python and programming fundamentals.",
  },
  {
    q: "Is it a one-time payment?",
    a: "Yes. You pay once per course and keep lifetime access, including every future update. No subscriptions.",
  },
  {
    q: "How long do I have to finish?",
    a: "As long as you like. Lessons are self-paced and your progress saves automatically.",
  },
  {
    q: "How does regional pricing work?",
    a: "We believe good education shouldn’t depend on where you live. If you’re in a lower-income country, a discounted price is applied automatically at checkout — no codes or forms.",
  },
  {
    q: "Do I get the source code?",
    a: "Every lesson includes starter and finished code so you can compare, debug, and move forward.",
  },
]

export function FaqSection() {
  return (
    <section
      id="faq"
      className="gap-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] mx-auto px-6 pt-10 pb-27.5 w-full max-w-310 scroll-mt-16"
    >
      <div>
        <Eyebrow>05 — FAQ</Eyebrow>
        <h2 className="mt-3.5 font-semibold text-[clamp(38px,4.6vw,56px)] leading-none tracking-[-0.04em]">
          Questions, <span className="text-accent">answered.</span>
        </h2>
      </div>
      <Accordion
        defaultValue={["faq-0"]}
        className="border-foreground border-t"
      >
        {faqs.map(({ q, a }, i) => (
          <AccordionItem key={q} value={`faq-${i}`} className="border-b">
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="group/trigger flex flex-1 justify-between gap-5 py-6 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 font-medium text-[18px] text-left tracking-[-0.01em] cursor-pointer">
                {q}
                <span
                  aria-hidden="true"
                  className="font-mono text-accent shrink-0"
                >
                  <span className="group-aria-expanded/trigger:hidden">+</span>
                  <span className="hidden group-aria-expanded/trigger:inline">
                    −
                  </span>
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="pb-6 max-w-140 text-[16px] text-muted-foreground leading-[1.6]">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
