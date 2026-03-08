import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useBilling } from "@/lib/billingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, MessageCircle, Clock, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";

interface Reminder {
  id: string;
  partyId: string;
  partyName: string;
  partyPhone: string;
  amount: number;
  dueDate: string;
  invoiceRef: string;
  status: "upcoming" | "overdue" | "sent" | "paid";
  autoRemind: boolean;
  lastReminded?: string;
}

export default function PaymentReminders() {
  const navigate = useNavigate();
  const goBack = useSafeBack("/billing");
  const { parties, payments } = useBilling();

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    // Auto-generate reminders from parties with outstanding balances
    return parties
      .filter(p => p.balanceType === "collect" && p.openingBalance > 0)
      .map((p, i) => ({
        id: `rem${i}`,
        partyId: p.id,
        partyName: p.name,
        partyPhone: p.phone,
        amount: p.openingBalance,
        dueDate: new Date(Date.now() - (i * 5 - 2) * 86400000).toISOString().slice(0, 10),
        invoiceRef: `SI/2025-2026/${String(i + 42).padStart(4, "0")}`,
        status: i === 0 ? "overdue" : "upcoming",
        autoRemind: true,
      }));
  });

  const overdueCount = reminders.filter(r => r.status === "overdue").length;
  const upcomingCount = reminders.filter(r => r.status === "upcoming").length;
  const totalDue = reminders.filter(r => r.status !== "paid").reduce((s, r) => s + r.amount, 0);

  const sendWhatsAppReminder = (reminder: Reminder) => {
    const phone = reminder.partyPhone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `🔔 Payment Reminder\n\nDear ${reminder.partyName},\n\nThis is a friendly reminder that payment of ₹${reminder.amount.toLocaleString("en-IN")} against Invoice ${reminder.invoiceRef} is ${reminder.status === "overdue" ? "overdue" : "due on " + reminder.dueDate}.\n\nPlease arrange payment at the earliest.\n\nThank you! 🙏`
    );
    window.open(`https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${msg}`, "_blank");
    setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, status: "sent" as const, lastReminded: new Date().toISOString().slice(0, 10) } : r));
    toast.success(`Reminder sent to ${reminder.partyName} via WhatsApp`);
  };

  const markPaid = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: "paid" as const } : r));
    toast.success("Marked as paid!");
  };

  const toggleAutoRemind = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, autoRemind: !r.autoRemind } : r));
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "overdue": return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
      case "sent": return <Send className="h-3.5 w-3.5 text-primary" />;
      case "paid": return <CheckCircle className="h-3.5 w-3.5 text-emerald" />;
      default: return <Clock className="h-3.5 w-3.5 text-gold" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "overdue": return "bg-destructive/10 text-destructive";
      case "sent": return "bg-primary/10 text-primary";
      case "paid": return "bg-emerald/10 text-emerald";
      default: return "bg-gold/10 text-gold";
    }
  };

  const getDaysInfo = (dueDate: string) => {
    const diff = Math.floor((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return "Due today";
    return `Due in ${diff} days`;
  };

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">Payment Reminders</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-2.5">
            <p className="text-lg font-bold">{overdueCount}</p>
            <p className="text-[10px] text-destructive font-semibold">Overdue</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gold">
          <CardContent className="p-2.5">
            <p className="text-lg font-bold">{upcomingCount}</p>
            <p className="text-[10px] text-gold font-semibold">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-2.5">
            <p className="text-xs font-bold">₹{totalDue.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-muted-foreground">Total Due</p>
          </CardContent>
        </Card>
      </div>

      {/* Send All Overdue */}
      {overdueCount > 0 && (
        <Button
          variant="destructive"
          className="w-full mb-4 gap-1.5 text-xs"
          onClick={() => {
            reminders.filter(r => r.status === "overdue").forEach(r => sendWhatsAppReminder(r));
          }}
        >
          <MessageCircle className="h-4 w-4" /> Send All Overdue Reminders via WhatsApp
        </Button>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No payment reminders
          </div>
        ) : reminders.map(rem => (
          <Card key={rem.id} className={rem.status === "paid" ? "opacity-60" : ""}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold">{rem.partyName}</p>
                  <p className="text-[10px] text-muted-foreground">{rem.invoiceRef}</p>
                </div>
                <Badge className={`text-[9px] ${statusColor(rem.status)}`}>
                  {statusIcon(rem.status)}
                  <span className="ml-1 capitalize">{rem.status}</span>
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">₹{rem.amount.toLocaleString("en-IN")}</p>
                <p className={`text-[10px] font-medium ${rem.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                  {getDaysInfo(rem.dueDate)}
                </p>
              </div>

              {rem.lastReminded && (
                <p className="text-[10px] text-muted-foreground mb-2">Last reminded: {rem.lastReminded}</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch checked={rem.autoRemind} onCheckedChange={() => toggleAutoRemind(rem.id)} className="scale-75" />
                  <span className="text-[10px] text-muted-foreground">Auto-remind</span>
                </div>
                <div className="flex gap-2">
                  {rem.status !== "paid" && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => sendWhatsAppReminder(rem)}>
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-emerald" onClick={() => markPaid(rem.id)}>
                        <CheckCircle className="h-3 w-3" /> Paid
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
