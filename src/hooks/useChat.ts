import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useChatThreads(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat_threads", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Get threads where user is a participant
      const { data: participants, error: pError } = await supabase
        .from("chat_participants")
        .select("thread_id")
        .eq("user_id", userId);

      if (pError) throw pError;
      if (!participants || participants.length === 0) return [];

      const threadIds = participants.map(p => p.thread_id);

      const { data: threads, error: tError } = await supabase
        .from("chat_threads")
        .select("*, chat_participants(*)")
        .in("id", threadIds)
        .order("last_message_at", { ascending: false });

      if (tError) throw tError;
      return threads || [];
    },
    enabled: !!userId,
  });

  // Subscribe to changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("chat_threads_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_threads" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat_threads", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
}

export function useChatMessages(threadId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat_messages", threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!threadId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`thread_${threadId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}` 
        },
        (payload) => {
          // Optimistically update or invalidate
          queryClient.setQueryData(["chat_messages", threadId], (old: any) => {
            return [...(old || []), payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, senderId, text }: { threadId: string; senderId: string; text: string }) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{ thread_id: threadId, sender_id: senderId, text }])
        .select()
        .single();

      if (error) throw error;

      // Update last message in thread
      await supabase
        .from("chat_threads")
        .update({ 
          last_message: text, 
          last_message_at: new Date().toISOString() 
        })
        .eq("id", threadId);

      return data;
    },
    onSuccess: (data) => {
      // Invalider thread list to show new last message
      queryClient.invalidateQueries({ queryKey: ["chat_threads"] });
    }
  });
}

export function useCreateOrGetThread() {
  return useMutation({
    mutationFn: async ({ leadId, leadTitle, participantIds }: { leadId: string; leadTitle: string; participantIds: string[] }) => {
      // 1. Check if thread for this lead already exists between these users
      // Simplifying for demo: just check lead_id and current user presence
      const { data: existingThreads } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("lead_id", leadId);

      if (existingThreads && existingThreads.length > 0) {
        // Find if user is in any of these threads
        for (const t of existingThreads) {
            const { data: p } = await supabase
                .from("chat_participants")
                .select("id")
                .eq("thread_id", t.id)
                .eq("user_id", participantIds[0]) // Assumes index 0 is current user
                .single();
            if (p) return t.id;
        }
      }

      // 2. Create new thread
      const { data: newThread, error: tError } = await supabase
        .from("chat_threads")
        .insert([{ lead_id: leadId, lead_title: leadTitle }])
        .select()
        .single();

      if (tError) throw tError;

      // 3. Add participants
      const participants = participantIds.map(uid => ({
        thread_id: newThread.id,
        user_id: uid,
        unread_count: 0
      }));

      const { error: pError } = await supabase
        .from("chat_participants")
        .insert(participants);

      if (pError) throw pError;

      return newThread.id;
    }
  });
}
