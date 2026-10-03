import { db } from "@/drizzle/db"
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema"
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses"
import { getUserCourseAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess"
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache"
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache"
import { formatNumber, formatPrice } from "@/lib/formatters"
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { ReactNode } from "react"
import { Eyebrow } from "../(consumer)/_landing/Eyebrow"

export default async function AdminPage() {
  const {
    averageNetPurchaseCustomer,
    netPurchases,
    netSales,
    refundedPurchases,
    totalRefunds,
  } = await getPurchaseDetails()

  return (
    <div className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-7 pb-27.5 w-full max-w-310">
      <section className="animate-rise">
        <Eyebrow>Dashboard</Eyebrow>
        <h1 className="mt-2 font-semibold text-[44px] leading-none tracking-[-0.045em] max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02] max-[380px]:text-[clamp(28px,10.5vw,36px)]">
          Overview<span className="text-accent">.</span>
        </h1>
      </section>

      <StatSection title="Sales" className="mt-7">
        <StatCard title="Net sales" highlight>
          {formatPrice(netSales, { showZeroAsNumber: true })}
        </StatCard>
        <StatCard title="Refunded sales">
          {formatPrice(totalRefunds, { showZeroAsNumber: true })}
        </StatCard>
        <StatCard title="Un-refunded purchases">
          {formatNumber(netPurchases)}
        </StatCard>
        <StatCard title="Refunded purchases">
          {formatNumber(refundedPurchases)}
        </StatCard>
        <StatCard title="Purchases per user">
          {formatNumber(averageNetPurchaseCustomer, {
            maximumFractionDigits: 2,
          })}
        </StatCard>
      </StatSection>

      <StatSection title="Catalog" className="mt-6">
        <StatCard title="Students">
          {formatNumber(await getTotalStudents())}
        </StatCard>
        <StatCard title="Products">
          {formatNumber(await getTotalProducts())}
        </StatCard>
        <StatCard title="Courses">
          {formatNumber(await getTotalCourses())}
        </StatCard>
        <StatCard title="Course sections">
          {formatNumber(await getTotalCourseSections())}
        </StatCard>
        <StatCard title="Lessons">
          {formatNumber(await getTotalLessons())}
        </StatCard>
      </StatSection>
    </div>
  )
}

function StatSection({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={className}>
      <div className="pb-2.5 border-foreground border-b font-mono text-ink-soft text-xs uppercase tracking-[0.08em]">
        {title}
      </div>
      <div className="gap-3.5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] mt-4">
        {children}
      </div>
    </section>
  )
}

function StatCard({
  title,
  highlight = false,
  children,
}: {
  title: string
  highlight?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={
        highlight
          ? "flex flex-col justify-between gap-3.5 bg-foreground px-5 py-4.5 rounded-[20px] min-w-0 text-background"
          : "flex flex-col justify-between gap-3.5 bg-card px-5 py-4.5 border rounded-[20px] min-w-0"
      }
    >
      <span
        className={
          highlight
            ? "text-[14px] text-[#b5afa3]"
            : "text-[14px] text-muted-foreground"
        }
      >
        {title}
      </span>
      <span
        className={
          highlight
            ? "font-semibold text-[34px] text-lime leading-none tracking-[-0.04em]"
            : "font-semibold text-[34px] leading-none tracking-[-0.04em]"
        }
      >
        {children}
      </span>
    </div>
  )
}

async function getPurchaseDetails() {
  "use cache"
  cacheTag(getPurchaseGlobalTag())

  const data = await db
    .select({
      totalSales: sql<number>`COALESCE(${sum(
        PurchaseTable.pricePaidInCents,
      )}, 0)`.mapWith(Number),
      totalPurchases: count(PurchaseTable.id),
      totalUsers: countDistinct(PurchaseTable.userId),
      isRefund: isNotNull(PurchaseTable.refundedAt),
    })
    .from(PurchaseTable)
    .groupBy((table) => table.isRefund)
  /** NOTE: sql<number>`COALESCE(${sum(PurchaseTable.pricePaidInCents)}, 0)`
   * sum(PurchaseTable.pricePaidInCents): This creates an SQL SUM() function that totals all pricePaidInCents values in the table.
   * COALESCE(..., 0): COALESCE is a SQL function that returns the first non-null value in its arguments. So if SUM(...) returns NULL (e.g. no rows matched), COALESCE will return 0.
   */

  const [refundData] = data.filter((row) => row.isRefund)
  const [salesData] = data.filter((row) => !row.isRefund)

  const netSales = (salesData?.totalSales ?? 0) / 100
  const totalRefunds = (refundData?.totalSales ?? 0) / 100
  const netPurchases = salesData?.totalPurchases ?? 0
  const refundedPurchases = refundData?.totalPurchases ?? 0
  const averageNetPurchaseCustomer =
    salesData?.totalUsers != null && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchaseCustomer,
  }
}

async function getTotalStudents() {
  "use cache"
  cacheTag(getUserCourseAccessGlobalTag())

  const [data] = await db
    .select({ totalStudents: countDistinct(UserCourseAccessTable.userId) })
    .from(UserCourseAccessTable)

  if (data == null) return 0
  return data.totalStudents
}

async function getTotalCourses() {
  "use cache"
  cacheTag(getCourseGlobalTag())

  const [data] = await db
    .select({ totalCourses: count(CourseTable.id) })
    .from(CourseTable)

  if (data == null) return 0
  return data.totalCourses
}

async function getTotalProducts() {
  "use cache"
  cacheTag(getProductGlobalTag())

  const [data] = await db
    .select({ totalProducts: count(ProductTable.id) })
    .from(ProductTable)

  if (data == null) return 0
  return data.totalProducts
}

async function getTotalLessons() {
  "use cache"
  cacheTag(getLessonGlobalTag())

  const [data] = await db
    .select({ totalLessons: count(LessonTable.id) })
    .from(LessonTable)

  if (data == null) return 0
  return data.totalLessons
}

async function getTotalCourseSections() {
  "use cache"
  cacheTag(getCourseSectionGlobalTag())

  const [data] = await db
    .select({ totalCourseSections: count(CourseSectionTable.id) })
    .from(CourseSectionTable)

  if (data == null) return 0
  return data.totalCourseSections
}
