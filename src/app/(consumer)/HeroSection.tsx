import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="container py-20 md:py-28 text-center">
      <p className="text-sm font-medium text-accent mb-4">
        Learning, made practical
      </p>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
        Learn new skills.
        <br className="hidden md:block" />
        Build real projects.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
        Hands-on courses designed to help you build practical, real-world
        skills — learn at your own pace, on your own schedule.
      </p>
      <div className="mt-8 flex justify-center">
        <Button size="lg" asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    </section>
  )
}
