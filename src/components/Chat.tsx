import { useState, useEffect, useRef } from 'react';
import { Send, Flower2, Coffee, Mail, LogOut } from 'lucide-react';
import { sendMessage } from '../lib/api';
import { saveMessages, loadMessages, clearMessages } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { checkAndUpdateSession, getCurrentSessionUsage } from '../lib/sessions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}


export function Chat() {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsUsed, setSessionsUsed] = useState(0);
  const [maxSessions, setMaxSessions] = useState(1);
  const [canUseSession, setCanUseSession] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = loadMessages();
    if (saved.length > 0) {
      setMessages(saved);
      setHasStarted(true);
    }

    if (user) {
      loadSessionUsage();
    }
  }, [user]);

  const loadSessionUsage = async () => {
    if (!user) return;

    try {
      const usage = await getCurrentSessionUsage(user.id);
      setSessionsUsed(usage.sessionsUsed);
      setMaxSessions(usage.maxSessions);
      setCanUseSession(usage.sessionsUsed < usage.maxSessions);
    } catch (error) {
      console.error('Error loading session usage:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || loading || !user) return;

    if (!canUseSession) {
      alert('You have reached your weekly session limit. Sessions reset every Monday.');
      return;
    }

    if (!hasStarted) {
      try {
        const result = await checkAndUpdateSession(user.id, user.email || '');
        setSessionsUsed(result.sessionsUsed);
        setMaxSessions(result.maxSessions);
        setCanUseSession(result.canUseSession);

        if (!result.canUseSession) {
          alert(result.message || 'Session limit reached');
          return;
        }

        setHasStarted(true);
      } catch (error) {
        console.error('Error checking session:', error);
        alert('Failed to start session. Please try again.');
        return;
      }
    }

    setInput('');
    setLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessages(newMessages);

    try {
      const apiMessages = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendMessage(apiMessages);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    if (!user) return;

    if (confirm('Start a new conversation? Your current chat will be cleared.')) {
      clearMessages();
      setMessages([]);
      setHasStarted(false);

      try {
        const result = await checkAndUpdateSession(user.id, user.email || '');
        setSessionsUsed(result.sessionsUsed);
        setMaxSessions(result.maxSessions);
        setCanUseSession(result.canUseSession);

        if (!result.canUseSession) {
          alert(result.message || 'Session limit reached');
        }
      } catch (error) {
        console.error('Error starting new session:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      clearMessages();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const capacityPercentage = maxSessions > 0 ? ((maxSessions - sessionsUsed) / maxSessions) * 100 : 0;
  const capacityColor = capacityPercentage > 30 ? '#C4A96E' : '#D4A574';
  const showLimitScreen = !canUseSession && hasStarted;

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col">
      <header className="bg-white border-b border-[#E8DED0] px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flower2 className="w-6 h-6 text-[#C4A96E]" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl text-[#2C2C2C]">Mystic Sage</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="w-40 h-2 bg-[#F5EFE7] rounded-full overflow-hidden border border-[#E8DED0]">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${capacityPercentage}%`,
                    backgroundColor: capacityColor,
                  }}
                />
              </div>
              <p className="text-xs text-[#9B9B9B] mt-1">
                {sessionsUsed}/{maxSessions} sessions used
              </p>
            </div>

            {hasStarted && (
              <button
                onClick={handleNewConversation}
                className="text-sm text-[#C4A96E] hover:text-[#B39A5E] transition-colors"
              >
                New
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-[#9B9B9B] hover:text-[#C4A96E] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !showLimitScreen && (
            <div className="text-center py-12 space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-warm">
                <Flower2 className="w-8 h-8 text-[#C4A96E]" strokeWidth={1.5} />
              </div>
              <div className="space-y-4">
                <h2 className="font-serif text-2xl text-[#2C2C2C]">
                  What brought you here today?
                </h2>
              </div>
            </div>
          )}

          {showLimitScreen && (
            <div className="text-center py-16 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-warm">
                <Flower2 className="w-10 h-10 text-[#C4A96E]" strokeWidth={1.5} />
              </div>
              <div className="space-y-4 max-w-lg mx-auto">
                <h2 className="font-serif text-2xl text-[#2C2C2C]">
                  Your weekly sessions have ended
                </h2>
                <p className="text-[#6B6B6B] text-lg leading-relaxed italic">
                  Return on Monday — the practice of patience is itself a teaching.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E8DED0] flex items-center justify-center">
                    <Flower2 className="w-4 h-4 text-[#C4A96E]" strokeWidth={1.5} />
                  </div>
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-[#F5EFE7] text-[#2C2C2C]'
                    : 'bg-white border border-[#E8DED0] text-[#2C2C2C] shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 mr-3 mt-1">
                <div className="w-8 h-8 rounded-full bg-white border border-[#E8DED0] flex items-center justify-center">
                  <Flower2 className="w-4 h-4 text-[#C4A96E]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="bg-white border border-[#E8DED0] rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#C4A96E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#C4A96E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#C4A96E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {!showLimitScreen && (
        <footer className="bg-white border-t border-[#E8DED0] px-6 py-6 shadow-warm-top">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What brought you here today?"
                disabled={loading}
                rows={1}
                className="flex-1 px-6 py-4 bg-[#FAF6EF] border border-[#E8DED0] rounded-2xl text-[#2C2C2C] placeholder-[#9B9B9B] focus:outline-none focus:border-[#C4A96E] transition-all disabled:opacity-50 resize-none min-h-[56px] max-h-[200px]"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-6 py-4 bg-[#C4A96E] text-white rounded-2xl hover:bg-[#B39A5E] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-warm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center items-center gap-4 pt-2">
              <a
                href="https://buymeacoffee.com/mysticsage"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#9B9B9B] hover:text-[#C4A96E] transition-colors rounded-full hover:bg-[#FAF6EF]"
              >
                <Coffee className="w-4 h-4" />
                <span>Support Mystic Sage</span>
              </a>
              <a
                href="mailto:mysticsage.hello@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#9B9B9B] hover:text-[#C4A96E] transition-colors rounded-full hover:bg-[#FAF6EF]"
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
