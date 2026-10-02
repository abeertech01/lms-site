import {
  StatusScreen,
  statusPrimaryClass,
  statusSecondaryClass,
} from "@/components/StatusScreen"
import Link from "next/link"

export default function NotFound() {
  return (
    <StatusScreen
      badge="?"
      eyebrow="Error 404"
      title={
        <>
          Page <span className="text-accent">not found.</span>
        </>
      }
      description="The page you're looking for doesn't exist or may have been moved."
    >
      <Link href="/" className={statusPrimaryClass}>
        Back to home →
      </Link>
      <Link href="/all-products" className={statusSecondaryClass}>
        Browse products
      </Link>
    </StatusScreen>
  )
}
