import { cacheLife } from "next/cache"

export async function Footer() {
  const year = await getCurrentYear()

  return (
    <footer className="border-t py-6">
      <p className="container text-center text-sm text-muted-foreground">
        © {year} TripleA. All rights reserved.
      </p>
    </footer>
  )
}

async function getCurrentYear() {
  "use cache"
  cacheLife("days")

  return new Date().getFullYear()
}
