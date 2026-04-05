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
  placeholder = "Pick a date & time",
  disabled = false,
}: DatePickerProps) {
  const selectedDate = React.useMemo(() => {
    if (!date) return undefined;
    return typeof date === 'string' ? new Date(date) : date;
  }, [date]);

  const TIME_ZONE = 'Asia/Kolkata';

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      onChange?.(undefined);
      return;
    }
    import('date-fns-tz').then(({ toZonedTime, fromZonedTime }) => {
      const istZonedOld = selectedDate ? toZonedTime(selectedDate, TIME_ZONE) : undefined;
      const hours = istZonedOld ? istZonedOld.getHours() : 12;
      const minutes = istZonedOld ? istZonedOld.getMinutes() : 0;

      const year = newDate.getFullYear();
      const month = newDate.getMonth();
      const day = newDate.getDate();

      const targetDate = new Date(year, month, day, hours, minutes, 0, 0);
      const stringForm = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      const finalAbsoluteDate = fromZonedTime(stringForm, TIME_ZONE);

      onChange?.(finalAbsoluteDate);
    }).catch(err => {
      const hours = selectedDate ? selectedDate.getHours() : 12;
      const minutes = selectedDate ? selectedDate.getMinutes() : 0;
      newDate.setHours(hours, minutes, 0, 0);
      onChange?.(newDate);
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [h, m] = val.split(':');

    import('date-fns-tz').then(({ toZonedTime, fromZonedTime }) => {
      const baseZoned = toZonedTime(selectedDate || new Date(), TIME_ZONE);
      const year = baseZoned.getFullYear();
      const month = baseZoned.getMonth() + 1;
      const day = baseZoned.getDate();

      const stringForm = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      const finalAbsoluteDate = fromZonedTime(stringForm, TIME_ZONE);
      onChange?.(finalAbsoluteDate);
    }).catch(err => {
      // Fallback naturally
      if (selectedDate) {
        const newD = new Date(selectedDate);
        newD.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        onChange?.(newD);
      } else {
        const newD = new Date();
        newD.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        onChange?.(newD);
      }
    });
  };

  const [displayStr, setDisplayStr] = React.useState("");
  const [timeStr, setTimeStr] = React.useState("12:00");

  React.useEffect(() => {
    if (selectedDate) {
      import('date-fns-tz').then(({ format }) => {
        setDisplayStr(format(selectedDate, "PPP - hh:mm a 'IST'", { timeZone: 'Asia/Kolkata' }));
        setTimeStr(format(selectedDate, "HH:mm", { timeZone: 'Asia/Kolkata' }));
      }).catch(() => {
        setDisplayStr(format(selectedDate, "PPP - hh:mm a 'Local'"));
        setTimeStr(format(selectedDate, "HH:mm"));
      });
    } else {
      setDisplayStr("");
      setTimeStr("12:00");
    }
  }, [selectedDate]);

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
            {selectedDate ? <span>{displayStr}</span> : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="p-3 border-t border-border flex items-center gap-2">
            <span className="text-xs font-medium">Time (IST):</span>
            <input
              type="time"
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={timeStr}
              onChange={handleTimeChange}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
