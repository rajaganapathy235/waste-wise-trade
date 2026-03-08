import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const PRESETS = [
  { label: "Today", range: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 Days", range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "This Month", range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last Month", range: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This Year", range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: "All Time", range: () => ({ from: undefined, to: undefined }) },
];

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const label = dateRange.from && dateRange.to
    ? `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM yyyy")}`
    : "All Time";

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-7 text-[10px] gap-1.5 shrink-0", !dateRange.from && "text-muted-foreground")}>
            <CalendarIcon className="h-3 w-3" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-wrap gap-1 p-2 border-b border-border">
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => { onDateRangeChange(preset.range()); setOpen(false); }}
                className="px-2 py-1 rounded text-[10px] font-medium bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
            onSelect={(range) => {
              onDateRangeChange({ from: range?.from, to: range?.to });
              if (range?.from && range?.to) setOpen(false);
            }}
            numberOfMonths={1}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Parse various date string formats into a Date object */
export function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // ISO format: 2026-03-08
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  
  // "08-Mar-26" or "20-Dec-20" format
  try {
    const d = parse(dateStr, "dd-MMM-yy", new Date());
    if (!isNaN(d.getTime())) return d;
  } catch {}
  
  // "08 Mar 26" format  
  try {
    const d = parse(dateStr, "dd MMM yy", new Date());
    if (!isNaN(d.getTime())) return d;
  } catch {}

  // "08 Mar 2026" format  
  try {
    const d = parse(dateStr, "dd MMM yyyy", new Date());
    if (!isNaN(d.getTime())) return d;
  } catch {}
  
  // Last resort: native Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  return null;
}

/** Helper: check if a date string falls within range. Handles multiple date formats. */
export function isInDateRange(dateStr: string, range: DateRange): boolean {
  if (!range.from && !range.to) return true;
  
  const d = parseFlexibleDate(dateStr);
  if (!d) return true; // If we can't parse, include it
  
  if (range.from) {
    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);
    if (d < from) return false;
  }
  if (range.to) {
    const to = new Date(range.to);
    to.setHours(23, 59, 59, 999);
    if (d > to) return false;
  }
  return true;
}

/** Format a date string for display */
export function formatDisplayDate(dateStr: string): string {
  const d = parseFlexibleDate(dateStr);
  if (!d) return dateStr;
  return format(d, "dd MMM yyyy");
}
