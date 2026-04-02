import { Sparkles } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Mystic Sage</h1>
          <p className="text-slate-400 text-lg">
            A quiet space to think out loud
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-2xl",
              }
            }}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Free users: 1 session per week
          </p>
        </div>

        <p className="text-slate-500 text-sm text-center mt-6">
          By signing in, you agree to our terms and privacy policy
        </p>
      </div>
    </div>
  );
}
