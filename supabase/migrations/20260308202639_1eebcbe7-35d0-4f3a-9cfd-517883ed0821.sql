
-- Fix overly permissive chat policies
DROP POLICY "Authenticated users can create threads" ON public.chat_threads;
CREATE POLICY "Authenticated users can create threads" ON public.chat_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY "Authenticated can insert participants" ON public.chat_participants;
CREATE POLICY "Authenticated can insert participants" ON public.chat_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
