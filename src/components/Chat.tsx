import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Message, Conversation } from '../lib/supabase';
import { Send, Sparkles, MessageSquare } from 'lucide-react';

const SESSIONS_PER_WEEK = 7;

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

interface AssistantMessage extends Message {
  quickReplies?: string[];
}

export function Chat() {
  const [messages, setMessages] = useState<(Message | AssistantMessage)[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [sessionsUsed, setSessionsUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: 'New Conversation',
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentConversation(data);
      setMessages([]);
    }
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: 'New Conversation',
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentConversation(data);
      setMessages([]);
      setSessionsUsed(0);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const handleQuickReply = async (reply: string) => {
    setInput(reply);
    await new Promise(resolve => setTimeout(resolve, 100));
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation || loading) return;

    if (sessionsUsed >= SESSIONS_PER_WEEK) {
      alert(`You've used all ${SESSIONS_PER_WEEK} sessions this week. Start a new conversation!`);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const newMessages = [
        ...messages,
        {
          id: crypto.randomUUID(),
          conversation_id: currentConversation.id,
          role: 'user' as const,
          content: userMessage,
          created_at: new Date().toISOString(),
        },
      ];
      setMessages(newMessages);
      setSessionsUsed(sessionsUsed + 1);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mystic-sage-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: currentConversation.id,
            message: userMessage,
            conversationHistory: messages,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMsg: AssistantMessage = {
        id: data.messageId,
        conversation_id: currentConversation.id,
        role: 'assistant' as const,
        content: data.message,
        stage: data.stage,
        created_at: new Date().toISOString(),
        quickReplies: data.quickReplies || [],
      };

      setMessages([...newMessages, assistantMsg]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
      setSessionsUsed(sessionsUsed > 0 ? sessionsUsed - 1 : 0);
    } finally {
      setLoading(false);
    }
  };

  const sessionsRemaining = SESSIONS_PER_WEEK - sessionsUsed;
  const capacityPercent = (sessionsUsed / SESSIONS_PER_WEEK) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1714] to-[#0f0c0a] flex flex-col">
      <header className="bg-black/40 backdrop-blur-md border-b border-amber-900/20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-200">Mystic Sage</h1>
              <p className="text-xs text-amber-900">Ancient wisdom for modern minds</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="w-32 h-1.5 bg-amber-950/40 rounded-full overflow-hidden border border-amber-900/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
              <p className="text-xs text-amber-700 mt-1">
                {sessionsRemaining} sessions left
              </p>
            </div>
            <button
              onClick={() => createNewConversation()}
              className="p-2 hover:bg-amber-900/20 rounded-lg transition-colors"
              title="New conversation"
            >
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-6 animate-pulse">
                <Sparkles className="w-10 h-10 text-amber-950" />
              </div>
              <h2 className="text-2xl font-semibold text-amber-200 mb-3">
                Welcome, seeker
              </h2>
              <p className="text-amber-100/60 max-w-md mx-auto leading-relaxed">
                Share what's on your mind. I'm here to listen and help you see clearly.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-amber-950 shadow-lg'
                        : 'bg-amber-950/30 backdrop-blur-sm text-amber-50 border border-amber-900/30'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
                {message.role === 'assistant' && 'quickReplies' in message && message.quickReplies && message.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-4">
                    {message.quickReplies.map((reply, replyIdx) => (
                      <button
                        key={replyIdx}
                        onClick={() => handleQuickReply(reply)}
                        disabled={loading}
                        className="text-sm px-4 py-2 bg-amber-900/40 hover:bg-amber-800/50 text-amber-100 border border-amber-700/40 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-amber-950/30 backdrop-blur-sm rounded-2xl px-6 py-4 border border-amber-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-amber-900/20 px-4 py-4 space-y-4 bg-black/40 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts..."
              disabled={loading || sessionsUsed >= SESSIONS_PER_WEEK}
              className="flex-1 px-6 py-4 bg-amber-950/20 border border-amber-700/30 rounded-full text-amber-50 placeholder-amber-700/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || sessionsUsed >= SESSIONS_PER_WEEK}
              className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 rounded-full hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="max-w-4xl mx-auto bg-amber-900/20 border border-amber-700/20 rounded-lg p-4 text-center">
          <p className="text-sm text-amber-100/60">Advertisement Space</p>
        </div>
      </footer>
    </div>
  );
}
