import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/lib/appContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Crown, Lock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Chat list page
export default function ChatList() {
  const navigate = useNavigate();
  const { user, chatThreads } = useApp();

  if (!user.isSubscribed) {
    return (
      <div className="px-4 pt-4 pb-8 max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-4">Chats</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 text-gold mx-auto mb-3" />
            <h2 className="font-semibold mb-1">Premium Feature</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Chat directly with buyers and sellers. Negotiate deals, request samples, and close transactions — all within HiTex.
            </p>
            <Button className="bg-gold hover:bg-gold/90 text-gold-foreground font-semibold">
              <Crown className="h-4 w-4 mr-1" /> Upgrade to Premium — ₹10,000/yr
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-4">Chats</h1>
      {chatThreads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No conversations yet. Start chatting from a lead detail page.
        </div>
      ) : (
        <div className="space-y-2">
          {chatThreads.map((thread) => {
            const other = thread.participants.find((p) => p.id !== user.id);
            return (
              <button
                key={thread.id}
                onClick={() => navigate(`/chat/${thread.leadId}`)}
                className="w-full text-left bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold">{other?.name || "Unknown"}</p>
                    <p className="text-[10px] text-muted-foreground">{thread.leadTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {thread.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] justify-center">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {new Date(thread.lastMessageAt).toLocaleDateString()}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Chat thread page
export function ChatThread() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { user, chatThreads, setChatThreads, leads } = useApp();
  const [message, setMessage] = useState("");

  const thread = chatThreads.find((t) => t.leadId === leadId);
  const lead = leads.find((l) => l.id === leadId);

  if (!user.isSubscribed) {
    return (
      <div className="px-4 pt-3 pb-8 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 text-gold mx-auto mb-3" />
            <h2 className="font-semibold mb-1">Premium Required</h2>
            <p className="text-xs text-muted-foreground mb-4">Subscribe to chat with this user.</p>
            <Button className="bg-gold hover:bg-gold/90 text-gold-foreground font-semibold">
              <Crown className="h-4 w-4 mr-1" /> Upgrade — ₹10,000/yr
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg = { id: Date.now().toString(), senderId: user.id, text: message.trim(), timestamp: new Date().toISOString() };

    if (thread) {
      setChatThreads((prev) =>
        prev.map((t) =>
          t.leadId === leadId
            ? { ...t, messages: [...t.messages, newMsg], lastMessage: message.trim(), lastMessageAt: newMsg.timestamp }
            : t
        )
      );
    } else {
      const otherName = lead?.posterName || "Unknown";
      const otherId = lead?.posterId || "unknown";
      setChatThreads((prev) => [
        ...prev,
        {
          id: `chat-${Date.now()}`,
          leadId: leadId || "",
          leadTitle: `${lead?.materialType || "Lead"} — ${lead?.quantity?.toLocaleString() || "?"} kg`,
          participants: [{ id: user.id, name: user.businessName }, { id: otherId, name: otherName }],
          messages: [newMsg],
          lastMessage: message.trim(),
          lastMessageAt: newMsg.timestamp,
          unreadCount: 0,
        },
      ]);
    }
    setMessage("");
  };

  const messages = thread?.messages || [];
  const other = thread?.participants.find((p) => p.id !== user.id);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="bg-navy text-navy-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold">{other?.name || lead?.posterName || "Chat"}</p>
          <p className="text-[10px] text-navy-foreground/60">{lead?.materialType || "Lead"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {lead && (
          <div className="bg-secondary rounded-lg p-3 mb-2">
            <p className="text-[10px] text-muted-foreground">Re: {lead.materialType} — {lead.quantity.toLocaleString()} kg @ ₹{lead.pricePerKg}/kg</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"
              }`}>
                {msg.text}
                <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message…"
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
