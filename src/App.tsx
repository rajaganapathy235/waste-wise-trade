import { Routes, Route } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import AppShell from "@/components/AppShell";
import Index from "./pages/Index";
import LeadDetail from "./pages/LeadDetail";
import MyLeads from "./pages/MyLeads";
import PostLead from "./pages/PostLead";
import TNEB from "./pages/TNEB";
import JobWork from "./pages/JobWork";
import MarketPulse from "./pages/MarketPulse";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
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
import Catalog from "./pages/Catalog";

function AppRoutes() {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
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
