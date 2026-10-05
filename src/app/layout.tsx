import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toast"
import { Footer } from "@/components/Footer"
import { ClerkProvider } from "@clerk/nextjs"
import { clerkAppearance } from "@/lib/clerkAppearance"
import { env } from "@/data/env/client"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

// NOTE: metadataBase turns relative metadata URLs (canonical, og:image) into absolute ones.
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SERVER_URL),
  title: "TripleA LMS",
  description:
    "Learn new skills. Build real projects - A learning management system",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body
        // NOTE: browser extensions (e.g. ColorZilla adds cz-shortcut-listen) edit <body>
        // before React loads; this silences that one harmless mismatch warning.
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
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
