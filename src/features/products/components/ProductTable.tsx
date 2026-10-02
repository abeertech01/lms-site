import ActionButton from "@/components/ActionButton"
import { Button } from "@/components/ui/button"
import { ProductStatus } from "@/drizzle/schema"
import { formatPlural, formatPrice } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { EyeIcon, LockIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { deleteProduct } from "../actions/products"

const rowClass =
  "gap-4 grid grid-cols-[minmax(0,1fr)_auto_auto] md:grid-cols-[minmax(0,1fr)_80px_120px_170px] items-center px-5 md:px-7"

export default function ProductTable({
  products,
}: {
  products: {
    id: string
    name: string
    description: string
    imageUrl: string
    priceInDollars: number
    status: ProductStatus
    coursesCount: number
    customersCount: number
  }[]
}) {
  return (
    <div className="bg-card border rounded-[22px] overflow-hidden">
      <div
        className={`${rowClass} py-4 border-b font-mono text-[11px] text-ink-soft uppercase tracking-[0.06em]`}
      >
        <span>
          {formatPlural(products.length, {
            singular: "product",
            plural: "products",
          })}
        </span>
        <span className="hidden md:block">Students</span>
        <span className="hidden md:block">Visibility</span>
        <span className="col-span-2 md:col-span-1 text-right">Actions</span>
      </div>
      <ul>
        {products.map((product) => (
          <li
            key={product.id}
            className={`${rowClass} py-3 border-b last:border-b-0`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Image
                className="rounded-xl border size-13 object-cover shrink-0"
                src={product.imageUrl}
                alt={product.name}
                width={192}
                height={192}
              />
              <div className="min-w-0">
                <div className="font-semibold text-[15px] tracking-[-0.01em]">
                  {product.name}
                </div>
                <div className="mt-0.75 text-[13px] text-ink-soft">
                  {formatPlural(product.coursesCount, {
                    singular: "course",
                    plural: "courses",
                  })}{" "}
                  · {formatPrice(product.priceInDollars)}
                </div>
              </div>
            </div>
            <span className="hidden md:block font-medium text-[15px]">
              {product.customersCount}
            </span>
            <div className="hidden md:block">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.25 rounded-full font-medium text-[13px] capitalize",
                  product.status === "public"
                    ? "bg-lime text-foreground"
                    : "border border-line-strong text-muted-foreground",
                )}
              >
                {getStatusIcon(product.status)} {product.status}
              </span>
            </div>
            <div className="col-span-2 md:col-span-1 flex justify-end items-center gap-2">
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <Link href={`/admin/my-products/${product.id}/edit`}>
                    Edit
                  </Link>
                }
              />
              {/** NOTE:
               * action={deleteProduct.bind(null, product.id)}
               * ActionButton's `action` prop expects a function with no
               * arguments that returns a Promise<{ error, message }>.
               * bind() hands each button its own deleteProduct with this
               * product's id already filled in, without calling it yet.
               *
               * deleteProduct(product.id) would run the delete during render.
               * ActionButton has no onClick prop (it is omitted from its
               * props), because it runs `action` itself inside a transition,
               * shows a loading state, confirms with requireAreYouSure and
               * shows the result toast.
               */}
              <ActionButton
                variant={"destructiveOutline"}
                size={"icon"}
                requireAreYouSure
                action={deleteProduct.bind(null, product.id)}
              >
                <Trash2Icon />
                <span className="sr-only">Delete</span>
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function getStatusIcon(status: ProductStatus) {
  const Icon = {
    public: EyeIcon,
    private: LockIcon,
  }[status]

  return <Icon className="size-3.5" />
}
