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
// Billing sub-pages
import CreateParty from "./pages/billing/CreateParty";
import PartyLedger from "./pages/billing/PartyLedger";
import CreateItem from "./pages/billing/CreateItem";
import PaymentIn from "./pages/billing/PaymentIn";
import PaymentOut from "./pages/billing/PaymentOut";
import ExpensePage from "./pages/billing/ExpensePage";
import Reports from "./pages/billing/Reports";
import SalesSummary from "./pages/billing/SalesSummary";
import StockSummary from "./pages/billing/StockSummary";
import ProfitLoss from "./pages/billing/ProfitLoss";
import CashBank from "./pages/billing/CashBank";
import GSTReports from "./pages/billing/GSTReports";
import Daybook from "./pages/billing/Daybook";
import RecurringInvoices from "./pages/billing/RecurringInvoices";
import PaymentReminders from "./pages/billing/PaymentReminders";
import BalanceSheet from "./pages/billing/BalanceSheet";
import PartyReports from "./pages/billing/PartyReports";
import ItemReports from "./pages/billing/ItemReports";
import TransactionReports from "./pages/billing/TransactionReports";
import AllInvoices from "./pages/billing/AllInvoices";
import SalesInvoices from "./pages/billing/SalesInvoices";
import PurchaseInvoices from "./pages/billing/PurchaseInvoices";
import BillWiseProfit from "./pages/billing/BillWiseProfit";
import ExpenseCategoryReport from "./pages/billing/ExpenseCategoryReport";
import PurchaseSummary from "./pages/billing/PurchaseSummary";
import HSNSummary from "./pages/billing/HSNSummary";

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
      <Route path="/billing/create-party" element={<CreateParty />} />
      <Route path="/billing/party/:partyId" element={<PartyLedger />} />
      <Route path="/billing/create-item" element={<CreateItem />} />
      <Route path="/billing/payment-in" element={<PaymentIn />} />
      <Route path="/billing/payment-out" element={<PaymentOut />} />
      <Route path="/billing/expenses" element={<ExpensePage />} />
      <Route path="/billing/reports" element={<Reports />} />
      <Route path="/billing/sales-summary" element={<SalesSummary />} />
      <Route path="/billing/stock-summary" element={<StockSummary />} />
      <Route path="/billing/profit-loss" element={<ProfitLoss />} />
      <Route path="/billing/cash-bank" element={<CashBank />} />
      <Route path="/billing/gst-reports" element={<GSTReports />} />
      <Route path="/billing/daybook" element={<Daybook />} />
      <Route path="/billing/recurring" element={<RecurringInvoices />} />
      <Route path="/billing/reminders" element={<PaymentReminders />} />
      <Route path="/billing/balance-sheet" element={<BalanceSheet />} />
      <Route path="/billing/party-reports" element={<PartyReports />} />
      <Route path="/billing/item-reports" element={<ItemReports />} />
      <Route path="/billing/transaction-reports" element={<TransactionReports />} />
      <Route path="/billing/all-invoices" element={<AllInvoices />} />
      <Route path="/billing/sales-invoices" element={<SalesInvoices />} />
      <Route path="/billing/purchase-invoices" element={<PurchaseInvoices />} />
      <Route path="/billing/bill-wise-profit" element={<BillWiseProfit />} />
      <Route path="/billing/expense-category" element={<ExpenseCategoryReport />} />
      <Route path="/billing/purchase-summary" element={<PurchaseSummary />} />
      <Route path="/billing/hsn-summary" element={<HSNSummary />} />
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
