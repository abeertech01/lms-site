"use client"

import { UserButton } from "@clerk/nextjs"
import { ReceiptIcon, ShieldIcon } from "lucide-react"

export function UserMenu({ isAdmin }: { isAdmin: boolean }) {
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: {
            width: "100%",
            height: "100%",
          },
        },
      }}
    >
      <UserButton.MenuItems>
        {isAdmin && (
          <UserButton.Link
            href="/admin"
            label="Admin"
            labelIcon={<ShieldIcon className="size-4" />}
          />
        )}
        <UserButton.Link
          href="/purchases"
          label="Purchases History"
          labelIcon={<ReceiptIcon className="size-4" />}
        />
      </UserButton.MenuItems>
    </UserButton>
  )
}
