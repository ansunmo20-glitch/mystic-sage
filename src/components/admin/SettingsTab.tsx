import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { fetchSettings, saveSetting } from '../../lib/adminApi';

export function SettingsTab() {
  const [welcomeTokens, setWelcomeTokens] = useState('10000');
  const [serviceStatus, setServiceStatus] = useState<'online' | 'offline'>('online');
  const [savedTokens, setSavedTokens] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await fetchSettings();
      if (settings.welcome_tokens) setWelcomeTokens(settings.welcome_tokens);
      if (settings.service_status) setServiceStatus(settings.service_status as 'online' | 'offline');
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTokens = async () => {
    try {
      await saveSetting('welcome_tokens', welcomeTokens);
      setSavedTokens(true);
      setTimeout(() => setSavedTokens(false), 2000);
    } catch {
      setError('Failed to save');
    }
  };

  const handleToggleStatus = async (status: 'online' | 'offline') => {
    try {
      setServiceStatus(status);
      await saveSetting('service_status', status);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
    } catch {
      setError('Failed to save');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-[#9a8a78] text-sm">Loading settings...</div>;
  }

  return (
    <div className="max-w-lg space-y-6">
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#e8ded0] rounded-xl p-5">
        <h3 className="text-sm font-medium text-[#2c2c2c] mb-1">Welcome Token Bonus</h3>
        <p className="text-xs text-[#9a8a78] mb-4">Tokens granted to every new user on first sign-in.</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={welcomeTokens}
            onChange={(e) => setWelcomeTokens(e.target.value)}
            className="w-32 px-3 py-2 bg-[#faf6ef] border border-[#e8ded0] rounded-lg text-sm text-[#2c2c2c] focus:outline-none focus:border-[#c4a96e] transition-colors"
            min={0}
            step={1000}
          />
          <button
            onClick={handleSaveTokens}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c4a96e] hover:bg-[#b39a5e] text-white text-sm rounded-lg transition-colors"
          >
            {savedTokens ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e8ded0] rounded-xl p-5">
        <h3 className="text-sm font-medium text-[#2c2c2c] mb-1">Service Status</h3>
        <p className="text-xs text-[#9a8a78] mb-4">
          When set to <strong>Offline</strong>, users will see a maintenance message instead of the chat.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#f5efe7] rounded-lg p-1 gap-1">
            <button
              onClick={() => handleToggleStatus('online')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors font-medium ${
                serviceStatus === 'online'
                  ? 'bg-white text-[#2c2c2c] shadow-sm border border-[#e8ded0]'
                  : 'text-[#9a8a78] hover:text-[#6b6b6b]'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => handleToggleStatus('offline')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors font-medium ${
                serviceStatus === 'offline'
                  ? 'bg-white text-red-600 shadow-sm border border-red-200'
                  : 'text-[#9a8a78] hover:text-[#6b6b6b]'
              }`}
            >
              Offline
            </button>
          </div>
          {savedStatus && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700">
              <CheckCircle className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>
        {serviceStatus === 'offline' && (
          <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            Service is currently in maintenance mode. Users will see a maintenance message.
          </div>
        )}
      </div>
    </div>
  );
}
