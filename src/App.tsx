import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "@/lib/appContext";
import AppShell from "@/components/AppShell";
import Index from "./pages/Index";
import LeadDetail from "./pages/LeadDetail";
import MyLeads from "./pages/MyLeads";
import PostLead from "./pages/PostLead";
import TNEB from "./pages/TNEB";
import MarketPulse from "./pages/MarketPulse";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
        <Route path="/tneb" element={<TNEB />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/lead/:id" element={<LeadDetail />} />
      <Route path="/post-lead" element={<PostLead />} />
      <Route path="/market-pulse" element={<MarketPulse />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
