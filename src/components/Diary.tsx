import { useState, useEffect } from 'react';
import { Flower2, Home, BookOpen, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { DiaryDetail } from './DiaryDetail';
import { loadDiaryEntries } from '../lib/diaryStorage';
import { isEntryLocked } from '../lib/config';
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

const IS_PAID_USER = false;

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [showToast, setShowToast] = useState(false);

  const handleUpgrade = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center sm:pb-0">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(61,46,30,0.45)' }}
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-[slideUp_0.22s_ease-out]">
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">🔒</span>
          <p className="font-serif text-xl" style={{ color: '#3d2e1e' }}>
            This memory is locked
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#a89070' }}>
            Entries older than 2 months are available on the paid plan. Upgrade to unlock your full journal history.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleUpgrade}
            className="w-full py-3.5 rounded-2xl text-white font-medium text-sm transition-all"
            style={{ backgroundColor: '#c4a96e' }}
          >
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm transition-colors"
            style={{ color: '#a89070' }}
          >
            Maybe later
          </button>
        </div>
      </div>

      {showToast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-sm font-medium shadow-lg z-[60] pointer-events-none"
          style={{ backgroundColor: '#3d2e1e', color: '#f5efe7' }}
        >
          Coming soon
        </div>
      )}
    </div>
  );
}

export function Diary({ onNavigateHome }: DiaryProps) {
  const { user, isLoaded } = useUser();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    setSelectedEntry(null);
  }, [user?.id]);

  const today = todayStr();
  console.log('[DiaryDebug] loadDiaryEntries userId:', user?.id ?? null);
  const entries = isLoaded && user ? loadDiaryEntries(user.id) : [];

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

  const handleEntryClick = (entry: DiaryEntry) => {
    if (isEntryLocked(entry.date, IS_PAID_USER)) {
      setShowUpgrade(true);
    } else {
      setSelectedEntry(entry);
    }
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
        userId={user?.id || ''}
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
                  const locked = entry ? isEntryLocked(entry.date, IS_PAID_USER) : false;
                  return (
                    <div key={day} className="h-11 flex flex-col items-center justify-start pt-1">
                      <button
                        onClick={() => entry && handleEntryClick(entry)}
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
                            style={{ backgroundColor: locked ? '#c4b99a' : '#c4a96e' }}
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
            {recentEntries.map((entry, idx) => {
              const locked = isEntryLocked(entry.date, IS_PAID_USER);
              return (
                <button
                  key={entry.id}
                  onClick={() => handleEntryClick(entry)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#fdf8f2]"
                  style={{
                    borderTop: idx === 0 ? 'none' : '1px solid #ede4d6',
                  }}
                >
                  <div
                    className="text-xs font-medium shrink-0 w-[70px]"
                    style={{ color: locked ? '#c4b99a' : '#a89070' }}
                  >
                    {formatShortDate(entry.date)}
                  </div>
                  <div
                    className="flex-1 min-w-0 text-sm truncate"
                    style={{ color: locked ? '#c4b99a' : '#3d2e1e' }}
                  >
                    {entry.summary}
                  </div>
                  {locked ? (
                    <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#c4b99a' }} strokeWidth={2} />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#c4a96e' }} strokeWidth={2} />
                  )}
                </button>
              );
            })}
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

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
