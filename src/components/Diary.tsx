import { Flower2, Home, BookOpen } from 'lucide-react';

interface DiaryProps {
  onNavigateHome: () => void;
}

export function Diary({ onNavigateHome }: DiaryProps) {
  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col pb-[52px]">
      <header className="bg-white border-b border-[#E8DED0] px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Flower2 className="w-6 h-6 text-[#C4A96E]" strokeWidth={1.5} />
          <h1 className="font-serif text-2xl text-[#2C2C2C]">Mystic Sage</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm border border-[#E8DED0]">
            <BookOpen className="w-9 h-9 text-[#C4A96E]" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-3xl text-[#2C2C2C]">Your Diary</h2>
            <p className="text-[#9B9B9B] text-base leading-relaxed">
              A space for personal reflection is coming soon.
            </p>
            <p className="text-[#C4A96E] text-sm italic font-light">
              "The unexamined life is not worth living."
            </p>
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
