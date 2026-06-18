'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader, Loading, Badge, Btn, useToast } from '@/components/ui/shared';
import { fetchConversations, fetchMessages, sendMessage, closeConversation } from '@/lib/api';
import type { SupportConversation, SupportMessage, Member } from '@/lib/types';
import { Send, XCircle, ArrowRight } from 'lucide-react';

export function SupportPage() {
  const [conversations, setConversations] = useState<(SupportConversation & { member: Member | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [filterState, setFilterState] = useState('open');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { show, ToastComponent } = useToast();

  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations({ state: filterState || undefined });
      setConversations(data);
    } catch { show('فشل التحميل', 'error'); }
    finally { setLoading(false); }
  }, [filterState, show]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected);
  }, [selected]);

  const loadMessages = async (convId: string) => {
    try {
      const data = await fetchMessages(convId);
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { /* ignore */ }
  };

  const handleSend = async () => {
    if (!selected || !newMsg.trim()) return;
    setSending(true);
    try {
      await sendMessage(selected, newMsg.trim());
      setNewMsg('');
      await loadMessages(selected);
    } catch { show('فشل الإرسال', 'error'); }
    finally { setSending(false); }
  };

  const handleClose = async (convId: string) => {
    try {
      await closeConversation(convId);
      show('تم إغلاق المحادثة');
      if (selected === convId) setSelected(null);
      loadConversations();
    } catch { show('فشل إغلاق المحادثة', 'error'); }
  };

  if (loading) return <Loading />;

  const selectedConv = conversations.find(c => c.id === selected);

  return (
    <div className="space-y-4">
      {ToastComponent}
      <PageHeader title="الدعم الفني" subtitle={`${conversations.length} محادثة`} />

      <div className="bg-white border border-charcoal-100 rounded-2xl p-3">
        <div className="flex gap-2">
          {['open', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterState(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterState === s ? 'bg-charcoal-900 text-white' : 'text-charcoal-500 hover:bg-charcoal-50'}`}
            >
              {s === 'open' ? 'مفتوحة' : 'مغلقة'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white border border-charcoal-100 rounded-2xl overflow-hidden flex flex-col">
          <div className="max-h-96 lg:max-h-none overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-center text-charcoal-400 text-sm py-10">لا توجد محادثات</p>
            ) : (
              conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-right p-4 border-b border-charcoal-50 hover:bg-charcoal-50/50 transition-colors ${selected === c.id ? 'bg-charcoal-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-charcoal-900">{c.member?.display_name || 'مجهول'}</span>
                    <Badge variant={c.state === 'open' ? 'warning' : 'neutral'}>{c.state === 'open' ? 'مفتوحة' : 'مغلقة'}</Badge>
                  </div>
                  <p className="text-sm text-charcoal-700 truncate">{c.subject}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{new Date(c.updated_at).toLocaleString('ar-IQ')}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white border border-charcoal-100 rounded-2xl flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-charcoal-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-bold text-charcoal-900 text-sm">{selectedConv.subject}</h3>
                  <p className="text-xs text-charcoal-400">{selectedConv.member?.display_name} • {selectedConv.member?.phone}</p>
                </div>
                {selectedConv.state === 'open' && (
                  <Btn variant="secondary" size="sm" onClick={() => handleClose(selectedConv.id)}>
                    <XCircle size={14} /> إغلاق
                  </Btn>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender_type === 'admin'
                        ? 'bg-charcoal-900 text-white rounded-br-sm'
                        : 'bg-charcoal-100 text-charcoal-900 rounded-bl-sm'
                    }`}>
                      <p>{msg.body}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender_type === 'admin' ? 'text-white/50' : 'text-charcoal-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedConv.state === 'open' && (
                <div className="p-3 border-t border-charcoal-100 flex gap-2 shrink-0">
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="اكتب ردك..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-900/10"
                    disabled={sending}
                  />
                  <Btn onClick={handleSend} disabled={sending || !newMsg.trim()}>
                    <Send size={16} />
                  </Btn>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-charcoal-300">
              <div className="text-center">
                <ArrowRight size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">اختر محادثة لعرضها</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}