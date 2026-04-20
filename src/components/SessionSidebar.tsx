import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, Pencil, Check, X } from 'lucide-react';
import { ChatSession, formatSessionDate } from '../lib/sessionStorage';

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onToggle
}: SessionSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditValue(session.title);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      onRenameSession(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit();
    else if (e.key === 'Escape') cancelEdit();
  };

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
                {editingId === session.id ? (
                  <div className="flex items-center gap-1 px-3 py-2">
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={commitEdit}
                      maxLength={60}
                      className="flex-1 min-w-0 text-sm text-[#2C2C2C] bg-white border border-[#C4A96E] rounded-md px-2 py-1 focus:outline-none"
                    />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); commitEdit(); }}
                      className="p-1 rounded hover:bg-[#F5EFE7] text-[#C4A96E] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
                      className="p-1 rounded hover:bg-[#F5EFE7] text-[#9B9B9B] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="w-full text-left px-4 py-3 pr-20"
                    >
                      <div className="text-sm truncate">
                        <span className="text-[#9B9B9B]">{formatSessionDate(session.createdAt)}</span>
                        <span className="text-[#9B9B9B] mx-1.5">·</span>
                        <span className={activeSessionId === session.id ? 'text-[#2C2C2C]' : 'text-[#6B6B6B]'}>
                          {session.title}
                        </span>
                      </div>
                    </button>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEditing(session, e)}
                        className="p-1.5 rounded-md hover:bg-[#F5EFE7] transition-colors"
                        title="Rename session"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#9B9B9B] hover:text-[#C4A96E]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1.5 rounded-md hover:bg-[#F5EFE7] transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#9B9B9B] hover:text-[#C97C5D]" />
                      </button>
                    </div>
                  </>
                )}
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
