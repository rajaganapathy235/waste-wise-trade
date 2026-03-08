import { useState } from "react";
import { useSafeBack } from "@/hooks/use-safe-back";
import { useLocation, useNavigate } from "react-router-dom";
import BillingHeader from "@/components/BillingHeader";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TaxDetails() {
  const goBack = useSafeBack("/billing/add-product");
  const navigate = useNavigate();
  const location = useLocation();
  const incoming = (location.state as any) || {};

  const [gstTotal, setGstTotal] = useState(incoming.gstTotal || "0.0");
  const [cgstPct, setCgstPct] = useState(incoming.cgstPct || "0");
  const [cgstFlat, setCgstFlat] = useState(incoming.cgstFlat || "0");
  const [sgstPct, setSgstPct] = useState(incoming.sgstPct || "0");
  const [sgstFlat, setSgstFlat] = useState(incoming.sgstFlat || "0");
  const [igstPct, setIgstPct] = useState(incoming.igstPct || "0.0");
  const [igstFlat, setIgstFlat] = useState(incoming.igstFlat || "0.0");

  const totalPrice = incoming.totalPrice || 0;
  const taxableAmount = totalPrice;
  const taxAmount =
    (taxableAmount * (parseFloat(cgstPct) || 0)) / 100 +
    (parseFloat(cgstFlat) || 0) +
    (taxableAmount * (parseFloat(sgstPct) || 0)) / 100 +
    (parseFloat(sgstFlat) || 0) +
    (taxableAmount * (parseFloat(igstPct) || 0)) / 100 +
    (parseFloat(igstFlat) || 0);

  const handleSave = () => {
    const taxData = { gstTotal, cgstPct, cgstFlat, sgstPct, sgstFlat, igstPct, igstFlat, taxAmount };
    navigate("/billing/add-product", { state: { taxData } });
  };

  const rowClass = "flex items-center justify-between py-1.5";
  const labelClass = "text-sm text-muted-foreground";
  const inputClass = "border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 shadow-none text-sm font-semibold w-40 text-right";

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-muted/30">
      {/* Header */}
      <header className="bg-emerald text-emerald-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-base font-bold">Tax Details</h1>
      </header>

      <div className="flex-1 px-4 pt-4 pb-8 space-y-3">
        {/* Total Price */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-3">
            <div className={rowClass}>
              <span className={labelClass}>Total Price (with Qty.)</span>
              <span className="text-sm font-bold text-destructive">{totalPrice}</span>
            </div>
          </CardContent>
        </Card>

        {/* GST Total */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-3">
            <div className={rowClass}>
              <span className={labelClass}>GST Total (%)</span>
              <Input value={gstTotal} onChange={e => setGstTotal(e.target.value)} type="text" className={inputClass} />
            </div>
          </CardContent>
        </Card>

        {/* CGST */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-3 space-y-2">
            <p className="text-sm font-bold text-emerald border-b border-border pb-1">CGST</p>
            <div className={rowClass}>
              <span className={labelClass}>Tax Name</span>
              <span className="text-sm font-bold text-foreground">CGST</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Percentage (%)</span>
              <Input value={cgstPct} onChange={e => setCgstPct(e.target.value)} type="text" className={inputClass} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Flat Value</span>
              <Input value={cgstFlat} onChange={e => setCgstFlat(e.target.value)} type="text" className={inputClass} />
            </div>
          </CardContent>
        </Card>

        {/* SGST */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-3 space-y-2">
            <p className="text-sm font-bold text-emerald border-b border-border pb-1">SGST</p>
            <div className={rowClass}>
              <span className={labelClass}>Tax Name</span>
              <span className="text-sm font-bold text-foreground">SGST</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Percentage (%)</span>
              <Input value={sgstPct} onChange={e => setSgstPct(e.target.value)} type="text" className={inputClass} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Flat Value</span>
              <Input value={sgstFlat} onChange={e => setSgstFlat(e.target.value)} type="text" className={inputClass} />
            </div>
          </CardContent>
        </Card>

        {/* OR Divider */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-2 text-center">
            <span className="text-sm font-medium text-emerald">-- OR --</span>
          </CardContent>
        </Card>

        {/* IGST */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-3 space-y-2">
            <p className="text-sm font-bold text-emerald border-b border-border pb-1">IGST</p>
            <div className={rowClass}>
              <span className={labelClass}>Tax Name</span>
              <span className="text-sm font-bold text-foreground">IGST</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Percentage (%)</span>
              <Input value={igstPct} onChange={e => setIgstPct(e.target.value)} type="text" className={inputClass} />
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Flat Value</span>
              <Input value={igstFlat} onChange={e => setIgstFlat(e.target.value)} type="text" className={inputClass} />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-3">
            <div className={rowClass}>
              <span className={labelClass}>Taxable Amount</span>
              <span className="text-sm font-bold text-destructive">{taxableAmount}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-3">
            <div className={rowClass}>
              <span className={labelClass}>Tax Amount</span>
              <span className="text-sm font-bold text-destructive">{Math.round(taxAmount * 100) / 100}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save */}
      <div className="sticky bottom-0 bg-emerald">
        <Button onClick={handleSave} className="w-full h-14 text-lg font-bold rounded-none bg-emerald hover:bg-emerald/90 text-emerald-foreground">
          Save
        </Button>
      </div>
    </div>
  );
}
