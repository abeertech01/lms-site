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
  "gap-4 grid grid-cols-[minmax(0,1fr)_auto_auto] max-[720px]:grid-cols-[auto_minmax(0,1fr)] max-[720px]:gap-x-3.5 max-[720px]:gap-y-3 max-[720px]:p-4 md:grid-cols-[minmax(0,1fr)_80px_120px_170px] items-center px-5 md:px-7"

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
        className={`${rowClass} py-4 max-[720px]:hidden border-b font-mono text-[11px] text-ink-soft uppercase tracking-[0.06em]`}
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
            <div className="flex items-center gap-3.5 max-[720px]:col-span-full min-w-0">
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
            <span className="hidden md:block max-[720px]:block max-[720px]:text-sm max-[720px]:font-normal max-[720px]:text-muted-foreground font-medium text-[15px]">
              {product.customersCount}
              <span className="hidden max-[720px]:inline">
                {product.customersCount === 1 ? " student" : " students"}
              </span>
            </span>
            <div className="hidden md:block max-[720px]:block max-[720px]:justify-self-end">
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
            <div className="col-span-2 md:col-span-1 max-[720px]:col-span-full flex max-[720px]:flex-wrap justify-end max-[720px]:justify-start items-center gap-2">
              <Button
                size="sm"
                className="max-[720px]:h-11 max-[720px]:min-w-20 max-[720px]:justify-center"
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
