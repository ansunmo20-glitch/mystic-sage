import { useState, useEffect, useRef } from 'react';
import { Send, Flower2, LogOut, Settings as SettingsIcon, Home, BookOpen } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { sendMessage } from '../lib/api';
import type { StreamCallbacks } from '../lib/api';
import { checkAndUpdateSession, getCurrentSessionUsage, ensureUserTokens } from '../lib/sessions';
import { Modal } from './Modal';
import { SessionSidebar } from './SessionSidebar';
import { Settings } from './Settings';
import { exportConversations } from '../lib/exportConversations';
import {
  ChatSession,
  getAllSessions,
  getSession,
  createNewSession,
  saveSession,
  updateSessionTitle,
  deleteSession,
  renameSession
} from '../lib/sessionStorage';
import {
  saveDiaryDraft,
  loadDiaryDraft,
  clearDiaryDraft,
  saveDiaryEntry,
  countTurns,
} from '../lib/diaryStorage';
import { generateDiaryEntry } from '../lib/generateDiaryEntry';
import { CrisisBanner, detectCrisisKeywords } from './CrisisBanner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}


interface ChatProps {
  onNavigateDiary: () => void;
}

export function Chat({ onNavigateDiary }: ChatProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [allSessions, setAllSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsUsed, setSessionsUsed] = useState(0);
  const [maxSessions, setMaxSessions] = useState(1);
  const [canUseSession, setCanUseSession] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [maxTokens, setMaxTokens] = useState(10000);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'paid'>('free');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user?.id) {
      setCurrentSession(null);
      setAllSessions([]);
      setMessages([]);
      setHasStarted(false);
      return;
    }

    const sessions = getAllSessions(user.id);
    setAllSessions(sessions);

    if (sessions.length > 0) {
      const latestSession = sessions[0];
      setCurrentSession(latestSession);
      setMessages(latestSession.messages);
      setHasStarted(latestSession.messages.length > 0);
    } else {
      const newSession = createNewSession();
      setCurrentSession(newSession);
      saveSession(newSession, user.id);
      setAllSessions([newSession]);
      setMessages([]);
      setHasStarted(false);
    }

    const email = user.emailAddresses?.[0]?.emailAddress || user.id;
    ensureUserTokens(user.id, email).then(() => loadSessionUsage());
  }, [user?.id]);

  const loadSessionUsage = async () => {
    if (!user || !isLoaded) return;

    try {
      const usage = await getCurrentSessionUsage(user.id);
      const resolvedMaxTokens = usage.maxTokens ?? 10000;
      const resolvedTokensUsed = usage.tokensUsed ?? 0;
      setSessionsUsed(usage.sessionsUsed);
      setMaxSessions(usage.maxSessions);
      setTokensUsed(resolvedTokensUsed);
      setMaxTokens(resolvedMaxTokens);
      setSubscriptionStatus((usage.subscriptionStatus as 'free' | 'paid') ?? 'free');
      setCanUseSession(usage.subscriptionStatus === 'paid' || resolvedTokensUsed < resolvedMaxTokens);
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
    if (!messageText || loading || !user || !currentSession) return;

    if (!hasStarted) {
      const currentTokensUsed = tokensUsed ?? 0;
      const currentMaxTokens = maxTokens ?? 10000;

      if (currentTokensUsed >= currentMaxTokens) {
        setModalTitle('Session Limit Reached');
        setModalMessage("You've used all your tokens this week. Come back next Monday for a fresh start!");
        setModalOpen(true);
        return;
      }

      try {
        const email = user.emailAddresses?.[0]?.emailAddress || user.id;
        const result = await checkAndUpdateSession(user.id, email);
        setSessionsUsed(result.sessionsUsed);
        setMaxSessions(result.maxSessions);

        const resultMaxTokens = result.maxTokens ?? 10000;
        const resultTokensUsed = result.tokensUsed ?? 0;
        setMaxTokens(resultMaxTokens);
        setTokensUsed(resultTokensUsed);
        setCanUseSession(result.canUseSession);

        if (!result.canUseSession) {
          setModalTitle('Session Limit Reached');
          setModalMessage(result.message || 'Token limit reached. Resets every Monday.');
          setModalOpen(true);
          return;
        }

        setHasStarted(true);
      } catch (error) {
        console.error('Error checking session:', error);
        setModalTitle('Error');
        setModalMessage('Failed to start session. Please try again.');
        setModalOpen(true);
        return;
      }
    }

    if (detectCrisisKeywords(messageText)) {
      setShowCrisisBanner(true);
    }

    setInput('');
    setLoading(true);
    setTimeout(() => { textareaRef.current?.focus(); }, 0);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    if (currentSession.messages.length === 0) {
      updateSessionTitle(currentSession.id, messageText, user.id);
    }

    const updatedSession = {
      ...currentSession,
      messages: newMessages,
      updatedAt: new Date().toISOString()
    };
    setCurrentSession(updatedSession);
    saveSession(updatedSession, user.id);
    setAllSessions(getAllSessions(user.id));

    const assistantPlaceholderId = crypto.randomUUID();
    setMessages([...newMessages, {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }]);

    const apiMessages = newMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const callbacks: StreamCallbacks = {
     onChunk: () => {
        // 스트리밍 청크는 무시 — onDone에서 최종 message만 표시
      },
      onDone: (message, _options, tokenUsage) => {
        const timestamp = new Date().toISOString();
        const finalMessages = newMessages.concat([{
          id: assistantPlaceholderId,
          role: 'assistant' as const,
          content: message,
          timestamp,
        }]);

        setMessages(finalMessages);
        setLoading(false);

        const finalSession = {
          ...updatedSession,
          messages: finalMessages,
          updatedAt: new Date().toISOString(),
        };
        setCurrentSession(finalSession);
        saveSession(finalSession, user!.id);
        setAllSessions(getAllSessions(user!.id));

        const draftMessages = finalMessages.map(m => ({ role: m.role, content: m.content }));
        const turns = countTurns(draftMessages);
        if (turns > 0 && turns % 3 === 0) {
          console.log('[DiaryDebug] saveDiaryDraft userId:', user!.id);
          saveDiaryDraft({
            sessionId: finalSession.id,
            date: new Date().toISOString().slice(0, 10),
            messages: draftMessages,
          }, user!.id);
        }

        if (tokenUsage) {
          setTokensUsed((prev) => prev + tokenUsage.total);
        }

        setTimeout(() => { textareaRef.current?.focus(); }, 0);
      },
      onError: (error) => {
        console.error('Error:', error);
        setMessages((prev) => prev.filter((m) => m.id !== assistantPlaceholderId));
        setLoading(false);
        alert('Failed to send message. Please try again.');
      },
    };

    try {
      await sendMessage(apiMessages, user.id, callbacks);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => prev.filter((m) => m.id !== assistantPlaceholderId));
      setLoading(false);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleNewConversation = async () => {
    if (!user) return;

    const newSession = createNewSession();
    setCurrentSession(newSession);
    saveSession(newSession, user.id);
    setMessages([]);
    setHasStarted(false);
    setAllSessions(getAllSessions(user.id));
    setSidebarOpen(false);

    const draft = loadDiaryDraft(user.id);
    if (draft && countTurns(draft.messages) >= 3) {
      generateDiaryEntry(draft).then(entry => {
        saveDiaryEntry(entry, user.id);
        clearDiaryDraft(user.id);
      }).catch(() => {
        clearDiaryDraft(user.id);
      });
    } else if (draft) {
      clearDiaryDraft(user.id);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    if (!user) return;
    const session = getSession(sessionId, user.id);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
      setHasStarted(session.messages.length > 0);
      setSidebarOpen(false);
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    if (!user) return;
    renameSession(sessionId, newTitle, user.id);
    setAllSessions(getAllSessions(user.id));
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title: newTitle } : prev);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!user) return;
    deleteSession(sessionId, user.id);

    const updatedSessions = getAllSessions(user.id);
    setAllSessions(updatedSessions);

    if (currentSession?.id === sessionId) {
      if (updatedSessions.length > 0) {
        const nextSession = updatedSessions[0];
        setCurrentSession(nextSession);
        setMessages(nextSession.messages);
        setHasStarted(nextSession.messages.length > 0);
      } else {
        const newSession = createNewSession();
        setCurrentSession(newSession);
        saveSession(newSession, user.id);
        setMessages([]);
        setHasStarted(false);
        setAllSessions([newSession]);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    handleSignOut();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isPaid = subscriptionStatus === 'paid';
  const safeMaxTokens = maxTokens || 10000;
  const safeTokensUsed = tokensUsed || 0;
  const isLimitReached = !isPaid && safeTokensUsed >= safeMaxTokens;
  const tokenPercentage = isLimitReached ? 100 : safeMaxTokens > 0 ? Math.max(0, Math.min(100, (safeTokensUsed / safeMaxTokens) * 100)) : 0;
  const capacityColor = isLimitReached ? '#DC2626' : tokenPercentage < 70 ? '#C4A96E' : tokenPercentage < 90 ? '#D4A574' : '#C97C5D';
  const showLimitScreen = !isPaid && !canUseSession && hasStarted;

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col">
      <SessionSidebar
        sessions={allSessions}
        activeSessionId={currentSession?.id || null}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewConversation}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      {showCrisisBanner && (
        <CrisisBanner onClose={() => setShowCrisisBanner(false)} />
      )}

      <header className="bg-white border-b border-[#E8DED0] px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flower2 className="w-6 h-6 text-[#C4A96E]" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl text-[#2C2C2C]">Mystic Sage</h1>
            {hasStarted && (
              <button
                onClick={handleNewConversation}
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9B9B9B] hover:text-[#C4A96E] hover:bg-[#F5EFE7] rounded-lg transition-colors border border-transparent hover:border-[#E8DED0]"
                title="Return to home"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isPaid && (
            <div className="text-right">
              <div className="w-40 h-2 bg-[#F5EFE7] rounded-full overflow-hidden border border-[#E8DED0]">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${tokenPercentage}%`,
                    backgroundColor: capacityColor,
                  }}
                />
              </div>
              <p className={`text-xs mt-1 ${isLimitReached ? 'text-red-600 font-medium' : 'text-[#9B9B9B]'}`}>
                {isLimitReached ? 'Limit reached' : `${Math.round((safeTokensUsed / 1000) * 10) / 10}k / ${safeMaxTokens / 1000}k tokens`}
              </p>
            </div>
            )}

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-[#F5EFE7] rounded-lg transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5 text-[#6B6B6B]" />
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-[#9B9B9B] hover:text-[#C4A96E] transition-colors"
              title="Sign out"
            >
              <span>Sign out</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 pb-[120px]">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !showLimitScreen && (
            <div className="text-center py-12 space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-warm">
                <Flower2 className="w-8 h-8 text-[#C4A96E]" strokeWidth={1.5} />
              </div>
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-[#2C2C2C] whitespace-nowrap">
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
                  You've used your session this week
                </h2>
                <p className="text-[#6B6B6B] text-lg leading-relaxed italic">
                  Come back next Monday — the practice of patience is itself a teaching.
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
                {message.role === 'assistant' && loading && message.content === '' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#C4A96E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#C4A96E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#C4A96E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {loading && message.role === 'assistant' && message.content !== '' && (
                      <span className="inline-block w-0.5 h-4 bg-[#C4A96E] ml-0.5 animate-pulse align-middle" />
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {!showLimitScreen && (
        <footer className="fixed left-0 right-0 bg-white border-t border-[#E8DED0] px-6 py-4 shadow-warm-top" style={{ bottom: '52px', zIndex: 40 }}>
          <div className="max-w-4xl mx-auto">
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
          </div>
        </footer>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 bg-[#faf6ef] border-t border-[#e2d8c8] flex items-center"
        style={{ height: '52px', zIndex: 50 }}
      >
        <button
          onClick={handleNewConversation}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
          style={{ color: hasStarted || messages.length > 0 ? '#a89070' : '#c4a96e' }}
        >
          <Home className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-medium tracking-wide">Home</span>
        </button>
        <button
          onClick={onNavigateDiary}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
          style={{ color: '#a89070' }}
        >
          <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-medium tracking-wide">Diary</span>
        </button>
      </nav>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />

      {settingsOpen && user && (
        <Settings
          userEmail={user.primaryEmailAddress?.emailAddress || ''}
          onClose={() => setSettingsOpen(false)}
          onSignOut={handleSignOut}
          onExportConversations={exportConversations}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </div>
  );
}
