import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toast"
import { Footer } from "@/components/Footer"
import { ClerkProvider } from "@clerk/nextjs"
import { clerkAppearance } from "@/lib/clerkAppearance"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata: Metadata = {
  title: "TripleA LMS",
  description:
    "Learn new skills. Build real projects - A learning management system",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider appearance={clerkAppearance}>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
