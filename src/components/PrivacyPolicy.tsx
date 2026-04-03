import { ArrowLeft, Flower2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
        <h1 className="font-serif text-4xl text-[#2C2C2C] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#9B9B9B] mb-8">Last updated: April 2026</p>

        <div className="prose prose-stone max-w-none">
          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">1. What We Collect</h2>
            <ul className="list-disc pl-6 text-[#4A4A4A] leading-relaxed space-y-2">
              <li>Email address (used for account login only)</li>
              <li>Conversation data (stored locally on your device, not on our servers)</li>
              <li>Anonymous usage data (session count, token usage — no conversation content)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">2. What We Do Not Collect</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              We do not read, store, or sell your conversation content. Your reflections are yours alone.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-[#4A4A4A] leading-relaxed space-y-2">
              <li>Your email is used solely for account authentication</li>
              <li>Anonymous usage data helps us improve the app experience</li>
              <li>We do not use your data for advertising</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">4. Third-Party Services</h2>
            <p className="text-[#4A4A4A] leading-relaxed mb-3">
              Mystic Sage uses the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-[#4A4A4A] leading-relaxed space-y-2">
              <li>Anthropic Claude API (AI responses)</li>
              <li>Google (authentication)</li>
              <li>Vercel (hosting)</li>
            </ul>
            <p className="text-[#4A4A4A] leading-relaxed mt-3">
              Each service has its own privacy policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">5. Data Retention</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              Conversation data is stored on your device via localStorage. You can delete it at any time from
              Settings → Delete Account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">6. Your Rights</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. Contact us at:{' '}
              <a
                href="mailto:mysticsage.hello@gmail.com"
                className="text-[#C4A96E] hover:text-[#B39A5E] transition-colors"
              >
                mysticsage.hello@gmail.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-[#2C2C2C] mb-3">7. Contact</h2>
            <p className="text-[#4A4A4A] leading-relaxed">
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
