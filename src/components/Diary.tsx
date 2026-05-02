import { useState, useEffect } from 'react';
import { Flower2, Home, BookOpen, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { DiaryDetail } from './DiaryDetail';
import { loadDiaryEntries, migrateLegacyDiaryEntries } from '../lib/diaryStorage';
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

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '';
  }
}

interface DiaryProps {
  onNavigateHome: () => void;
}

const IS_PAID_USER = false;

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [showToast, setShowToast] = useState(false);

  const handleUpgrade = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
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

function DayCarousel({
  entries,
  date,
  onSelect,
  onClose,
}: {
  entries: DiaryEntry[];
  date: string;
  onSelect: (e: DiaryEntry) => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const STACK_OFFSET = 44;
  const CARD_MIN_HEIGHT = 132;
  const stackHeight = CARD_MIN_HEIGHT + STACK_OFFSET * (entries.length - 1);

  const getPreview = (entry: DiaryEntry): string => {
    const chat = entry.originalChat as { role: string; content: string }[] | null;
    const msg = Array.isArray(chat)
      ? (chat.find(m => m.role === 'user')?.content ?? entry.summary)
      : entry.summary;
    return msg.length > 20 ? msg.slice(0, 20) + '…' : msg;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(61,46,30,0.48)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full"
        style={{
          backgroundColor: '#faf6ef',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -6px 32px rgba(61,46,30,0.14)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3
            style={{
              color: '#3d2e1e',
              fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {formatShortDate(date)}
          </h3>
          <span style={{ color: '#a89070', fontSize: '0.8rem' }}>
            {entries.length} entries
          </span>
        </div>

        {/* Stacked cards: each back card exposes a tappable 44px top band. */}
        <div className="px-5 pb-2">
          <div className="relative" style={{ height: stackHeight }}>
            {entries.map((entry, i) => {
              const isActive = i === idx;
              const distance = (i - idx + entries.length) % entries.length;
              const top = isActive ? STACK_OFFSET * (entries.length - 1) : STACK_OFFSET * (distance - 1);
              return (
                <button
                  key={entry.sessionId}
                  type="button"
                  className="absolute left-0 right-0 rounded-2xl p-4 text-left transition-all duration-300"
                  style={{
                    top,
                    zIndex: isActive ? entries.length + 1 : entries.length - distance,
                    backgroundColor: '#fff',
                    border: isActive ? '1.5px solid #c4a96e' : '1px solid #e2d8c8',
                    boxShadow: isActive ? '0 2px 12px rgba(196,169,110,0.15)' : '0 1px 4px rgba(61,46,30,0.06)',
                    minHeight: CARD_MIN_HEIGHT,
                    opacity: isActive ? 1 : 0.88,
                    cursor: 'pointer',
                  }}
                  onClick={() => (isActive ? onSelect(entry) : setIdx(i))}
                >
                    <p style={{ fontSize: '0.7rem', color: '#a89070', marginBottom: 8 }}>
                      {formatTime(entry.createdAt)}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#3d2e1e', lineHeight: 1.5 }}>
                      {getPreview(entry)}
                    </p>
                    {isActive && (
                      <p style={{ fontSize: '0.68rem', color: '#c4a96e', marginTop: 12, textAlign: 'right' }}>
                        tap to open →
                      </p>
                    )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation row: prev · dots · next */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="p-1.5 rounded-full transition-opacity"
            style={{ opacity: idx === 0 ? 0.3 : 1, color: '#c4a96e' }}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          <div className="flex gap-1.5 items-center">
            {entries.map((_, i) => (
              <span
                key={i}
                onClick={() => setIdx(i)}
                className="block rounded-full cursor-pointer"
                style={{
                  width: i === idx ? 16 : 5,
                  height: 5,
                  backgroundColor: i === idx ? '#c4a96e' : '#d4c4a0',
                  transition: 'width 0.3s ease-out, background-color 0.3s',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setIdx(i => Math.min(entries.length - 1, i + 1))}
            disabled={idx === entries.length - 1}
            className="p-1.5 rounded-full transition-opacity"
            style={{ opacity: idx === entries.length - 1 ? 0.3 : 1, color: '#c4a96e' }}
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }} />
      </div>
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
  const [carouselDate, setCarouselDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    let cancelled = false;
    (async () => {
      await migrateLegacyDiaryEntries(user.id);
      const loaded = await loadDiaryEntries(user.id);
      if (!cancelled) setEntries(loaded);
    })();
    return () => { cancelled = true; };
  }, [isLoaded, user?.id]);

  useEffect(() => {
    setSelectedEntry(null);
    setCarouselDate(null);
  }, [user?.id]);

  const today = todayStr();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Group entries by date, sorted by createdAt within each day
  const entriesByDate: Record<string, DiaryEntry[]> = {};
  entries.forEach(e => {
    if (!entriesByDate[e.date]) entriesByDate[e.date] = [];
    entriesByDate[e.date].push(e);
  });
  Object.values(entriesByDate).forEach(arr =>
    arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

  const padded = (n: number) => String(n).padStart(2, '0');

  const getDateEntries = (day: number): DiaryEntry[] => {
    const key = `${viewYear}-${padded(viewMonth + 1)}-${padded(day)}`;
    return entriesByDate[key] || [];
  };

  const isTodayCell = (day: number): boolean => {
    const key = `${viewYear}-${padded(viewMonth + 1)}-${padded(day)}`;
    return key === today;
  };

  const handleDayClick = (dayEntries: DiaryEntry[]) => {
    if (dayEntries.length === 0) return;
    if (isEntryLocked(dayEntries[0].date, IS_PAID_USER)) {
      setShowUpgrade(true);
      return;
    }
    if (dayEntries.length === 1) {
      setCarouselDate(null);
      setSelectedEntry(dayEntries[0]);
    } else {
      setCarouselDate(dayEntries[0].date);
    }
  };

  const handleDiaryDetailBack = () => {
    setSelectedEntry(null);
    // Reload entries to reflect any edits/deletes, then carousel reappears if it was open
    if (user) loadDiaryEntries(user.id).then(setEntries);
  };

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const recentEntries = [...entries].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.createdAt.localeCompare(a.createdAt);
  });

  const carouselEntries = carouselDate ? (entriesByDate[carouselDate] ?? []) : null;

  if (selectedEntry) {
    return (
      <DiaryDetail
        entry={selectedEntry}
        onBack={handleDiaryDetailBack}
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
        {/* Calendar */}
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
                    return <div key={`e-${i}`} className="h-[52px]" />;
                  }
                  const dayEntries = getDateEntries(day);
                  const count = dayEntries.length;
                  const isToday = isTodayCell(day);
                  const locked = count > 0 ? isEntryLocked(dayEntries[0].date, IS_PAID_USER) : false;
                  const dotColor = isToday ? '#fff8ee' : locked ? '#c4b99a' : '#c4a96e';

                  return (
                    <div key={day} className="h-[52px] flex flex-col items-center justify-start pt-1">
                      <button
                        onClick={() => handleDayClick(dayEntries)}
                        disabled={count === 0 && !isToday}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                        style={{
                          backgroundColor: isToday ? '#c4a96e' : 'transparent',
                          cursor: count > 0 ? 'pointer' : 'default',
                        }}
                      >
                        <span
                          className="text-[13px] font-medium leading-none"
                          style={{ color: isToday ? '#fff' : '#3d2e1e' }}
                        >
                          {day}
                        </span>
                      </button>

                      {/* Badge area — fixed height so grid rows stay even */}
                      <div className="h-[14px] flex items-center justify-center mt-0.5">
                        {count === 1 && (
                          <span
                            className="block w-[5px] h-[5px] rounded-full"
                            style={{ backgroundColor: dotColor }}
                          />
                        )}
                        {count === 2 && (
                          <span className="flex gap-[3px]">
                            <span className="block w-[5px] h-[5px] rounded-full" style={{ backgroundColor: dotColor }} />
                            <span className="block w-[5px] h-[5px] rounded-full" style={{ backgroundColor: dotColor }} />
                          </span>
                        )}
                        {count >= 3 && (
                          <span
                            className="flex items-center justify-center rounded-full text-white font-bold leading-none"
                            style={{
                              width: 16,
                              height: 16,
                              fontSize: 9,
                              backgroundColor: locked ? '#c4b99a' : '#c4a96e',
                            }}
                          >
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
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
              const time = formatTime(entry.createdAt);
              return (
                <button
                  key={entry.sessionId}
                  onClick={() => {
                    if (locked) { setShowUpgrade(true); return; }
                    setCarouselDate(null);
                    setSelectedEntry(entry);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#fdf8f2]"
                  style={{ borderTop: idx === 0 ? 'none' : '1px solid #ede4d6' }}
                >
                  <div className="shrink-0 w-[76px]">
                    <p className="text-xs font-medium" style={{ color: locked ? '#c4b99a' : '#a89070' }}>
                      {formatShortDate(entry.date)}
                    </p>
                    {time && (
                      <p className="text-[10px] mt-0.5" style={{ color: locked ? '#d4c4a0' : '#b8a080' }}>
                        {time}
                      </p>
                    )}
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

      {/* Carousel — only shown when 2+ entries exist for the selected date */}
      {!selectedEntry && carouselEntries && carouselEntries.length >= 2 && (
        <DayCarousel
          entries={carouselEntries}
          date={carouselDate!}
          onSelect={entry => setSelectedEntry(entry)}
          onClose={() => setCarouselDate(null)}
        />
      )}
    </div>
  );
}
