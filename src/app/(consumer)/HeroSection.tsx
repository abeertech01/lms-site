import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 md:py-28 text-center container">
      <p className="mb-4 font-medium text-accent text-sm">
        Learning, made practical
      </p>
      <h1 className="font-bold text-4xl md:text-6xl text-balance tracking-tight">
        Learn new skills.
        <br className="hidden md:block" />
        Build real projects.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-lg text-balance">
        Hands-on courses designed to help you build practical, real-world skills
        — learn at your own pace, on your own schedule.
      </p>
      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/products">Browse All Products</Link>}
        />
      </div>
    </section>
  )
}
