import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/AppShell";
import Index from "./pages/Index";
import LeadDetail from "./pages/LeadDetail";
import MyLeads from "./pages/MyLeads";
import PostLead from "./pages/PostLead";
import TNEB from "./pages/TNEB";
import JobWork from "./pages/JobWork";
import MarketPulse from "./pages/MarketPulse";
import Profile from "./pages/Profile";
import ChatList, { ChatThread } from "./pages/Chat";
import Analytics from "./pages/Analytics";
import DemandHeatmap from "./pages/DemandHeatmap";
import Transport from "./pages/Transport";
import WriteReview from "./pages/Reviews";
import Services from "./pages/Services";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";
import AddProduct from "./pages/billing/AddProduct";
import ProductDetail from "./pages/billing/ProductDetail";
import TaxDetails from "./pages/billing/TaxDetails";
import PartyLedger from "./pages/billing/PartyLedger";
import AddLedgerEntry from "./pages/billing/AddLedgerEntry";
import GenerateBill from "./pages/billing/GenerateBill";
import Auth from "./pages/Auth";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Index />} />
        <Route path="/my-leads" element={<MyLeads />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/job-work" element={<JobWork />} />
        <Route path="/services" element={<Services />} />
      </Route>
      <Route path="/lead/:id" element={<LeadDetail />} />
      <Route path="/post-lead" element={<PostLead />} />
      <Route path="/market-pulse" element={<MarketPulse />} />
      <Route path="/chat/:leadId" element={<ChatThread />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/demand-heatmap" element={<DemandHeatmap />} />
      <Route path="/transport" element={<Transport />} />
      <Route path="/tneb" element={<TNEB />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/billing/add-product" element={<AddProduct />} />
      <Route path="/billing/product/:productId" element={<ProductDetail />} />
      <Route path="/billing/tax-details" element={<TaxDetails />} />
      <Route path="/billing/ledger/:partyId" element={<PartyLedger />} />
      <Route path="/billing/ledger/:partyId/add" element={<AddLedgerEntry />} />
      <Route path="/billing/generate-bill" element={<GenerateBill />} />
      <Route path="/review/:leadId" element={<WriteReview />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
