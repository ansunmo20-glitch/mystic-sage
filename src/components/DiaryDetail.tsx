import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Home, BookOpen, Pencil, Trash2 } from 'lucide-react';
import type { DiaryEntry } from '../lib/diaryTypes';
import { updateDiaryEntry, deleteDiaryEntry } from '../lib/diaryStorage';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

interface DiaryDetailProps {
  entry: DiaryEntry;
  onBack: () => void;
  onNavigateHome: () => void;
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={className}
      style={{ resize: 'none', overflow: 'hidden', ...style }}
    />
  );
}

export function DiaryDetail({ entry, onBack, onNavigateHome }: DiaryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [summary, setSummary] = useState(entry.summary);
  const [emotionBefore, setEmotionBefore] = useState(entry.emotionBefore);
  const [emotionAfter, setEmotionAfter] = useState(entry.emotionAfter);
  const [sageMessage, setSageMessage] = useState(entry.sageMessage);

  const [current, setCurrent] = useState(entry);

  const handleSave = () => {
    const updated: DiaryEntry = {
      ...current,
      summary,
      emotionBefore,
      emotionAfter,
      sageMessage,
    };
    updateDiaryEntry(updated);
    setCurrent(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSummary(current.summary);
    setEmotionBefore(current.emotionBefore);
    setEmotionAfter(current.emotionAfter);
    setSageMessage(current.sageMessage);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteDiaryEntry(current.id);
    onBack();
  };

  const inputBase = 'w-full bg-transparent border border-[#e2d8c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#c4a96e] transition-colors leading-relaxed';

  return (
    <div className="min-h-screen flex flex-col pb-[52px]" style={{ backgroundColor: current.bgColor }}>
      <header className="bg-white border-b px-4 py-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-lg transition-colors hover:bg-[#f5efe7]"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#c4a96e' }} strokeWidth={2} />
            </button>
            <h1 className="font-serif text-xl" style={{ color: '#3d2e1e' }}>
              {formatDate(current.date)}
            </h1>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors hover:bg-[#f5efe7]"
                aria-label="Edit entry"
              >
                <Pencil className="w-4 h-4" style={{ color: '#c4a96e' }} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors hover:bg-[#f5efe7]"
                aria-label="Delete entry"
              >
                <Trash2 className="w-4 h-4" style={{ color: '#a89070' }} strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        {isEditing ? (
          <>
            <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
              <p className="text-sm font-medium mb-2" style={{ color: '#a89070' }}>Summary</p>
              <AutoTextarea
                value={summary}
                onChange={setSummary}
                placeholder="What happened today..."
                className={inputBase}
                style={{ color: '#3d2e1e' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#a89070' }}>Feeling before</p>
                <input
                  type="text"
                  value={emotionBefore}
                  onChange={e => setEmotionBefore(e.target.value)}
                  placeholder="e.g. anxious"
                  className={inputBase}
                  style={{ color: '#3d2e1e' }}
                />
              </div>
              <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#a89070' }}>Feeling after</p>
                <input
                  type="text"
                  value={emotionAfter}
                  onChange={e => setEmotionAfter(e.target.value)}
                  placeholder="e.g. calmer"
                  className={inputBase}
                  style={{ color: '#3d2e1e' }}
                />
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ borderColor: '#d4bc90', backgroundColor: '#fdf5e6' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#a89070' }}>Mystic Sage said</p>
              <AutoTextarea
                value={sageMessage}
                onChange={setSageMessage}
                placeholder="Insight from the session..."
                className={`${inputBase} italic`}
                style={{ color: '#5c4128', backgroundColor: 'transparent' }}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm transition-all"
                style={{ backgroundColor: '#c4a96e' }}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-2xl text-sm transition-colors"
                style={{ color: '#a89070' }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
              <p className="text-sm font-medium mb-2" style={{ color: '#a89070' }}>Summary</p>
              <p className="leading-relaxed" style={{ color: '#3d2e1e' }}>{current.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#a89070' }}>Feeling before</p>
                <p className="text-sm capitalize font-medium" style={{ color: '#3d2e1e' }}>{current.emotionBefore}</p>
              </div>
              <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#a89070' }}>Feeling after</p>
                <p className="text-sm capitalize font-medium" style={{ color: '#3d2e1e' }}>{current.emotionAfter}</p>
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ borderColor: '#d4bc90', backgroundColor: '#fdf5e6' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#a89070' }}>Mystic Sage said</p>
              <p className="text-sm leading-relaxed italic" style={{ color: '#5c4128' }}>
                "{current.sageMessage}"
              </p>
            </div>
          </>
        )}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 border-t flex items-center"
        style={{ height: '52px', backgroundColor: '#faf6ef', borderColor: '#e2d8c8' }}
      >
        <button
          onClick={onNavigateHome}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
          style={{ color: '#a89070' }}
        >
          <Home className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-medium tracking-wide">Home</span>
        </button>
        <button
          onClick={onBack}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
          style={{ color: '#c4a96e' }}
        >
          <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-medium tracking-wide">Diary</span>
        </button>
      </nav>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(61,46,30,0.4)' }}
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-4">
            <p className="font-serif text-lg text-center" style={{ color: '#3d2e1e' }}>
              Delete this entry?
            </p>
            <p className="text-sm text-center" style={{ color: '#a89070' }}>
              This cannot be undone.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleDelete}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm transition-all"
                style={{ backgroundColor: '#8b4a3a' }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 rounded-2xl text-sm transition-colors"
                style={{ color: '#a89070' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
