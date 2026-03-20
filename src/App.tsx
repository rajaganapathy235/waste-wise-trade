import { Routes, Route, Navigate } from "react-router-dom";
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
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManager from "./pages/admin/UserManager";
import LeadManager from "./pages/admin/LeadManager";
import SubscriptionManager from "./pages/admin/SubscriptionManager";
import TransactionLogs from "./pages/admin/TransactionLogs";
import ApiKeyManager from "./pages/admin/ApiKeyManager";
import AdminSettings from "./pages/admin/AdminSettings";
import ContentManager from "./pages/admin/ContentManager";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { isLoggedIn, loading } = useApp();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/catalog/:userId" element={<Catalog />} />
      <Route path="/onboarding" element={!isLoggedIn ? <Onboarding /> : <Navigate to="/" />} />
      <Route path="/admin/login" element={!isLoggedIn ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} />
      <Route path="/subscribe" element={<ProtectedRoute><SubscriptionCheckout /></ProtectedRoute>} />

      {/* Admin Panel (Protected) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={null} /> {/* Handled inside AdminDashboard */}
        <Route path="users" element={<UserManager />} />
        <Route path="leads" element={<LeadManager />} />
        <Route path="subscriptions" element={<SubscriptionManager />} />
        <Route path="payments" element={<TransactionLogs />} />
        <Route path="api-keys" element={<ApiKeyManager />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="content-manager" element={<ContentManager />} />
      </Route>

      {/* User Marketplace (Protected) */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/" element={<Index />} />
        <Route path="/my-leads" element={<MyLeads />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/job-work" element={<JobWork />} />
        <Route path="/services" element={<Services />} />
      </Route>

      <Route element={<ProtectedRoute><></></ProtectedRoute>}>
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
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
