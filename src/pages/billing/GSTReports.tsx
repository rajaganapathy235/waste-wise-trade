import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { toast } from "sonner";

const GST_SECTIONS = [
  { label: "GSTR-1 (Sales)", desc: "Outward supplies summary", icon: FileText },
  { label: "GSTR-3B (Summary)", desc: "Monthly return summary", icon: FileText },
  { label: "HSN Summary", desc: "HSN-wise tax breakup", icon: FileText },
  { label: "GSTR-2A (Purchases)", desc: "Inward supplies auto-populated", icon: FileText },
];

export default function GSTReports() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-3 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></button>
        <h1 className="text-lg font-bold">GST Reports</h1>
      </div>

      <div className="space-y-3">
        {GST_SECTIONS.map((section, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-md transition-all" onClick={() => toast.info("GST report generation coming soon!")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <section.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{section.label}</p>
                  <p className="text-[10px] text-muted-foreground">{section.desc}</p>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
