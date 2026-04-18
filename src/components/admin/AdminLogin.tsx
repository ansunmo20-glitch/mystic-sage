import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface Props {
  onLogin: (password: string) => void;
  error: string;
}

export function AdminLogin({ onLogin, error }: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f0e8d8] mb-4">
            <Shield className="w-7 h-7 text-[#c4a96e]" />
          </div>
          <h1 className="text-2xl font-light text-[#2c2c2c] tracking-wide">Admin Panel</h1>
          <p className="text-sm text-[#9a8a78] mt-1">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#e8ded0] rounded-xl shadow-sm p-6 space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 pr-11 bg-[#faf6ef] border border-[#e8ded0] rounded-lg text-[#2c2c2c] text-sm placeholder-[#bbb0a0] focus:outline-none focus:border-[#c4a96e] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb0a0] hover:text-[#9a8a78] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#c4a96e] hover:bg-[#b39a5e] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
