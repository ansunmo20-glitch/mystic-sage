import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ChatSession, formatSessionDate } from '../lib/sessionStorage';

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onToggle
}: SessionSidebarProps) {
  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-[#E8DED0] shadow-lg transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#E8DED0]">
            <button
              onClick={onNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C4A96E] text-white rounded-xl hover:bg-[#B39A5E] transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Conversation</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`relative group w-full rounded-lg transition-all ${
                  activeSessionId === session.id
                    ? 'bg-[#F5EFE7] border border-[#C4A96E]'
                    : 'hover:bg-[#FAF6EF]'
                }`}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left px-4 py-3 pr-10"
                >
                  <div className="text-sm truncate">
                    <span className="text-[#9B9B9B]">{formatSessionDate(session.createdAt)}</span>
                    <span className="text-[#9B9B9B] mx-1.5">·</span>
                    <span className={activeSessionId === session.id ? 'text-[#2C2C2C]' : 'text-[#6B6B6B]'}>
                      {session.title}
                    </span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#F5EFE7] transition-opacity"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4 text-[#9B9B9B] hover:text-[#C97C5D]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`fixed top-4 z-50 bg-white border border-[#E8DED0] rounded-lg p-2 shadow-sm hover:bg-[#FAF6EF] transition-all ${
          isOpen ? 'left-[292px]' : 'left-4'
        }`}
        style={{ transition: 'left 300ms' }}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-[#6B6B6B]" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={onToggle}
        />
      )}
    </>
  );
}
