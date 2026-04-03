import { ArrowLeft, Flower2 } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      <header className="bg-white border-b border-[#E8DED0] px-6 py-4 shadow-sm sticky top-0">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#C4A96E] hover:text-[#B39A5E] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-[#C4A96E]" strokeWidth={1.5} />
            <span className="font-serif text-lg text-[#2C2C2C]">Mystic Sage</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-[#2C2C2C] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#9B9B9B] mb-8">Last updated: April 2026</p>

        <div className="prose prose-stone max-w-none">
          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">1. About Mystic Sage</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              Mystic Sage is an AI-powered reflection and conversation tool inspired by Eastern philosophy.
              It is designed to help you think through everyday concerns in a calm, thoughtful space.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">2. Not a Substitute for Professional Help</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              Mystic Sage is not a licensed therapist, counselor, or mental health provider. The conversations
              you have with Sage are not medical or psychological advice. If you are experiencing a mental health
              crisis, please contact a qualified professional or emergency services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">3. Your Conversations</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              Your conversations are stored locally on your device. Mystic Sage does not store or sell your
              personal conversations. You are responsible for the content you share in the app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">4. Acceptable Use</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              You agree not to use Mystic Sage to generate harmful, illegal, or abusive content. We reserve
              the right to suspend access if these terms are violated.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">5. Changes to These Terms</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              We may update these terms from time to time. Continued use of the app means you accept the
              updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">6. Contact</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              If you have questions, reach out at:{' '}
              <a
                href="mailto:mysticsage.hello@gmail.com"
                className="text-[#C4A96E] hover:text-[#B39A5E] transition-colors"
              >
                mysticsage.hello@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
