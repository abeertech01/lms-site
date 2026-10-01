import ActionButton from "@/components/ActionButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductStatus } from "@/drizzle/schema"
import { formatPlural, formatPrice } from "@/lib/formatters"
import { EyeIcon, LockIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { deleteProduct } from "../actions/products"

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(products.length, {
              singular: "product",
              plural: "products",
            })}
          </TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-4">
                <Image
                  className="rounded size-12 object-cover"
                  src={product.imageUrl}
                  alt={product.name}
                  width={192}
                  height={192}
                />
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-muted-foreground">
                    {formatPlural(product.coursesCount, {
                      singular: "course",
                      plural: "courses",
                    })}{" "}
                    • {formatPrice(product.priceInDollars)}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{product.customersCount}</TableCell>
            <TableCell>
              <Badge className="inline-flex items-center gap-2">
                {getStatusIcon(product.status)} {product.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
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
                  requireAreYouSure
                  action={deleteProduct.bind(null, product.id)}
                >
                  <Trash2Icon />
                  <span className="sr-only">Delete</span>
                </ActionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function getStatusIcon(status: ProductStatus) {
  const Icon = {
    public: EyeIcon,
    private: LockIcon,
  }[status]

  return <Icon className="size-4" />
}
