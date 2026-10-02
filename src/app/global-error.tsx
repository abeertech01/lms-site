"use client"

import { StatusScreen, statusPrimaryClass } from "@/components/StatusScreen"
import "./globals.css"

// NOTE: global-error replaces the root layout, so it brings its own <html>/<body>
// and imports the global styles itself. It only shows when the root layout breaks.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <StatusScreen
          tone="error"
          badge="!"
          eyebrow="Something went wrong"
          title={
            <>
              Unexpected <span className="text-destructive">error.</span>
            </>
          }
          description={
            <>
              The site hit a serious problem. Please try again in a moment.
              {error.digest && (
                <span className="block mt-3 font-mono text-ink-soft text-xs">
                  Reference: {error.digest}
                </span>
              )}
            </>
          }
        >
          <button
            type="button"
            onClick={() => retry()}
            className={statusPrimaryClass}
          >
            Try again →
          </button>
        </StatusScreen>
      </body>
    </html>
  )
}
