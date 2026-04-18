import { useState } from 'react';
import { Flower2, Home, BookOpen, ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from 'lucide-react';

interface DiaryEntry {
  id: string;
  date: Date;
  summary: string;
  content: string;
}

function getSampleEntries(): DiaryEntry[] {
  const today = new Date();
  const d = (offset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    return date;
  };

  return [
    {
      id: '1',
      date: d(0),
      summary: 'Felt a wave of gratitude this morning — something shifted.',
      content: 'Felt a wave of gratitude this morning — something shifted. I sat with my tea and just noticed the light coming through the window.',
    },
    {
      id: '2',
      date: d(3),
      summary: 'Explored the tension between what I want and what I fear.',
      content: 'Explored the tension between what I want and what I fear. The conversation with Mystic Sage helped me see it from a different angle.',
    },
    {
      id: '3',
      date: d(7),
      summary: 'Wrote about my relationship with stillness — it felt hard.',
      content: 'Wrote about my relationship with stillness — it felt hard at first. But I stayed with it. There is something underneath all the busyness.',
    },
    {
      id: '4',
      date: d(10),
      summary: 'A memory surfaced unexpectedly. Let myself sit with it.',
      content: 'A memory surfaced unexpectedly. Let myself sit with it instead of pushing it away. It didn\'t feel as heavy as I thought it would.',
    },
  ];
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatEntryDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

interface DiaryProps {
  onNavigateHome: () => void;
}

export function Diary({ onNavigateHome }: DiaryProps) {
  const today = new Date();
  const entries = getSampleEntries();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const entryByDay: Record<string, DiaryEntry> = {};
  entries.forEach(e => {
    const key = `${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`;
    entryByDay[key] = e;
  });

  const getEntry = (day: number): DiaryEntry | null => {
    const key = `${viewYear}-${viewMonth}-${day}`;
    return entryByDay[key] || null;
  };

  const isToday = (day: number) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    day === today.getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const recentEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex flex-col pb-[52px]">
        <header className="bg-white border-b border-[#e2d8c8] px-6 py-4 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setSelectedEntry(null)}
              className="p-1 -ml-1 hover:bg-[#f5efe7] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#c4a96e]" strokeWidth={2} />
            </button>
            <h1 className="font-serif text-xl text-[#3d2e1e]">{formatEntryDate(selectedEntry.date)}</h1>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-[#e2d8c8] p-6 shadow-sm">
            <p className="text-[#3d2e1e] leading-relaxed text-base" style={{ fontFamily: 'inherit' }}>
              {selectedEntry.content}
            </p>
          </div>
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 bg-[#faf6ef] border-t border-[#e2d8c8] flex items-center"
          style={{ height: '52px' }}
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
            onClick={() => setSelectedEntry(null)}
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

  return (
    <div className="min-h-screen bg-[#faf6ef] flex flex-col pb-[52px]">
      <header className="bg-white border-b border-[#e2d8c8] px-6 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Flower2 className="w-6 h-6 text-[#c4a96e]" strokeWidth={1.5} />
          <h1 className="font-serif text-2xl text-[#3d2e1e]">Diary</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
          <div className="bg-white rounded-2xl border border-[#e2d8c8] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2d8c8]">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-[#f5efe7] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#a89070]" strokeWidth={2} />
              </button>
              <h2 className="font-serif text-xl text-[#3d2e1e]">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-[#f5efe7] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#a89070]" strokeWidth={2} />
              </button>
            </div>

            <div className="px-3 pt-3 pb-1">
              <div className="grid grid-cols-7 mb-1">
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-[#a89070] tracking-wide py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  const entry = getEntry(day);
                  const today_ = isToday(day);
                  return (
                    <div key={day} className="aspect-square flex flex-col items-center justify-center">
                      <button
                        onClick={() => entry && setSelectedEntry(entry)}
                        disabled={!entry}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors relative"
                        style={{
                          backgroundColor: today_ ? '#c4a96e' : 'transparent',
                          cursor: entry ? 'pointer' : 'default',
                        }}
                      >
                        <span
                          className="text-sm font-medium leading-none"
                          style={{ color: today_ ? '#fff' : '#3d2e1e' }}
                        >
                          {day}
                        </span>
                      </button>
                      <div className="h-1.5 flex items-center justify-center mt-0.5">
                        {entry && !today_ && (
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#c4a96e' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-6">
          <h3 className="font-serif text-lg text-[#3d2e1e] mb-3 px-1">Recent Entries</h3>
          <div className="bg-white rounded-2xl border border-[#e2d8c8] shadow-sm divide-y divide-[#f0e8dc]">
            {recentEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#faf6ef] transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#a89070] mb-1 font-medium tracking-wide">
                    {formatEntryDate(entry.date)}
                  </div>
                  <div className="text-sm text-[#3d2e1e] truncate leading-snug">
                    {entry.summary}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#c4a96e] flex-shrink-0" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-[#faf6ef] border-t border-[#e2d8c8] flex items-center"
        style={{ height: '52px' }}
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
