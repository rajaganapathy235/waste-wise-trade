import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DbChatThread {
  id: string;
  lead_id: string | null;
  lead_title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  // joined from participants
  other_name?: string;
  other_id?: string;
  unread_count?: number;
}

export interface DbChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export function useChatThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<DbChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    if (!user) { setThreads([]); setLoading(false); return; }
    // Get threads where user is a participant
    const { data: participations } = await supabase
      .from("chat_participants")
      .select("thread_id, unread_count")
      .eq("user_id", user.id);

    if (!participations || participations.length === 0) {
      setThreads([]);
      setLoading(false);
      return;
    }

    const threadIds = participations.map(p => p.thread_id);
    const { data: threadData } = await supabase
      .from("chat_threads")
      .select("*")
      .in("id", threadIds)
      .order("last_message_at", { ascending: false });

    if (!threadData) { setThreads([]); setLoading(false); return; }

    // Get other participants
    const { data: allParticipants } = await supabase
      .from("chat_participants")
      .select("*")
      .in("thread_id", threadIds);

    const enriched = threadData.map(t => {
      const myPart = participations.find(p => p.thread_id === t.id);
      const otherPart = allParticipants?.find(p => p.thread_id === t.id && p.user_id !== user.id);
      return {
        ...t,
        other_name: otherPart?.display_name || "Unknown",
        other_id: otherPart?.user_id,
        unread_count: myPart?.unread_count || 0,
      };
    });

    setThreads(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  return { threads, loading, refetch: fetchThreads };
}

export function useChatMessages(threadId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DbChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!threadId) { setMessages([]); setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      setLoading(false);
    };
    fetch();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${threadId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `thread_id=eq.${threadId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as DbChatMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [threadId]);

  const sendMessage = async (text: string) => {
    if (!user || !threadId) return;
    await supabase.from("chat_messages").insert({
      thread_id: threadId,
      sender_id: user.id,
      text,
    });
    // Update thread last message
    await supabase.from("chat_threads").update({
      last_message: text,
      last_message_at: new Date().toISOString(),
    }).eq("id", threadId);
  };

  return { messages, loading, sendMessage };
}

export function useCreateThread() {
  const { user } = useAuth();

  const createThread = async (leadId: string, leadTitle: string, otherUserId: string, otherName: string) => {
    if (!user) return null;

    // Check if thread already exists for this lead between these users
    const { data: existingParticipants } = await supabase
      .from("chat_participants")
      .select("thread_id")
      .eq("user_id", user.id);

    if (existingParticipants) {
      for (const p of existingParticipants) {
        const { data: thread } = await supabase
          .from("chat_threads")
          .select("*")
          .eq("id", p.thread_id)
          .eq("lead_id", leadId)
          .single();
        if (thread) {
          // Check if other user is also in this thread
          const { data: otherP } = await supabase
            .from("chat_participants")
            .select("id")
            .eq("thread_id", p.thread_id)
            .eq("user_id", otherUserId)
            .single();
          if (otherP) return thread.id;
        }
      }
    }

    // Create new thread
    const { data: newThread } = await supabase
      .from("chat_threads")
      .insert({ lead_id: leadId, lead_title: leadTitle })
      .select()
      .single();

    if (!newThread) return null;

    // Add participants
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("business_name, display_name")
      .eq("user_id", user.id)
      .single();

    await supabase.from("chat_participants").insert([
      { thread_id: newThread.id, user_id: user.id, display_name: myProfile?.business_name || myProfile?.display_name || "Me" },
      { thread_id: newThread.id, user_id: otherUserId, display_name: otherName },
    ]);

    return newThread.id;
  };

  return { createThread };
}
