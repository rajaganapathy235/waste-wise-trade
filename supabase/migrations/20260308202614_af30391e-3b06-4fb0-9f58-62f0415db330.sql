
-- Leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_type text NOT NULL CHECK (lead_type IN ('Buy', 'Sell')),
  category text NOT NULL CHECK (category IN ('Waste', 'Fiber', 'Yarn')),
  material_type text NOT NULL,
  price_per_kg numeric NOT NULL DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 0,
  specs jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Sold')),
  poster_name text,
  poster_phone text,
  poster_role text,
  location_district text,
  views integer DEFAULT 0,
  inquiries integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat threads
CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  lead_title text,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

-- Chat participants
CREATE TABLE public.chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  unread_count integer DEFAULT 0,
  UNIQUE(thread_id, user_id)
);

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their threads" ON public.chat_threads FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.chat_participants WHERE thread_id = id AND user_id = auth.uid()));
CREATE POLICY "Authenticated users can create threads" ON public.chat_threads FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Participants can update threads" ON public.chat_threads FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.chat_participants WHERE thread_id = id AND user_id = auth.uid()));

CREATE POLICY "Users can view own participations" ON public.chat_participants FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.thread_id = chat_participants.thread_id AND cp.user_id = auth.uid()));
CREATE POLICY "Authenticated can insert participants" ON public.chat_participants FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Users can update own participant row" ON public.chat_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Thread participants can view messages" ON public.chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.chat_participants WHERE thread_id = chat_messages.thread_id AND user_id = auth.uid()));
CREATE POLICY "Thread participants can send messages" ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_participants WHERE thread_id = chat_messages.thread_id AND user_id = auth.uid()));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name text,
  reviewee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Transport requests
CREATE TABLE public.transport_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  material_type text,
  quantity numeric DEFAULT 0,
  from_district text,
  to_district text,
  requested_date date,
  vehicle_type text CHECK (vehicle_type IN ('Tempo', 'Mini Truck', 'Full Truck')),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'In Transit', 'Delivered', 'Cancelled')),
  estimated_cost numeric,
  provider_name text,
  provider_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transport requests" ON public.transport_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create transport requests" ON public.transport_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transport requests" ON public.transport_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transport" ON public.transport_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_transport_updated_at BEFORE UPDATE ON public.transport_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Billing: Parties
CREATE TABLE public.parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  initials text,
  gstin text,
  location text,
  phone text,
  type text NOT NULL DEFAULT 'Customers' CHECK (type IN ('Customers', 'Suppliers')),
  bill_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parties" ON public.parties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own parties" ON public.parties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own parties" ON public.parties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own parties" ON public.parties FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON public.parties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Billing: Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  hsn_code text,
  sale_price numeric DEFAULT 0,
  purchase_price numeric DEFAULT 0,
  unit text DEFAULT 'KG',
  gst_rate numeric DEFAULT 0,
  stock numeric DEFAULT 0,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Billing: Ledger entries
CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  date text NOT NULL,
  type text NOT NULL,
  invoice_no integer,
  credit numeric DEFAULT 0,
  debit numeric DEFAULT 0,
  particular text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ledger entries" ON public.ledger_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ledger entries" ON public.ledger_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ledger entries" ON public.ledger_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ledger entries" ON public.ledger_entries FOR DELETE USING (auth.uid() = user_id);

-- Billing: Bills/Invoices
CREATE TABLE public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  party_id uuid REFERENCES public.parties(id) ON DELETE SET NULL,
  bill_type text NOT NULL CHECK (bill_type IN ('Sales', 'Purchase', 'Quotation')),
  bill_no integer NOT NULL,
  date text NOT NULL,
  items jsonb DEFAULT '[]',
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bills" ON public.bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bills" ON public.bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bills" ON public.bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bills" ON public.bills FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin: Add RLS policies for admins to view all data
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add verification fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_subscribed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expiry timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trust_score numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_documents jsonb DEFAULT '{}';
