import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, Send, Crown, Lock, 
  MessageCircle, Loader2, Sparkles, ShieldCheck 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  useChatThreads, useChatMessages, 
  useSendMessage, useCreateOrGetThread 
} from "@/hooks/useChat";
import { useLead } from "@/hooks/useLeads";

export default function ChatList() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useI18n();
  const { data: threads = [], isLoading } = useChatThreads(user.id);

  if (!user.isSubscribed) {
    return (
      <div className="px-6 pt-8 pb-8 max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-black mb-6 tracking-tight">{t("chat.title")}</h1>
        <Card className="border-none shadow-2xl bg-navy text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-20 blur-2xl h-32 w-32 bg-emerald rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="p-4 rounded-3xl bg-white/10 w-fit mx-auto mb-6">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t("chat.premium")}</h2>
            <p className="text-sm text-white/60 mb-8 leading-relaxed">{t("chat.premiumDesc")}</p>
            <Button 
                onClick={() => navigate("/subscribe")}
                className="w-full bg-gold hover:bg-gold/90 text-navy font-black h-12 rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              <Crown className="h-4 w-4 mr-2" /> {t("chat.upgrade")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-8 max-w-md mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight">{t("chat.title")}</h1>
        {threads.length > 0 && (
          <Badge className="bg-emerald/10 text-emerald border-none text-[10px] font-bold px-3">
            {threads.length} ACTIVE
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          <p className="text-sm text-slate-400 font-medium">Loading conversations...</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-sm border border-dashed border-slate-200">
          <div className="p-5 rounded-full bg-slate-50 w-fit mx-auto mb-4">
            <MessageCircle className="h-10 w-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold">{t("chat.noChats")}</p>
          <Button 
            variant="link" 
            onClick={() => navigate("/")} 
            className="text-primary font-bold mt-2"
          >
            Explore Marketplace
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread: any) => {
            const participants = thread.chat_participants || [];
            const other = participants.find((p: any) => p.user_id !== user.id);
            return (
              <button
                key={thread.id}
                onClick={() => navigate(`/chat/${thread.lead_id}`, { state: { threadId: thread.id } })}
                className="w-full text-left bg-white shadow-sm border border-slate-100 rounded-[2rem] p-5 hover:shadow-xl hover:border-transparent transition-all group active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                      {other?.display_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 leading-tight">{other?.display_name || "Merchant"}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate max-w-[150px]">
                        {thread.lead_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-[10px] font-bold text-slate-300">
                      {thread.last_message_at ? new Date(thread.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""}
                    </p>
                    {other?.unread_count > 0 && (
                      <Badge className="bg-emerald text-white text-[10px] h-5 min-w-[20px] justify-center border-none font-bold">
                        {other.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                   {thread.last_message ? (
                     <p className="text-sm text-slate-500 truncate w-full italic">"{thread.last_message}"</p>
                   ) : (
                     <p className="text-sm text-slate-300 italic">No messages yet</p>
                   )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChatThread() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: lead } = useLead(leadId);
  const { mutateAsync: createThread } = useCreateOrGetThread();
  const [threadId, setThreadId] = useState<string | null>(null);

  const { data: messages = [], isLoading: isMsgsLoading } = useChatMessages(threadId || undefined);
  const { mutate: sendMessage } = useSendMessage();

  useEffect(() => {
    if (lead && user.id) {
       createThread({
         leadId: lead.id,
         leadTitle: `${lead.materialType} - ${lead.quantity}kg`,
         participantIds: [user.id, lead.posterId]
       }).then(id => setThreadId(id));
    }
  }, [lead, user.id, createThread]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user.isSubscribed) {
    return (
      <div className="px-6 pt-12 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 mb-8 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
        </button>
        <Card className="border-none shadow-2xl bg-navy text-white overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-3xl bg-white/10 w-fit mx-auto mb-6">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t("chat.premiumRequired")}</h2>
            <p className="text-sm text-white/60 mb-8 leading-relaxed">{t("chat.premiumSubDesc")}</p>
            <Button 
                onClick={() => navigate("/subscribe")}
                className="w-full bg-gold hover:bg-gold/90 text-navy font-black h-12 rounded-xl shadow-lg"
            >
              <Crown className="h-4 w-4 mr-2" /> Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim() || !threadId) return;
    sendMessage({ threadId, senderId: user.id, text: message.trim() });
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative overflow-hidden">
      {/* Premium Header */}
      <div className="bg-navy text-white px-5 py-4 flex items-center justify-between shadow-lg relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-emerald">
               {lead?.posterName?.[0] || "?"}
             </div>
             <div>
               <p className="text-sm font-black leading-tight">{lead?.posterName || "Merchant"}</p>
               <p className="text-[10px] text-emerald font-bold uppercase tracking-wider flex items-center gap-1">
                 <ShieldCheck className="h-2.5 w-2.5" /> SECURE CHANNEL
               </p>
             </div>
          </div>
        </div>
        <Badge className="bg-emerald/20 text-emerald border-none text-[9px] font-black">ENCRYPTED</Badge>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {lead && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-sm border border-slate-100 mb-6 flex items-center justify-between group">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-primary/10 text-primary">
                 <Sparkles className="h-4 w-4" />
               </div>
               <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{lead.materialType}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{lead.quantity.toLocaleString()} kg @ ₹{lead.pricePerKg}/kg</p>
               </div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary" onClick={() => navigate(`/lead/${lead.id}`)}>
               <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}

        {isMsgsLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-slate-200" />
          </div>
        )}

        {messages.map((msg: any) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed ${
                isMe 
                ? "bg-slate-900 text-white rounded-br-none" 
                : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
              }`}>
                {msg.text}
                <div className={`text-[9px] mt-1.5 flex items-center gap-1 ${isMe ? "text-white/40 justify-end" : "text-slate-300"}`}>
                   {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                   {isMe && <ShieldCheck className="h-2.5 w-2.5" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-20">
        <div className="flex gap-2 max-w-md mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your secure message..."
            className="flex-1 h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-medium focus:ring-2 ring-primary/20"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || !threadId}
            size="icon" 
            className="bg-slate-900 hover:bg-black text-white shrink-0 h-12 w-12 rounded-2xl shadow-xl transition-all active:scale-90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[9px] text-center text-slate-300 mt-3 font-bold uppercase tracking-widest">
          Verified Channel • Handled by HiTex Cloud
        </p>
      </div>
    </div>
  );
}
