"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "../badge"

export function MultiSelect<Option>({
  options,
  getValue,
  getLabel,
  selectedValues,
  onSelectedValuesChange,
  selectPlaceholder,
  searchPlaceholder,
  noSearchResultsMessage = "No results",
}: {
  options: Option[]
  getValue: (option: Option) => string
  getLabel: (option: Option) => React.ReactNode
  selectedValues: string[]
  onSelectedValuesChange: (values: string[]) => void
  selectPlaceholder?: string
  searchPlaceholder?: string
  noSearchResultsMessage?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between hover:bg-background px-3 py-2 border-[1.5px] border-input rounded-[14px] w-full h-auto min-h-12 font-normal text-base hover:text-foreground"
          />
        }
      >
        <div className="flex flex-wrap gap-1">
          {selectedValues.length > 0 ? (
            selectedValues.map((value) => {
              const option = options.find((o) => getValue(o) === value)
              if (option == null) return null

              return (
                <Badge
                  key={getValue(option)}
                  variant={"outline"}
                  className="bg-card rounded-full"
                >
                  {getLabel(option)}
                </Badge>
              )
            })
          ) : (
            <span className="text-muted-foreground">{selectPlaceholder}</span>
          )}
        </div>
        <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noSearchResultsMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={getValue(option)}
                  value={getValue(option)}
                  onSelect={(currentValue) => {
                    if (selectedValues.includes(currentValue)) {
                      onSelectedValuesChange(
                        selectedValues.filter(
                          (value) => value !== currentValue,
                        ),
                      )
                    } else {
                      return onSelectedValuesChange([
                        ...selectedValues,
                        currentValue,
                      ])
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4 text-accent",
                      selectedValues.includes(getValue(option))
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {getLabel(option)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
