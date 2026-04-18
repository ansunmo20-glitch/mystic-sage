import { ChevronLeft, Home, BookOpen } from 'lucide-react';
import type { DiaryEntry } from '../lib/diaryTypes';

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

export function DiaryDetail({ entry, onBack, onNavigateHome }: DiaryDetailProps) {
  return (
    <div className="min-h-screen flex flex-col pb-[52px]" style={{ backgroundColor: entry.bgColor }}>
      <header className="bg-white border-b px-4 py-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg transition-colors hover:bg-[#f5efe7]"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#c4a96e' }} strokeWidth={2} />
          </button>
          <h1 className="font-serif text-xl" style={{ color: '#3d2e1e' }}>
            {formatDate(entry.date)}
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#a89070' }}>Summary</p>
          <p className="leading-relaxed" style={{ color: '#3d2e1e' }}>{entry.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#a89070' }}>Feeling before</p>
            <p className="text-sm capitalize font-medium" style={{ color: '#3d2e1e' }}>{entry.emotionBefore}</p>
          </div>
          <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#a89070' }}>Feeling after</p>
            <p className="text-sm capitalize font-medium" style={{ color: '#3d2e1e' }}>{entry.emotionAfter}</p>
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: '#d4bc90', backgroundColor: '#fdf5e6' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#a89070' }}>Mystic Sage said</p>
          <p className="text-sm leading-relaxed italic" style={{ color: '#5c4128' }}>
            "{entry.sageMessage}"
          </p>
        </div>
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
    </div>
  );
}
