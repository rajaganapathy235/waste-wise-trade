
-- ============================================================
-- FIX 1: Broken chat_threads RLS policies (self-join bug)
-- ============================================================
DROP POLICY IF EXISTS "Users can view their threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Participants can update threads" ON public.chat_threads;

CREATE POLICY "Users can view their threads" ON public.chat_threads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.thread_id = chat_threads.id
      AND chat_participants.user_id = (select auth.uid())
  )
);

CREATE POLICY "Participants can update threads" ON public.chat_threads
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.thread_id = chat_threads.id
      AND chat_participants.user_id = (select auth.uid())
  )
);

-- ============================================================
-- FIX 2: Wrap auth.uid() for InitPlan caching (perf)
-- ============================================================
DROP POLICY IF EXISTS "Thread participants can view messages" ON public.chat_messages;
CREATE POLICY "Thread participants can view messages" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.thread_id = chat_messages.thread_id
      AND chat_participants.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can view own participations" ON public.chat_participants;
CREATE POLICY "Users can view own participations" ON public.chat_participants
FOR SELECT USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.thread_id = chat_participants.thread_id
      AND cp.user_id = (select auth.uid())
  )
);

-- ============================================================
-- FIX 3: Missing indexes on FK / RLS-filtered columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_thread_id ON public.chat_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id_created ON public.chat_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_category_status ON public.leads(category, status);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_parties_user_id ON public.parties(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_id ON public.ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_party_id ON public.ledger_entries(party_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_lead_id ON public.reviews(lead_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_user_id ON public.transport_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
