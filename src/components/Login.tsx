import type { ReactNode } from 'react';
import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Circle, Leaf, Sparkles } from 'lucide-react';

const values = [
  {
    icon: Circle,
    title: 'Depth over advice',
    body: 'Not tips. Real conversation that goes somewhere.',
  },
  {
    icon: Leaf,
    title: 'Grounded in 2,500 years',
    body: 'Buddhist and Taoist wisdom, translated into the language of your actual life.',
  },
  {
    icon: Sparkles,
    title: 'Wisdom, not religion',
    body: "No rituals. No dogma. Just insight that fits the life you're actually living.",
  },
];

const conversation = [
  {
    user: "Things with my partner are fine. I mean, we're not fighting or anything. I don't know why I even feel off.",
    sage:
      "Fine is an interesting word to settle on. It holds a lot of space between good and not good. When did you last feel like you weren't just going through the motions with him?",
  },
  {
    user: "Maybe a year ago? We used to actually talk. Now it's schedules, groceries, TV. I brought it up once and he said everything seemed fine to him. That made it worse somehow.",
    sage:
      "He sees the surface and it looks smooth. You're feeling the current underneath. Those aren't contradictions - they're two people standing in different parts of the same river. What is it you actually want to say to him that you haven't?",
  },
  {
    user: "I don't even know. That I miss him, maybe? Even though he's right there.",
    sage:
      "Missing someone who is present - that's one of the quieter forms of loneliness. And it's hard to name, because there's nothing obviously wrong to point to. Is this the first time you've put that into words?",
  },
  {
    user: 'Yeah. I think it is.',
    sage:
      "Then this is where it starts - not fixing anything, just seeing it clearly. That's usually the harder part.",
  },
];

const comparisonRows = [
  ['Asks deeper follow-up questions', 'x', 'x', 'check'],
  ['Eastern philosophical frame', 'x', 'Partial', 'check'],
  ['Designed for emotional depth', 'x', 'x', 'check'],
  ['Free to try', 'check', 'x', 'check'],
];

const steps = [
  'Sign in with Google - takes 10 seconds',
  "Talk about what's on your mind",
  'Receive a response that goes deeper, not just wider',
];

function CtaLink({
  children,
  filled = false,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  filled?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center border px-6 py-3 text-base font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#c4a96e] focus:ring-offset-2 focus:ring-offset-[#faf6ef] disabled:cursor-not-allowed disabled:opacity-60 ${
        filled
          ? 'border-[#c4a96e] bg-[#c4a96e] text-[#2c2a26] hover:bg-[#b89b5e]'
          : 'border-[#c4a96e] bg-transparent text-[#2c2a26] hover:bg-[#c4a96e]/10'
      }`}
    >
      {children}
    </button>
  );
}

function ResultMark({ value }: { value: string }) {
  if (value === 'check') {
    return <span aria-label="Yes">✓</span>;
  }

  if (value === 'x') {
    return <span aria-label="No">✗</span>;
  }

  return <span>{value}</span>;
}

function ComparisonValue({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 text-base ${
        highlighted
          ? 'border border-[#c4a96e] bg-[#c4a96e]/15 text-[#2c2a26]'
          : 'border border-[rgba(196,169,110,0.2)] text-[#8a8680]'
      }`}
    >
      <span className="font-light">{label}</span>
      <span className={highlighted ? 'font-normal text-[#2c2a26]' : 'font-light text-[#2c2a26]'}>
        <ResultMark value={value} />
      </span>
    </div>
  );
}

type LoginProps = {
  onNavigateTerms?: () => void;
  onNavigatePrivacy?: () => void;
};

