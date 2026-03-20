import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { supabase } from "@/integrations/supabase/client";
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
import Landing from "./pages/Landing";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";

function AppRoutes() {
  const { isLoggedIn, setIsLoggedIn } = useApp();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setAuthChecked(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, [setIsLoggedIn]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/catalog/:userId" element={<Catalog />} />
      {!isLoggedIn ? (
        <Route path="*" element={<Landing />} />
      ) : (
        <>
          <Route element={<AppShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/my-leads" element={<MyLeads />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/job-work" element={<JobWork />} />
            <Route path="/more" element={<Services />} />
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
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
