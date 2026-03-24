"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date | string
  onChange?: (date: Date | undefined) => void
  label?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onChange,
  label,
  className,
  placeholder = "Pick a date",
  disabled = false,
}: DatePickerProps) {
  const selectedDate = React.useMemo(() => {
    if (!date) return undefined;
    return typeof date === 'string' ? new Date(date) : date;
  }, [date]);

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-bold text-xs h-10 rounded-xl bg-white border-gray-100 transition-all",
              !selectedDate && "text-muted-foreground font-normal",
              disabled && "opacity-50 cursor-not-allowed bg-gray-50/50"
            )}
          >
            <CalendarIcon className={cn("mr-2 h-3 w-3 text-primary", disabled && "text-gray-400")} />
            {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
