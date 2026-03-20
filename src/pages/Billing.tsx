import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import {
  Send, Users, Home, FileText, Package,
  FileSpreadsheet, TrendingUp, Plus, Search, Loader2, IndianRupee, ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BillingHeader from "@/components/BillingHeader";
import { useProducts, useParties, useBills } from "@/hooks/useBilling";

type BillType = "Sales" | "Purchase" | "Quotation";
type BillingTab = "home" | "send" | "party" | "center" | "bills" | "products";

export default function Billing() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<BillingTab>("home");
  const [sendSearch, setSendSearch] = useState("");
  const [billType, setBillType] = useState<BillType>("Sales");
  const billTypes: BillType[] = ["Sales", "Purchase", "Quotation"];

  const { data: products = [], isLoading: isProductsLoading } = useProducts(user.id);
  const { data: bills = [], isLoading: isBillsLoading } = useBills(user.id);
  const { data: parties = [], isLoading: isPartiesLoading } = useParties(user.id);

  const TABS: { id: BillingTab; label: string; icon: React.ElementType }[] = [
    { id: "send", label: "Send", icon: Send },
    { id: "party", label: "Party", icon: Users },
    { id: "center", label: "", icon: Home },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "products", label: "Products", icon: Package },
  ];

  // ─── Home Tab (Default - Generate Bill) ───
  const renderHomeTab = () => (
    <div className="space-y-4 animate-fade-in pb-20">
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Create Invoice</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">New Transaction</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">BILLING CATEGORY</p>
            <div className="flex items-center gap-3">
              {billTypes.map((bt) => (
                <button 
                    key={bt} 
                    onClick={() => setBillType(bt)}
                    className={`flex-1 py-3 rounded-2xl text-[11px] font-black transition-all border ${billType === bt ? 'bg-slate-900 text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                >
                    {bt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full h-14 text-sm font-black rounded-2xl bg-emerald hover:bg-emerald/90 text-white shadow-xl shadow-emerald/10 transition-all active:scale-[0.98]">
            <Plus className="h-5 w-5 mr-2" /> GENERATE {billType.toUpperCase()}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[2rem] bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={`h-2.5 w-2.5 rounded-full ${user.isSubscribed ? "bg-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-200"}`} />
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">License Status</p>
            </div>
            <p className={`text-sm font-black ${user.isSubscribed ? "text-emerald" : "text-slate-300 text-[10px]"}`}>
                {user.isSubscribed ? "PREMIUM ACTIVATED" : "FREE VERSION"}
            </p>
          </div>
          {!user.isSubscribed && (
            <Button 
                onClick={() => navigate("/subscribe")} 
                className="w-full mt-4 h-12 bg-gold hover:bg-gold/90 text-navy font-black rounded-[1.2rem] text-xs shadow-lg"
            >
              UPGRADE FOR UNLIMITED BILLING →
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm rounded-[2rem] bg-primary text-white overflow-hidden p-6 relative group cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('bills')}>
            <div className="absolute top-0 right-0 h-16 w-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <TrendingUp className="h-6 w-6 opacity-40 mb-3" />
            <p className="text-xl font-black">{bills.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Bills</p>
          </Card>
          <Card className="border-none shadow-sm rounded-[2rem] bg-navy text-white overflow-hidden p-6 relative group cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('products')}>
             <div className="absolute top-0 right-0 h-16 w-16 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
             <Package className="h-6 w-6 opacity-40 mb-3" />
             <p className="text-xl font-black">{products.length}</p>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Products</p>
          </Card>
      </div>

      <Button variant="ghost" className="w-full h-12 rounded-2xl text-[11px] font-black text-slate-400 group" onClick={() => navigate("/")}>
        <span className="group-hover:-translate-x-1 transition-transform mr-1">←</span> BACK TO MARKETPLACE
      </Button>
    </div>
  );

  const renderSendTab = () => (
    <div className="animate-fade-in pb-20">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
        <Input
          value={sendSearch}
          onChange={e => setSendSearch(e.target.value)}
          placeholder="Search parties..."
          className="pl-12 h-14 bg-white border-none rounded-2xl shadow-sm text-sm focus:ring-2 ring-primary/20"
        />
      </div>

      {isPartiesLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-100" /></div>
      ) : parties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-100">
             <Users className="h-10 w-10 mx-auto mb-3 text-slate-200" />
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No parties added yet</p>
          </div>
      ) : (
        <div className="space-y-3">
          {parties.filter((p: any) => !sendSearch || p.name.toLowerCase().includes(sendSearch.toLowerCase())).map((party: any) => (
            <Card key={party.id} className="border-none shadow-sm rounded-2xl hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-black text-lg">
                      {party.initials || party.name[0]}
                   </div>
                   <div>
                      <p className="text-sm font-black text-slate-800">{party.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{party.location || 'Local'}</p>
                   </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProductsTab = () => (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Inventory</h2>
         <Button onClick={() => navigate("/billing/add-product")} size="sm" className="bg-emerald hover:bg-emerald/90 text-white rounded-xl h-9 px-4 font-black text-xs shadow-lg shadow-emerald/10">
            <Plus className="h-4 w-4 mr-1.5" /> ADD NEW
         </Button>
      </div>
      
      {isProductsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-100" /></div>
      ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-100">
             <Package className="h-10 w-10 mx-auto mb-3 text-slate-200" />
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Your catalog is empty</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product: any) => (
            <Card key={product.id} onClick={() => navigate(`/billing/product/${product.id}`)} className="border-none shadow-sm rounded-3xl hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98]">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold transition-colors group-hover:text-white">
                    <Package className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-slate-800 leading-tight mb-3 group-hover:text-gold transition-colors">{product.name}</h3>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3">
                       <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">SELL PRICE</p>
                          <div className="flex items-center gap-1 text-emerald font-black">
                             <IndianRupee className="h-3 w-3" />
                             <span>{product.sale_price || 0}</span>
                             <span className="text-[10px] text-slate-400 font-normal">/{product.unit || 'kg'}</span>
                          </div>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">STOCK</p>
                          <p className="text-sm font-black text-slate-700">{product.stock || 0} {product.unit || 'kg'}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPartiesTab = () => (
     <div className="animate-fade-in pb-20">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Customers & Vendors</h2>
           <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 px-4 font-black text-xs shadow-lg">
              <Plus className="h-4 w-4 mr-1.5" /> NEW PARTY
           </Button>
        </div>
        {renderSendTab()}
     </div>
  );

  const renderBillsTab = () => (
      <div className="animate-fade-in pb-20">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 mb-6">Past Invoices</h2>
        {isBillsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-100" /></div>
        ) : bills.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-100">
               <FileText className="h-10 w-10 mx-auto mb-3 text-slate-200" />
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No bills generated yet</p>
            </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill: any) => (
              <Card key={bill.id} className="border-none shadow-sm rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:shadow-md">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                       <FileText className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-800">{bill.parties?.name || 'Cash Party'}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">BILL #{bill.bill_no} • {new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-emerald">₹{bill.total}</p>
                    <Badge variant="outline" className="text-[8px] border-slate-100 text-slate-300 font-bold">{bill.bill_type.toUpperCase()}</Badge>
                 </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home": return renderHomeTab();
      case "send": return renderSendTab();
      case "products": return renderProductsTab();
      case "party": return renderPartiesTab();
      case "bills": return renderBillsTab();
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 relative overflow-x-hidden">
      <BillingHeader />

      <main className="flex-1 overflow-y-auto px-6 pt-6">
        {renderContent()}
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 pb-safe z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around py-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const isCenter = id === "center";

            if (isCenter) {
              return (
                <button
                  key={id}
                  onClick={() => navigate("/")}
                  className="relative -mt-10 flex flex-col items-center group"
                >
                  <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center shadow-2xl ring-8 ring-white transition-all group-active:scale-90 rotate-45 group-hover:rotate-0">
                    <span className="text-[10px] font-black text-white tracking-tight -rotate-45 group-hover:rotate-0 transition-transform">
                      HITEX
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1.5 px-3 transition-all ${
                  isActive ? "text-primary scale-110" : "text-slate-300 hover:text-slate-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
