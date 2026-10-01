"use client"

import { useIsMobile } from "@/hooks/use-is-mobile"
import { UserButton } from "@clerk/nextjs"
import { BarChart3Icon, GraduationCapIcon, LayoutGridIcon } from "lucide-react"

export function AdminUserMenu() {
  const isMobile = useIsMobile()

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: {
            width: "100%",
            height: "100%",
          },
          ...(isMobile
            ? {
                userButtonPopoverRootBox: {
                  right: 0,
                  left: "auto",
                },
                userButtonPopoverCard: {
                  right: 0,
                  left: "auto",
                  maxWidth: "min(22rem, calc(100vw - 1.5rem))",
                },
              }
            : {}),
        },
      }}
    >
      <UserButton.MenuItems>
        {isMobile && (
          <UserButton.Link
            href="/admin/courses"
            label="Courses"
            labelIcon={<GraduationCapIcon className="size-4" />}
          />
        )}
        {isMobile && (
          <UserButton.Link
            href="/admin/my-products"
            label="My Products"
            labelIcon={<LayoutGridIcon className="size-4" />}
          />
        )}
        {isMobile && (
          <UserButton.Link
            href="/admin/sales"
            label="Sales"
            labelIcon={<BarChart3Icon className="size-4" />}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  )
}
