import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AllInvoices() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> All Invoices</h1>
      </div>

      <Card className="mb-4">
        <CardContent className="p-6 text-center">
          <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-sm font-bold mb-1">View All Invoices</p>
          <p className="text-[10px] text-muted-foreground mb-4">All your invoices, challans, credit/debit notes are available in the Billing module</p>
          <button
            onClick={() => navigate("/billing", { state: { tab: "all" } })}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg"
          >
            Open Billing → All Transactions
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
