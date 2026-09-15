"use client"

import { useIsMobile } from "@/hooks/use-is-mobile"
import { UserButton } from "@clerk/nextjs"
import { GraduationCapIcon, LayoutGridIcon, ReceiptIcon, ShieldIcon } from "lucide-react"

export function UserMenu({ isAdmin }: { isAdmin: boolean }) {
  const isMobile = useIsMobile()

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: {
            width: "100%",
            height: "100%",
          },
          userButtonPopoverRootBox: {
            right: 0,
            left: "auto",
          },
          userButtonPopoverCard: {
            right: 0,
            left: "auto",
            maxWidth: "min(22rem, calc(100vw - 1.5rem))",
          },
        },
      }}
    >
      <UserButton.MenuItems>
        {isMobile && (
          <UserButton.Link
            href="/products"
            label="All Products"
            labelIcon={<LayoutGridIcon className="size-4" />}
          />
        )}
        {isMobile && (
          <UserButton.Link
            href="/courses"
            label="My Courses"
            labelIcon={<GraduationCapIcon className="size-4" />}
          />
        )}
        {isMobile && isAdmin && (
          <UserButton.Link
            href="/admin"
            label="Admin"
            labelIcon={<ShieldIcon className="size-4" />}
          />
        )}
        {isMobile && (
          <UserButton.Link
            href="/purchases"
            label="Purchases History"
            labelIcon={<ReceiptIcon className="size-4" />}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  )
}
