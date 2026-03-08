import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { CalendarIcon, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { getAllEntries } from "@/lib/ledgerData";
import { parseFlexibleDate } from "@/components/DateRangeFilter";
import { generateStatementPDF } from "@/lib/pdfGenerator";

type Step = "duration" | "actions";
type QuickRange = "This Month" | "This Quarter" | "This Year" | "Custom";

interface StatementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyName: string;
  partyId: string;
}

function getDateRange(range: QuickRange, fromDate?: Date, toDate?: Date): { from: Date; to: Date } {
  const now = new Date();
  switch (range) {
    case "This Month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "This Quarter":
      return { from: startOfQuarter(now), to: endOfQuarter(now) };
    case "This Year":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "Custom":
      return { from: fromDate || now, to: toDate || now };
  }
}

export default function StatementDialog({ open, onOpenChange, partyName, partyId }: StatementDialogProps) {
  const [step, setStep] = useState<Step>("duration");
  const [quickRange, setQuickRange] = useState<QuickRange>("This Month");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const quickRanges: QuickRange[] = ["This Month", "This Quarter", "This Year", "Custom"];

  const handleReset = () => {
    setStep("duration");
    setQuickRange("This Month");
    setFromDate(undefined);
    setToDate(undefined);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) handleReset();
    onOpenChange(v);
  };

  const handleGenerate = () => setStep("actions");

  const getFilteredEntries = () => {
    const allEntries = getAllEntries(partyId);
    const { from, to } = getDateRange(quickRange, fromDate, toDate);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return allEntries.filter((entry) => {
      const d = parseFlexibleDate(entry.date);
      if (!d) return true;
      return d >= from && d <= to;
    });
  };

  const getPeriodLabel = () => {
    if (quickRange === "Custom" && fromDate && toDate) {
      return `${format(fromDate, "dd MMM yyyy")} - ${format(toDate, "dd MMM yyyy")}`;
    }
    const { from, to } = getDateRange(quickRange);
    return `${format(from, "dd MMM yyyy")} - ${format(to, "dd MMM yyyy")}`;
  };

  const handleDownloadPDF = () => {
    try {
      const entries = getFilteredEntries();
      const doc = generateStatementPDF(entries, { name: partyName });
      doc.save(`Statement_${partyName.replace(/\s+/g, "_")}.pdf`);
      toast.success(`Statement PDF downloaded for ${partyName}`);
      handleOpenChange(false);
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleShareWhatsApp = () => {
    try {
      const entries = getFilteredEntries();
      const doc = generateStatementPDF(entries, { name: partyName });
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      const text = encodeURIComponent(
        `Statement for ${partyName}\nPeriod: ${getPeriodLabel()}\n\nGenerated from Billing App`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank");
      handleOpenChange(false);
    } catch {
      toast.error("Failed to share statement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-2xl">
        {step === "duration" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-center">
                Statement: {partyName}
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-muted-foreground text-center -mt-2">Select duration</p>

            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {quickRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setQuickRange(r)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    quickRange === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {quickRange === "Custom" && (
              <div className="flex gap-3 mt-3">
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">From</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left text-xs h-9", !fromDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                        {fromDate ? format(fromDate, "dd MMM yyyy") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left text-xs h-9", !toDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                        {toDate ? format(toDate, "dd MMM yyyy") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={quickRange === "Custom" && (!fromDate || !toDate)}
              className="w-full mt-4 h-11 rounded-xl font-bold"
            >
              Generate Statement
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-center">
                Statement Ready
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-muted-foreground text-center -mt-2">
              {partyName} • {getPeriodLabel()}
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <Button onClick={handleDownloadPDF} className="w-full h-12 rounded-xl font-bold gap-2">
                <Download className="h-5 w-5" />
                Download as PDF
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                variant="outline"
                className="w-full h-12 rounded-xl font-bold gap-2 border-accent text-accent hover:bg-accent/10"
              >
                <Share2 className="h-5 w-5" />
                Share via WhatsApp
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