export default function Login({ onNavigateTerms, onNavigatePrivacy }: LoginProps) {
  const { isLoaded, signIn } = useSignIn();
  const [showLogin, setShowLogin] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      console.error('Failed to start Google sign-in:', error);
    }
  };

  if (showLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf6ef] px-5 py-16 font-sans text-[#2c2a26] sm:px-8">
        <div className="w-full max-w-md text-center">
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            className="mb-10 text-sm font-light text-[#8a8680] underline decoration-[#c4a96e] underline-offset-4 hover:text-[#2c2a26]"
          >
            Back to Mystic Sage
          </button>

          <div className="mb-8">
            <div className="mb-4 font-serif text-5xl font-light text-[#2c2a26]">Mystic Sage</div>
            <p className="text-base font-light leading-7 text-[#8a8680]">
              Sign in to begin your first session.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!isLoaded}
            className="flex min-h-12 w-full items-center justify-center border border-[#c4a96e] bg-[#c4a96e] px-6 py-3 text-base font-normal text-[#2c2a26] transition-colors hover:bg-[#b89b5e] focus:outline-none focus:ring-2 focus:ring-[#c4a96e] focus:ring-offset-2 focus:ring-offset-[#faf6ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in with Google
          </button>

          <p className="mt-5 text-sm font-light leading-6 text-[#8a8680]">
            No credit card. Free during beta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6ef] font-sans text-[#2c2a26]">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[rgba(196,169,110,0.2)] bg-[rgba(250,246,239,0.92)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#hero" className="font-serif text-2xl font-normal text-[#2c2a26]">
            Mystic Sage
          </a>
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="text-sm font-normal text-[#2c2a26] underline decoration-[#c4a96e] decoration-1 underline-offset-4"
          >
            Try Free &rarr;
          </button>
        </div>
      </nav>

      <main>
        <section
          id="hero"
          className="flex min-h-screen items-center border-b border-[rgba(196,169,110,0.2)] px-5 pt-16 sm:px-8"
        >
          <div className="mx-auto w-full max-w-6xl py-20">
            <div className="max-w-3xl">
              <h1 className="font-serif text-[52px] font-light leading-[0.95] text-[#2c2a26] sm:text-7xl lg:text-8xl">
                Just talk. I&apos;m listening.
              </h1>
              <p className="mt-7 max-w-2xl text-xl font-light leading-8 text-[#8a8680] sm:text-2xl sm:leading-9">
                Ancient Eastern wisdom, reframed for the way you live now.
              </p>
              <div className="mt-10">
                <CtaLink onClick={() => setShowLogin(true)}>
                  Try Mystic Sage Free &rarr;
                </CtaLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[rgba(196,169,110,0.2)] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <article key={title} className="border-t border-[rgba(196,169,110,0.2)] pt-8">
                <Icon className="mb-6 h-7 w-7 text-[#c4a96e]" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="font-serif text-3xl font-normal text-[#2c2a26]">{title}</h2>
                <p className="mt-4 text-base font-light leading-7 text-[#8a8680]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-b border-[rgba(196,169,110,0.2)] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="font-serif text-4xl font-light text-[#2c2a26] sm:text-5xl">
                A conversation with Mystic Sage
              </h2>
              <p className="mt-4 text-lg font-light text-[#8a8680]">See how it actually works.</p>
            </div>

            <div className="mt-12 space-y-6">
              {conversation.map((turn, index) => (
                <div key={index} className="space-y-5">
                  <div className="ml-auto max-w-[88%] bg-[#2c2a26] px-5 py-4 text-base font-light leading-7 text-white sm:max-w-[72%]">
                    {turn.user}
                  </div>
                  <div className="max-w-[88%] sm:max-w-[72%]">
                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[#c4a96e]">Sage</div>
                    <div className="bg-[#f0ebe0] px-5 py-4 text-base font-light leading-7 text-[#2c2a26]">
                      {turn.sage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[rgba(196,169,110,0.2)] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-4xl font-light text-[#2c2a26] sm:text-5xl">
              What makes Mystic Sage different
            </h2>

            <div className="mt-10 space-y-5 sm:hidden">
              {comparisonRows.map(([feature, chatGpt, wellnessApps, mysticSage]) => (
                <article key={feature} className="border-t border-[rgba(196,169,110,0.2)] pt-5">
                  <h3 className="mb-4 font-serif text-2xl font-normal leading-8 text-[#2c2a26]">{feature}</h3>
                  <div className="space-y-2">
                    <ComparisonValue label="ChatGPT" value={chatGpt} />
                    <ComparisonValue label="Wellness Apps" value={wellnessApps} />
                    <ComparisonValue label="Mystic Sage" value={mysticSage} highlighted />
                  </div>
                </article>
              ))}
            </div>

            <div className="relative mt-12 hidden overflow-x-auto border border-[rgba(196,169,110,0.2)] sm:block">
              <table className="w-full min-w-[680px] border-collapse text-left text-base">
                <thead>
                  <tr className="border-b border-[rgba(196,169,110,0.2)]">
                    {['feature', 'ChatGPT', 'Wellness Apps', 'Mystic Sage'].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-5 font-sans text-sm font-normal uppercase tracking-[0.18em] text-[#8a8680] ${
                          heading === 'Mystic Sage' ? 'bg-[#c4a96e] text-[#2c2a26]' : ''
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row[0]} className="border-b border-[rgba(196,169,110,0.2)] last:border-b-0">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${row[0]}-${cellIndex}`}
                          className={`px-5 py-5 font-light text-[#2c2a26] ${
                            cellIndex === 3 ? 'border-l border-[#c4a96e] bg-[#c4a96e]/10 font-normal' : ''
                          }`}
                        >
                          {cellIndex === 0 ? cell : <ResultMark value={cell} />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-b border-[rgba(196,169,110,0.2)] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-4xl font-light text-[#2c2a26] sm:text-5xl">
              How it works
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="border-t border-[rgba(196,169,110,0.2)] pt-7">
                  <div className="mb-5 font-serif text-4xl font-light text-[#c4a96e]">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <p className="text-lg font-light leading-8 text-[#2c2a26]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f0ebe0] px-5 py-20 text-center sm:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-serif text-5xl font-light leading-tight text-[#2c2a26] sm:text-7xl">
              Free during beta.
            </h2>
            <p className="mt-5 text-xl font-light text-[#8a8680]">No credit card. No commitment.</p>
            <div className="mt-9">
              <CtaLink filled onClick={() => setShowLogin(true)}>
                Start Your First Session &rarr;
              </CtaLink>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-sm font-light leading-6 text-[#8a8680]">
              Currently in open beta - your feedback shapes what Mystic Sage becomes.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(196,169,110,0.2)] bg-[#faf6ef] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm font-light text-[#8a8680] md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-serif text-2xl font-normal text-[#2c2a26]">Mystic Sage</div>
            <div className="mt-2">© 2025</div>
            <a className="mt-2 inline-block hover:text-[#2c2a26]" href="mailto:mysticsage.hello@gmail.com">
              mysticsage.hello@gmail.com
            </a>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <a
              className="hover:text-[#2c2a26]"
              href="/terms"
              onClick={(event) => {
                if (!onNavigateTerms) return;
                event.preventDefault();
                onNavigateTerms();
              }}
            >
              Terms of Service
            </a>
            <span aria-hidden="true">|</span>
            <a
              className="hover:text-[#2c2a26]"
              href="/privacy"
              onClick={(event) => {
                if (!onNavigatePrivacy) return;
                event.preventDefault();
                onNavigatePrivacy();
              }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
