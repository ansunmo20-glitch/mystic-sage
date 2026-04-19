import { X, Heart } from 'lucide-react';

interface CrisisBannerProps {
  onClose: () => void;
}

export function CrisisBanner({ onClose }: CrisisBannerProps) {
  return (
    <div className="crisis-banner bg-gradient-to-r from-[#FFF8EE] to-[#FFF3E0] border-b-2 border-[#E8B86D] px-4 py-3 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-[#C4A96E]/15 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-[#C4A96E]" strokeWidth={2} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[#7A5C2E] font-medium text-sm mb-1">
            If you're in crisis, please reach out:
          </p>
          <div className="space-y-0.5">
            <p className="text-[#8A6C3E] text-sm">
              <span className="mr-1">🇺🇸</span>
              <strong>988 Suicide &amp; Crisis Lifeline:</strong> call or text{' '}
              <a
                href="tel:988"
                className="font-semibold text-[#C4A96E] hover:text-[#B39A5E] underline transition-colors"
              >
                988
              </a>
            </p>
            <p className="text-[#8A6C3E] text-sm">
              <span className="mr-1">🌐</span>
              <strong>Crisis Text Line:</strong> text{' '}
              <span className="font-semibold text-[#C4A96E]">HOME</span> to{' '}
              <span className="font-semibold text-[#C4A96E]">741741</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg text-[#A08050] hover:text-[#7A5C2E] hover:bg-[#C4A96E]/10 transition-colors mt-0.5"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const CRISIS_KEYWORDS = [
  'suicide',
  'self-harm',
  'self harm',
  'kill myself',
  'end my life',
  'want to die',
  'hurt myself',
];

export function detectCrisisKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}
