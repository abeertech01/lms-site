"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import RequiredLabelIcon from "@/components/RequiredLabelIcon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { actionToast } from "@/hooks/use-toast"
import { productSchema } from "../schemas/products"
import { ProductStatus, productStatuses } from "@/drizzle/schema"
import { createProduct, updateProduct } from "../actions/products"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/custom/multi-select"

export default function ProductForm({
  product,
  courses,
}: {
  product?: {
    id: string
    name: string
    description: string
    priceInDollars: number
    imageUrl: string
    status: ProductStatus
    courseIds: string[]
  }
  courses: {
    id: string
    name: string
  }[]
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: "",
      description: "",
      courseIds: [],
      imageUrl: "",
      priceInDollars: 0,
      status: "private",
    },
  })

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const action =
      product == null ? createProduct : updateProduct.bind(null, product.id)
    const data = await action(values)
    actionToast({ actionData: data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="items-start gap-6 grid grid-cols-1 md:grid-cols-2">
        <Field data-invalid={errors.name != null}>
          <FieldLabel htmlFor="name">
            <RequiredLabelIcon />
            Name
          </FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field data-invalid={errors.priceInDollars != null}>
          <FieldLabel htmlFor="priceInDollars">
            <RequiredLabelIcon />
            Price
          </FieldLabel>
          <Controller
            control={control}
            name="priceInDollars"
            render={({ field }) => (
              <Input
                id="priceInDollars"
                type="number"
                {...field}
                step={1}
                min={0}
                onChange={(e) => {
                  field.onChange(
                    isNaN(e.target.valueAsNumber) ? "" : e.target.valueAsNumber,
                  )
                }}
              />
            )}
          />
          <FieldError
            errors={errors.priceInDollars ? [errors.priceInDollars] : undefined}
          />
        </Field>
        <Field data-invalid={errors.imageUrl != null}>
          <FieldLabel htmlFor="imageUrl">
            <RequiredLabelIcon />
            Image Url
          </FieldLabel>
          <Input id="imageUrl" {...register("imageUrl")} />
          <FieldError
            errors={errors.imageUrl ? [errors.imageUrl] : undefined}
          />
        </Field>
        <Field data-invalid={errors.status != null}>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={errors.status ? [errors.status] : undefined} />
        </Field>
      </div>
      <Field data-invalid={errors.courseIds != null}>
        <FieldLabel>Included Courses</FieldLabel>
        <Controller
          control={control}
          name="courseIds"
          render={({ field }) => (
            <MultiSelect
              selectPlaceholder="Select Courses"
              searchPlaceholder="Search Courses"
              options={courses}
              getLabel={(c) => c.name}
              getValue={(c) => c.id}
              selectedValues={field.value}
              onSelectedValuesChange={field.onChange}
            />
          )}
        />
        <FieldError
          errors={
            Array.isArray(errors.courseIds)
              ? errors.courseIds
              : errors.courseIds
                ? [errors.courseIds]
                : undefined
          }
        />
      </Field>
      <Field data-invalid={errors.description != null}>
        <FieldLabel htmlFor="description">
          <RequiredLabelIcon />
          Description
        </FieldLabel>
        <Textarea
          id="description"
          className="min-h-20 resize-none"
          {...register("description")}
        />
        <FieldError
          errors={errors.description ? [errors.description] : undefined}
        />
      </Field>
      <div className="self-end">
        <Button disabled={isSubmitting} type="submit">
          Save
        </Button>
      </div>
    </form>
  )
}
