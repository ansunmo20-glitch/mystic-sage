import { useState, useEffect } from 'react';
import { Shield, RefreshCw, Gift, Ban, CheckCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface UserSession {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  tokens_used: number;
  max_tokens: number;
  suspended: boolean;
  subscription_status: string;
}

export function Admin() {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editMaxTokens, setEditMaxTokens] = useState('');

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const isAdmin = user?.primaryEmailAddress?.emailAddress === adminEmail;

  useEffect(() => {
    if (isLoaded && isAdmin) {
      loadUsers();
    }
  }, [isLoaded, isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id, user_id, email, created_at, tokens_used, max_tokens, suspended, subscription_status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateMaxTokens = async (userId: string, newMaxTokens: number) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ max_tokens: newMaxTokens })
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
      setEditingUserId(null);
      setEditMaxTokens('');
    } catch (err) {
      console.error('Error updating max tokens:', err);
      setError('Failed to update max tokens');
    }
  };

  const toggleSuspended = async (userId: string, currentSuspended: boolean) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ suspended: !currentSuspended })
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (err) {
      console.error('Error toggling suspended:', err);
      setError('Failed to toggle suspension');
    }
  };

  const grantBonusTokens = async (userId: string, bonusAmount: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newTokensUsed = Math.max(0, user.tokens_used - bonusAmount);

      const { error } = await supabase
        .from('user_sessions')
        .update({ tokens_used: newTokensUsed })
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (err) {
      console.error('Error granting bonus tokens:', err);
      setError('Failed to grant bonus tokens');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAnonymousId = (userId: string) => {
    return userId.substring(0, 8);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="text-[#6B6B6B]">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center px-6">
        <div className="bg-white rounded-lg shadow-warm border border-[#E8DED0] p-8 w-full max-w-md text-center">
          <Shield className="w-12 h-12 text-[#C97C5D] mx-auto mb-4" />
          <h1 className="text-2xl font-light text-[#2C2C2C] mb-2">Access Denied</h1>
          <p className="text-[#6B6B6B]">
            You do not have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#C4A96E]" />
            <h1 className="text-2xl font-light text-[#2C2C2C]">Admin Panel</h1>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#C4A96E] hover:bg-[#F5EFE7] rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-warm border border-[#E8DED0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5EFE7] border-b border-[#E8DED0]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">User ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">Tokens</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">Max Tokens</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">Subscription</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#2C2C2C]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED0]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAF6EF] transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-[#6B6B6B]">
                      {getAnonymousId(user.user_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2C2C2C]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2C2C2C]">
                      {(user.tokens_used / 1000).toFixed(1)}k
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editMaxTokens}
                            onChange={(e) => setEditMaxTokens(e.target.value)}
                            className="w-24 px-2 py-1 text-sm bg-[#FAF6EF] border border-[#E8DED0] rounded"
                            placeholder={user.max_tokens.toString()}
                          />
                          <button
                            onClick={() => updateMaxTokens(user.id, parseInt(editMaxTokens))}
                            className="text-xs px-2 py-1 bg-[#C4A96E] text-white rounded hover:bg-[#B39A5E]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null);
                              setEditMaxTokens('');
                            }}
                            className="text-xs px-2 py-1 text-[#6B6B6B] hover:bg-[#F5EFE7] rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setEditMaxTokens(user.max_tokens.toString());
                          }}
                          className="text-[#C4A96E] hover:text-[#B39A5E]"
                        >
                          {(user.max_tokens / 1000).toFixed(0)}k
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.suspended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          <Ban className="w-3 h-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B] capitalize">
                      {user.subscription_status}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSuspended(user.id, user.suspended)}
                          className={`p-1 rounded hover:bg-[#F5EFE7] transition-colors ${
                            user.suspended ? 'text-green-600' : 'text-red-600'
                          }`}
                          title={user.suspended ? 'Unsuspend user' : 'Suspend user'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const bonus = prompt('Enter bonus tokens to grant (will reduce tokens_used):');
                            if (bonus) grantBonusTokens(user.id, parseInt(bonus));
                          }}
                          className="p-1 rounded hover:bg-[#F5EFE7] text-[#C4A96E] transition-colors"
                          title="Grant bonus tokens"
                        >
                          <Gift className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-12 text-[#6B6B6B]">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
