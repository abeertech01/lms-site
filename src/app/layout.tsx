import type { Metadata } from "next"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "TripleA LMS",
  description: "A learning management system, TripleA",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
          <Toaster richColors={false} />
        </body>
      </html>
    </ClerkProvider>
  )
}
