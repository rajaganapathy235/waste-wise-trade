import { useState } from "react";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Phone, Wrench, Factory, Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type JobWorkType = "Offer" | "Request";

export interface JobWorkPost {
  id: string;
  type: JobWorkType;
  serviceType: string;
  ratePerKg: number;
  capacityPerDay: number;
  minOrder: number;
  location: string;
  description: string;
  posterName: string;
  posterPhone: string;
  posterId: string;
  postedAt: string;
}

const SERVICE_TYPES = [
  "Waste to Fiber Conversion",
  "Fiber to Yarn (OE Spinning)",
  "Fiber to Yarn (Ring Spinning)",
  "Yarn Doubling & TFO",
  "Waste Sorting & Grading",
  "Baling & Packing",
];

const DISTRICTS = [
  "Tiruppur", "Coimbatore", "Erode", "Salem", "Karur",
  "Dindigul", "Madurai", "Namakkal", "Krishnagiri", "Dharmapuri",
];

const MOCK_JOB_WORKS: JobWorkPost[] = [
  {
    id: "jw1", type: "Offer", serviceType: "Waste to Fiber Conversion",
    ratePerKg: 12, capacityPerDay: 5000, minOrder: 1000,
    location: "Tiruppur", description: "10 years experience. Modern machinery with auto-feed. Can handle all cotton waste types.",
    posterName: "Lakshmi Fiber Works", posterPhone: "+91 98765 43210", posterId: "u2", postedAt: "2025-03-07",
  },
  {
    id: "jw2", type: "Request", serviceType: "Fiber to Yarn (OE Spinning)",
    ratePerKg: 18, capacityPerDay: 3000, minOrder: 2000,
    location: "Coimbatore", description: "Need OE spinning for 30s count white fiber. Regular monthly orders.",
    posterName: "Ravi Textiles", posterPhone: "+91 87654 32109", posterId: "u3", postedAt: "2025-03-06",
  },
  {
    id: "jw3", type: "Offer", serviceType: "Waste Sorting & Grading",
    ratePerKg: 5, capacityPerDay: 8000, minOrder: 500,
    location: "Erode", description: "Skilled workers for color-wise sorting. Fast turnaround.",
    posterName: "KM Sorting Unit", posterPhone: "+91 76543 21098", posterId: "u4", postedAt: "2025-03-05",
  },
  {
    id: "jw4", type: "Offer", serviceType: "Fiber to Yarn (Ring Spinning)",
    ratePerKg: 25, capacityPerDay: 2000, minOrder: 1500,
    location: "Salem", description: "Ring frame with 1008 spindles. Can do 20s to 40s count.",
    posterName: "Salem Spinners", posterPhone: "+91 65432 10987", posterId: "u5", postedAt: "2025-03-04",
  },
];

export default function JobWork() {
  const { user } = useApp();
  const { t } = useI18n();
  const [posts, setPosts] = useState<JobWorkPost[]>(MOCK_JOB_WORKS);
  const [activeTab, setActiveTab] = useState<"all" | "Offer" | "Request">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formType, setFormType] = useState<JobWorkType>("Offer");
  const [serviceType, setServiceType] = useState("");
  const [rate, setRate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const filtered = activeTab === "all" ? posts : posts.filter((p) => p.type === activeTab);

  const handlePost = () => {
    if (!serviceType || !rate || !capacity || !location) {
      toast.error(t("jobWork.fillRequired"));
      return;
    }
    const newPost: JobWorkPost = {
      id: Date.now().toString(),
      type: formType,
      serviceType,
      ratePerKg: Number(rate),
      capacityPerDay: Number(capacity),
      minOrder: Number(minOrder) || 500,
      location,
      description,
      posterName: user.businessName,
      posterPhone: user.phone,
      posterId: user.id,
      postedAt: new Date().toISOString().split("T")[0],
    };
    setPosts((prev) => [newPost, ...prev]);
    toast.success(t("jobWork.posted"));
    setDialogOpen(false);
    // Reset form
    setServiceType(""); setRate(""); setCapacity(""); setMinOrder(""); setLocation(""); setDescription("");
  };

  return (
    <div className="px-4 pt-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">{t("jobWork.title")}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> {t("jobWork.postNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[360px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("jobWork.postNew")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Offer / Request toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFormType("Offer")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    formType === "Offer" ? "bg-emerald text-emerald-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {t("jobWork.offer")}
                </button>
                <button
                  onClick={() => setFormType("Request")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    formType === "Request" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {t("jobWork.need")}
                </button>
              </div>

              <div>
                <Label className="text-xs">{t("jobWork.serviceType")}</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger><SelectValue placeholder={t("jobWork.selectService")} /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("jobWork.ratePerKg")}</Label>
                  <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="12" />
                </div>
                <div>
                  <Label className="text-xs">{t("jobWork.capacity")}</Label>
                  <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="5000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("jobWork.minOrder")}</Label>
                  <Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="1000" />
                </div>
                <div>
                  <Label className="text-xs">{t("jobWork.location")}</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger><SelectValue placeholder={t("jobWork.selectLocation")} /></SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">{t("jobWork.description")}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("jobWork.descPlaceholder")}
                  rows={3}
                />
              </div>

              <Button onClick={handlePost} className={`w-full ${formType === "Offer" ? "bg-emerald hover:bg-emerald/90" : "bg-primary"}`}>
                {t("jobWork.post")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "Offer", "Request"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab
                ? tab === "Offer" ? "bg-emerald text-emerald-foreground" : tab === "Request" ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {tab === "all" ? t("home.all") : tab === "Offer" ? t("jobWork.offers") : t("jobWork.requests")}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{t("jobWork.noListings")}</div>
        ) : (
          filtered.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`px-4 py-1.5 flex items-center gap-2 ${post.type === "Offer" ? "bg-emerald/10" : "bg-primary/10"}`}>
                  {post.type === "Offer" ? (
                    <Factory className="h-3.5 w-3.5 text-emerald" />
                  ) : (
                    <Wrench className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className={`text-[10px] font-bold ${post.type === "Offer" ? "text-emerald" : "text-primary"}`}>
                    {post.type === "Offer" ? t("jobWork.offers") : t("jobWork.requests")}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{post.postedAt}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold mb-1">{post.serviceType}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{post.posterName}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      ₹{post.ratePerKg}{t("jobWork.perKg")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {post.capacityPerDay} {t("jobWork.kgDay")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {t("jobWork.minOrderLabel")}: {post.minOrder}kg
                    </Badge>
                  </div>

                  {post.description && (
                    <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{post.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {post.location}
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1">
                      <Phone className="h-3 w-3" /> {t("jobWork.contact")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
