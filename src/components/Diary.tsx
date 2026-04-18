import { useState } from 'react';
import { Flower2, Home, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { DiaryDetail } from './DiaryDetail';
import { SAMPLE_DIARY_ENTRIES } from '../lib/diaryData';
import type { DiaryEntry } from '../lib/diaryTypes';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS[month - 1].slice(0, 3)} ${day}, ${year}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DiaryProps {
  onNavigateHome: () => void;
}

export function Diary({ onNavigateHome }: DiaryProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const today = todayStr();
  const entries = SAMPLE_DIARY_ENTRIES;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const entryByDate: Record<string, DiaryEntry> = {};
  entries.forEach(e => { entryByDate[e.date] = e; });

  const padded = (n: number) => String(n).padStart(2, '0');
  const getEntry = (day: number): DiaryEntry | null => {
    const key = `${viewYear}-${padded(viewMonth + 1)}-${padded(day)}`;
    return entryByDate[key] || null;
  };

  const isTodayCell = (day: number): boolean => {
    const key = `${viewYear}-${padded(viewMonth + 1)}-${padded(day)}`;
    return key === today;
  };

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const recentEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  if (selectedEntry) {
    return (
      <DiaryDetail
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-[52px]" style={{ backgroundColor: '#faf6ef' }}>
      <header className="bg-white border-b px-4 py-4 shadow-sm" style={{ borderColor: '#e2d8c8' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Flower2 className="w-5 h-5" style={{ color: '#c4a96e' }} strokeWidth={1.5} />
          <h1 className="font-serif text-2xl" style={{ color: '#3d2e1e' }}>Diary</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-3">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#e2d8c8' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#e2d8c8' }}>
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#f5efe7]"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: '#a89070' }} strokeWidth={2} />
              </button>
              <h2
                className="text-xl tracking-wide"
                style={{ color: '#3d2e1e', fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif', fontWeight: 600 }}
              >
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#f5efe7]"
              >
                <ChevronRight className="w-5 h-5" style={{ color: '#a89070' }} strokeWidth={2} />
              </button>
            </div>

            <div className="px-2 pt-3 pb-2">
              <div className="grid grid-cols-7 mb-0.5">
                {DOW.map((d, i) => (
                  <div
                    key={`${d}-${i}`}
                    className="text-center py-1.5 text-[11px] font-semibold tracking-widest"
                    style={{ color: '#b8a080' }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  if (day === null) {
                    return <div key={`e-${i}`} className="h-11" />;
                  }
                  const entry = getEntry(day);
                  const isToday = isTodayCell(day);
                  return (
                    <div key={day} className="h-11 flex flex-col items-center justify-start pt-1">
                      <button
                        onClick={() => entry && setSelectedEntry(entry)}
                        disabled={!entry && !isToday}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                        style={{
                          backgroundColor: isToday ? '#c4a96e' : 'transparent',
                          cursor: entry ? 'pointer' : 'default',
                        }}
                      >
                        <span
                          className="text-[13px] font-medium leading-none"
                          style={{ color: isToday ? '#fff' : '#3d2e1e' }}
                        >
                          {day}
                        </span>
                      </button>
                      <div className="h-1.5 flex items-center justify-center mt-0.5">
                        {entry && !isToday && (
                          <span
                            className="block w-[5px] h-[5px] rounded-full"
                            style={{ backgroundColor: '#c4a96e' }}
                          />
                        )}
                        {entry && isToday && (
                          <span
                            className="block w-[5px] h-[5px] rounded-full"
                            style={{ backgroundColor: '#fff8ee' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-8">
          <h3
            className="font-serif text-lg mb-2 px-1"
            style={{ color: '#3d2e1e' }}
          >
            Recent Entries
          </h3>
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#e2d8c8' }}>
            {recentEntries.map((entry, idx) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#fdf8f2]"
                style={{
                  borderTop: idx === 0 ? 'none' : '1px solid #ede4d6',
                }}
              >
                <div
                  className="text-xs font-medium shrink-0 w-[70px]"
                  style={{ color: '#a89070' }}
                >
                  {formatShortDate(entry.date)}
                </div>
                <div
                  className="flex-1 min-w-0 text-sm truncate"
                  style={{ color: '#3d2e1e' }}
                >
                  {entry.summary}
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#c4a96e' }} strokeWidth={2} />
              </button>
            ))}
          </div>
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
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
          style={{ color: '#c4a96e' }}
        >
          <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-medium tracking-wide">Diary</span>
        </button>
      </nav>
    </div>
  );
}
