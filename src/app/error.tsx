"use client"

import {
  StatusScreen,
  statusPrimaryClass,
  statusSecondaryClass,
} from "@/components/StatusScreen"
import Link from "next/link"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
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
          We hit a problem loading this page. You can try again, or head back
          home.
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
      <Link href="/" className={statusSecondaryClass}>
        Back to home
      </Link>
    </StatusScreen>
  )
}
