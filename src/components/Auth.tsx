import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1714] to-[#0f0c0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-amber-950" />
          </div>
          <h1 className="text-4xl font-bold text-amber-200 mb-2 tracking-wide">
            Mystic Sage
          </h1>
          <p className="text-amber-100/60 text-sm">
            Ancient wisdom for modern minds
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-amber-900/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-100 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-amber-950/20 border border-amber-700/30 rounded-lg text-amber-50 placeholder-amber-700/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-100 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-amber-950/20 border border-amber-700/30 rounded-lg text-amber-50 placeholder-amber-700/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-800/40 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Begin Journey' : 'Enter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-amber-700 hover:text-amber-400 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "New here? Begin your journey"}
            </button>
          </div>
        </div>

        <p className="text-center text-amber-800 text-xs mt-8">
          Powered by Eastern philosophy and modern AI
        </p>
      </div>
    </div>
  );
}
