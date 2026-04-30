import { useState } from 'react';
import { Flower2 } from 'lucide-react';

interface BetaConsentProps {
  onAccept: () => void;
}

function CheckboxRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 text-left cursor-pointer group select-none"
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
            checked
              ? 'bg-[#C4A96E] border-[#C4A96E]'
              : 'bg-white border-[#C4A96E]/50 group-hover:border-[#C4A96E]'
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-[#3C3C3C] text-sm leading-relaxed">{children}</span>
    </label>
  );
}

export function BetaConsent({ onAccept }: BetaConsentProps) {
  const [termsChecked, setTermsChecked] = useState(false);
  const [betaChecked, setBetaChecked] = useState(false);

  const canEnter = termsChecked && betaChecked;

  const handleEnter = () => {
    if (canEnter) {
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF6EF] via-[#F5EFE7] to-[#E8DED0] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-warm flex items-center justify-center">
            <Flower2 className="w-10 h-10 text-[#C4A96E]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-[#2C2C2C] tracking-tight">
            Welcome to Mystic Sage Beta
          </h1>
          <p className="text-[#6B6B6B] text-sm">
            Before you begin, please review and accept the following.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 space-y-4 shadow-sm border border-[#E8DED0]">
          <CheckboxRow id="terms-checkbox" checked={termsChecked} onChange={setTermsChecked}>
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A96E] underline hover:text-[#B39A5E] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A96E] underline hover:text-[#B39A5E] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>
            .
          </CheckboxRow>

          <div className="h-px bg-[#E8DED0]" />

          <CheckboxRow id="beta-checkbox" checked={betaChecked} onChange={setBetaChecked}>
            I understand this is a beta service and features may change.
          </CheckboxRow>
        </div>

        <button
          onClick={handleEnter}
          disabled={!canEnter}
          className={`w-full py-4 text-lg font-medium rounded-full transition-all shadow-warm ${
            canEnter
              ? 'bg-[#C4A96E] text-white hover:bg-[#B39A5E] hover:shadow-warm-lg cursor-pointer'
              : 'bg-[#E8DED0] text-[#A89880] cursor-not-allowed'
          }`}
        >
          Enter
        </button>

        <p className="text-xs text-[#9B9B9B]">
          Your consent will be saved and will not be shown again.
        </p>
      </div>
    </div>
  );
}
