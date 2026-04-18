import { useState, useEffect } from 'react';
import { Send, X, Megaphone } from 'lucide-react';
import { Announcement, fetchAnnouncements, createAnnouncement, deactivateAnnouncement } from '../../lib/adminApi';

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await createAnnouncement(message.trim());
      setMessage('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      await load();
    } catch {
      setError('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateAnnouncement(id);
      await load();
    } catch {
      setError('Failed to deactivate');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline text-xs">dismiss</button>
        </div>
      )}

      <div className="bg-white border border-[#e8ded0] rounded-xl p-5">
        <h3 className="text-sm font-medium text-[#2c2c2c] mb-1">New Broadcast</h3>
        <p className="text-xs text-[#9a8a78] mb-4">This message will be shown as a banner to all users on their next visit.</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write your announcement here..."
          className="w-full px-3 py-2.5 bg-[#faf6ef] border border-[#e8ded0] rounded-lg text-sm text-[#2c2c2c] placeholder-[#bbb0a0] focus:outline-none focus:border-[#c4a96e] transition-colors resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[#9a8a78]">{message.length} characters</span>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c4a96e] hover:bg-[#b39a5e] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending...' : sent ? 'Sent!' : 'Send to all users'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[#2c2c2c] mb-3">Recent Announcements</h3>
        {loading ? (
          <div className="py-8 text-center text-[#9a8a78] text-sm">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="py-8 text-center text-[#9a8a78] text-sm bg-white border border-[#e8ded0] rounded-xl">
            No announcements yet
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  a.active
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-[#e8ded0]'
                }`}
              >
                <Megaphone className={`w-4 h-4 mt-0.5 flex-shrink-0 ${a.active ? 'text-amber-600' : 'text-[#bbb0a0]'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${a.active ? 'text-[#2c2c2c]' : 'text-[#9a8a78]'}`}>{a.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#9a8a78]">{formatDate(a.created_at)}</span>
                    {a.active && (
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                        Live
                      </span>
                    )}
                  </div>
                </div>
                {a.active && (
                  <button
                    onClick={() => handleDeactivate(a.id)}
                    className="flex-shrink-0 text-[#9a8a78] hover:text-[#6b6b6b] transition-colors"
                    title="Deactivate"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
