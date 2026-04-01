import { Flower2 } from 'lucide-react';

interface WelcomeProps {
  onBegin: () => void;
}

export function Welcome({ onBegin }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF6EF] via-[#F5EFE7] to-[#E8DED0] flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-warm flex items-center justify-center">
            <Flower2 className="w-10 h-10 text-[#C4A96E]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-5xl text-[#2C2C2C] tracking-tight">
            Mystic Sage
          </h1>
          <p className="text-[#6B6B6B] text-lg">
            Ancient wisdom for modern struggles
          </p>
        </div>

        <div className="py-6">
          <p className="text-2xl text-[#C4A96E] font-light italic">
            "Just talk. I'm listening."
          </p>
        </div>

        <button
          onClick={onBegin}
          className="mt-8 px-12 py-4 bg-[#C4A96E] text-white text-lg font-medium rounded-full hover:bg-[#B39A5E] transition-all shadow-warm hover:shadow-warm-lg"
        >
          Begin
        </button>

        <p className="text-sm text-[#9B9B9B] pt-8">
          A space for reflection and gentle guidance
        </p>
      </div>
    </div>
  );
}
