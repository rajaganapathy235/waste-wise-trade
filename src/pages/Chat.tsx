import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useChatThreads } from "@/hooks/useChatThreads";
import { useChatMessages, useCreateThread } from "@/hooks/useChatThreads";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Crown, Lock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { DbLead } from "@/hooks/useLeads";

export default function ChatList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { threads, loading } = useChatThreads();
  const { t } = useI18n();
  const isSubscribed = profile?.is_subscribed || false;

  if (!isSubscribed) {
    return (
      <div className="px-4 pt-4 pb-8 max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-4">{t("chat.title")}</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 text-gold mx-auto mb-3" />
            <h2 className="font-semibold mb-1">{t("chat.premium")}</h2>
            <p className="text-xs text-muted-foreground mb-4">{t("chat.premiumDesc")}</p>
            <Button className="bg-gold hover:bg-gold/90 text-gold-foreground font-semibold">
              <Crown className="h-4 w-4 mr-1" /> {t("chat.upgrade")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-4">{t("chat.title")}</h1>
      {threads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {t("chat.noChats")}
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => navigate(`/chat/${thread.lead_id}`)}
              className="w-full text-left bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold">{thread.other_name || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">{thread.lead_title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(thread.unread_count || 0) > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] justify-center">
                      {thread.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{thread.last_message}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {thread.last_message_at ? new Date(thread.last_message_at).toLocaleDateString() : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatThread() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [lead, setLead] = useState<DbLead | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { createThread } = useCreateThread();
  const { messages, sendMessage } = useChatMessages(threadId);
  const isSubscribed = profile?.is_subscribed || false;

  // Find or create thread for this lead
  useEffect(() => {
    if (!leadId || !user) return;

    const init = async () => {
      // Fetch lead
      const { data: leadData } = await supabase.from("leads").select("*").eq("id", leadId).single();
      if (leadData) setLead(leadData);

      // Find existing thread
      const { data: myParticipations } = await supabase
        .from("chat_participants")
        .select("thread_id")
        .eq("user_id", user.id);

      if (myParticipations) {
        for (const p of myParticipations) {
          const { data: thread } = await supabase
            .from("chat_threads")
            .select("*")
            .eq("id", p.thread_id)
            .eq("lead_id", leadId)
            .single();
          if (thread) {
            setThreadId(thread.id);
            return;
          }
        }
      }
      // No thread yet — will create on first message
    };
    init();
  }, [leadId, user]);

  if (!isSubscribed) {
    return (
      <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("chat.back")}
        </button>
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 text-gold mx-auto mb-3" />
            <h2 className="font-semibold mb-1">{t("chat.premiumRequired")}</h2>
            <p className="text-xs text-muted-foreground mb-4">{t("chat.premiumSubDesc")}</p>
            <Button className="bg-gold hover:bg-gold/90 text-gold-foreground font-semibold">
              <Crown className="h-4 w-4 mr-1" /> {t("chat.upgradeShort")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSend = async () => {
    if (!message.trim() || !user || !lead) return;

    let currentThreadId = threadId;
    if (!currentThreadId) {
      const title = `${lead.material_type} — ${lead.quantity?.toLocaleString() || "?"} kg`;
      currentThreadId = await createThread(lead.id, title, lead.user_id, lead.poster_name || "Unknown");
      if (currentThreadId) setThreadId(currentThreadId);
    }

    if (currentThreadId) {
      await sendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      <div className="bg-navy text-navy-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold">{lead?.poster_name || "Chat"}</p>
          <p className="text-[10px] text-navy-foreground/60">{lead?.material_type || "Lead"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {lead && (
          <div className="bg-secondary rounded-lg p-3 mb-2">
            <p className="text-[10px] text-muted-foreground">Re: {lead.material_type} — {lead.quantity.toLocaleString()} kg @ ₹{lead.price_per_kg}/kg</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"
              }`}>
                {msg.text}
                <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("chat.typePlaceholder")}
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} size="icon" className="bg-primary shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
