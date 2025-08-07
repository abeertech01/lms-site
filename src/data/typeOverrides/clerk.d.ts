import { UserRole } from "@/drizzle/schema"

/** export {}
 * a file in TypeScript (or ES modules) becomes a module only when it has at least one import or export.
 * here, export gives a security - if the import is removed for any reason it will still be a module with the export.
 */
export {}

declare global {
  interface CustomJwtSessionClaims {
    dbId?: string
    role?: UserRole
  }

  interface UserPublicMetadata {
    dbId?: string
    role?: UserRole
  }
}
