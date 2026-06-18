"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Send, Paperclip } from "lucide-react";

export default function SupportPage() {
  const { member, showToast } = useAppStore();
  const [messages, setMessages] = useState<
    { id: string; body: string; sender_role: string; sent_at: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || !member) return;
    setLoading(true);

    try {
      // Check for existing conversation or create one
      const { data: conversations } = await supabase
        .from("support_conversations")
        .select("id")
        .eq("member_id", member.id)
        .eq("state", "open")
        .limit(1);

      let conversationId: string;

      if (conversations && conversations.length > 0) {
        conversationId = conversations[0].id;
      } else {
        const { data: newConv } = await supabase
          .from("support_conversations")
          .insert({
            member_id: member.id,
            topic: "استفسار عام",
            priority: "normal",
            state: "open",
          })
          .select()
          .single();
        conversationId = newConv?.id || "";
      }

      if (conversationId) {
        await supabase.from("support_messages").insert({
          conversation_id: conversationId,
          sender_id: member.id,
          sender_role: "member",
          body_text: newMessage,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          body: newMessage,
          sender_role: "member",
          sent_at: new Date().toISOString(),
        },
      ]);
      setNewMessage("");
      showToast("تم إرسال الرسالة");
    } catch {
      showToast("فشل إرسال الرسالة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.sender_role === "member" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.sender_role === "member"
                    ? "bg-charcoal text-white rounded-br-md"
                    : "bg-white text-charcoal border border-gray-border rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.body}</p>
                <p
                  className={`text-[9px] mt-1 ${
                    msg.sender_role === "member"
                      ? "text-white/50"
                      : "text-text-secondary/60"
                  }`}
                >
                  الآن
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-bg rounded-2xl flex items-center justify-center mb-3">
              <Paperclip size={24} className="text-text-secondary" />
            </div>
            <p className="text-sm font-medium text-charcoal">الدعم الفني</p>
            <p className="text-xs text-text-secondary mt-1">
              كيف يمكننا مساعدتك؟
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-border">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-bg rounded-2xl border border-gray-border px-4 py-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              rows={1}
              className="w-full text-sm text-charcoal placeholder:text-charcoal/30 outline-none bg-transparent resize-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || loading}
            className="w-11 h-11 bg-charcoal rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
