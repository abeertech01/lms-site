// NOTE: variables reference the app's existing shadcn CSS custom properties
// (globals.css) directly via var(...), so Clerk's UI stays in sync with the
// app's theme automatically, including dark mode — no separate palette to
// maintain.
export const clerkAppearance = {
  options: {
    logoPlacement: "none" as const,
  },
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorBackground: "var(--card)",
    colorForeground: "var(--card-foreground)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorInput: "var(--background)",
    colorInputForeground: "var(--foreground)",
    colorBorder: "var(--border)",
    colorRing: "var(--ring)",
    colorDanger: "var(--destructive)",
    fontFamily: "var(--font-sans)",
    borderRadius: "var(--radius-md)",
  },
  elements: {
    rootBox: "max-[480px]:w-full!",
    cardBox:
      "shadow-xl border border-border max-[480px]:w-full! max-[480px]:max-w-full!",
    card: "gap-6 p-8 max-[480px]:gap-5 max-[480px]:p-5",
    headerTitle: "text-2xl font-semibold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border-border hover:bg-muted rounded-lg h-9 text-sm font-medium max-[720px]:h-11! max-[720px]:text-base!",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-xs uppercase tracking-wide",
    formFieldLabel: "text-foreground text-sm font-medium",
    formFieldInput: "rounded-lg h-9 max-[720px]:h-11! max-[720px]:text-base!",
    formButtonPrimary:
      "rounded-lg h-9 text-sm font-medium normal-case shadow-none max-[720px]:h-11! max-[720px]:text-base!",
    footerActionText: "text-muted-foreground text-sm",
    footerActionLink:
      "text-primary font-medium hover:underline underline-offset-4",
    identityPreviewEditButton: "text-primary",
    formResendCodeLink: "text-primary hover:underline underline-offset-4",
  },
}
