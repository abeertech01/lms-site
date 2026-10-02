import { Suspense } from "react"
import { HeroSection } from "./HeroSection"
import { Marquee } from "./_landing/Marquee"
import {
  CatalogSection,
  CatalogSectionSkeleton,
} from "./_landing/CatalogSection"
import { HowItWorksSection } from "./_landing/HowItWorksSection"
import { InsideSection } from "./_landing/InsideSection"
import { TestimonialsSection } from "./_landing/TestimonialsSection"
import { FaqSection } from "./_landing/FaqSection"
import { CtaSection } from "./_landing/CtaSection"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Marquee />
      <Suspense fallback={<CatalogSectionSkeleton />}>
        <CatalogSection />
      </Suspense>
      <HowItWorksSection />
      <InsideSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
