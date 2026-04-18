import { useState } from 'react';
import { RefreshCw, Gift, Settings2, Ban, CheckCircle, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { UserSession, grantTokens, setTokenLimit, toggleSuspended, setSubscriptionStatus } from '../../lib/adminApi';

interface Props {
  users: UserSession[];
  loading: boolean;
  onRefresh: () => void;
}

export function UsersTab({ users, loading, onRefresh }: Props) {
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [grantAmount, setGrantAmount] = useState('');
  const [limitId, setLimitId] = useState<string | null>(null);
  const [limitAmount, setLimitAmount] = useState('');
  const [actionError, setActionError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = searchQuery.trim()
    ? users.filter((u) => u.email?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : users;

  const handleGrantTokens = async (user: UserSession) => {
    const amount = parseInt(grantAmount);
    if (!amount || amount <= 0) return;
    try {
      await grantTokens(user.id, user.tokens_used, amount);
      setGrantingId(null);
      setGrantAmount('');
      onRefresh();
    } catch {
      setActionError('Failed to grant tokens');
    }
  };

  const handleSetLimit = async (user: UserSession) => {
    const limit = parseInt(limitAmount);
    if (!limit || limit <= 0) return;
    try {
      await setTokenLimit(user.id, limit);
      setLimitId(null);
      setLimitAmount('');
      onRefresh();
    } catch {
      setActionError('Failed to update limit');
    }
  };

  const handleToggleSuspend = async (user: UserSession) => {
    try {
      await toggleSuspended(user.id, user.suspended);
      onRefresh();
    } catch {
      setActionError('Failed to update user status');
    }
  };

  const handleSubscriptionChange = async (user: UserSession, status: 'free' | 'paid') => {
    try {
      await setSubscriptionStatus(user.id, status);
      onRefresh();
    } catch {
      setActionError('Failed to update subscription');
    }
  };

  const formatShortId = (userId: string) => userId.replace('user_', '').substring(0, 10);
  const tokenBalance = (u: UserSession) => Math.max(0, u.max_tokens - u.tokens_used);
  const formatK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#9a8a78]">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}{searchQuery ? ' found' : ' total'}</p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-[#c4a96e] hover:text-[#b39a5e] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a78]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email address..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#e8ded0] rounded-xl focus:outline-none focus:border-[#c4a96e] text-[#2c2c2c] placeholder-[#b8a898] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8a78] hover:text-[#6b6b6b] text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {actionError}
          <button onClick={() => setActionError('')} className="ml-2 underline text-xs">dismiss</button>
        </div>
      )}

      <div className="bg-white border border-[#e8ded0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f5efe7] border-b border-[#e8ded0]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#9a8a78] uppercase tracking-wide">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#9a8a78] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#9a8a78] uppercase tracking-wide">Subscription</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#9a8a78] uppercase tracking-wide">Token Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#9a8a78] uppercase tracking-wide">Limit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#9a8a78] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8d8]">
              {filteredUsers.map((user) => {
                const isPaid = (user.subscription_status || 'free') === 'paid';
                return (
                  <tr key={user.id} className="hover:bg-[#faf6ef] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#6b6b6b]">{formatShortId(user.user_id)}</span>
                      {user.email && (
                        <div className="text-xs text-[#9a8a78] truncate max-w-[160px]">{user.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.suspended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full">
                          <Ban className="w-3 h-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${
                          isPaid
                            ? 'bg-amber-50 border border-amber-200 text-amber-700'
                            : 'bg-[#f5efe7] border border-[#e8ded0] text-[#9a8a78]'
                        }`}>
                          {isPaid ? 'Paid' : 'Free'}
                        </span>
                        {isPaid ? (
                          <button
                            onClick={() => handleSubscriptionChange(user, 'free')}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border border-[#e8ded0] text-[#9a8a78] hover:bg-[#f5efe7] rounded transition-colors"
                            title="Downgrade to free"
                          >
                            <ArrowDownCircle className="w-3 h-3" />
                            Downgrade
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSubscriptionChange(user, 'paid')}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border border-amber-200 text-amber-700 hover:bg-amber-50 rounded transition-colors"
                            title="Upgrade to paid"
                          >
                            <ArrowUpCircle className="w-3 h-3" />
                            Upgrade
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#2c2c2c] font-medium">{formatK(tokenBalance(user))}</span>
                      <span className="text-[#9a8a78] text-xs ml-1">remaining</span>
                    </td>
                    <td className="px-4 py-3 text-[#6b6b6b]">{formatK(user.max_tokens)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {grantingId === user.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={grantAmount}
                              onChange={(e) => setGrantAmount(e.target.value)}
                              placeholder="tokens"
                              className="w-20 px-2 py-1 text-xs bg-[#faf6ef] border border-[#e8ded0] rounded focus:outline-none focus:border-[#c4a96e]"
                            />
                            <button onClick={() => handleGrantTokens(user)} className="text-xs px-2 py-1 bg-[#c4a96e] text-white rounded hover:bg-[#b39a5e] transition-colors">Add</button>
                            <button onClick={() => { setGrantingId(null); setGrantAmount(''); }} className="text-xs px-2 py-1 text-[#9a8a78] hover:bg-[#f5efe7] rounded transition-colors">Cancel</button>
                          </div>
                        ) : limitId === user.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={limitAmount}
                              onChange={(e) => setLimitAmount(e.target.value)}
                              placeholder="limit"
                              className="w-20 px-2 py-1 text-xs bg-[#faf6ef] border border-[#e8ded0] rounded focus:outline-none focus:border-[#c4a96e]"
                            />
                            <button onClick={() => handleSetLimit(user)} className="text-xs px-2 py-1 bg-[#c4a96e] text-white rounded hover:bg-[#b39a5e] transition-colors">Save</button>
                            <button onClick={() => { setLimitId(null); setLimitAmount(''); }} className="text-xs px-2 py-1 text-[#9a8a78] hover:bg-[#f5efe7] rounded transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setGrantingId(user.id); setGrantAmount(''); }}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-[#e8ded0] text-[#c4a96e] hover:bg-[#f5efe7] rounded transition-colors"
                              title="Grant bonus tokens"
                            >
                              <Gift className="w-3 h-3" />
                              Grant
                            </button>
                            <button
                              onClick={() => { setLimitId(user.id); setLimitAmount(user.max_tokens.toString()); }}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-[#e8ded0] text-[#6b6b6b] hover:bg-[#f5efe7] rounded transition-colors"
                              title="Set token limit"
                            >
                              <Settings2 className="w-3 h-3" />
                              Limit
                            </button>
                            <button
                              onClick={() => handleToggleSuspend(user)}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded transition-colors ${
                                user.suspended
                                  ? 'border-green-200 text-green-700 hover:bg-green-50'
                                  : 'border-red-200 text-red-600 hover:bg-red-50'
                              }`}
                              title={user.suspended ? 'Unsuspend' : 'Suspend'}
                            >
                              <Ban className="w-3 h-3" />
                              {user.suspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && !loading && (
          <div className="py-12 text-center text-[#9a8a78] text-sm">
            {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
          </div>
        )}
        {loading && (
          <div className="py-12 text-center text-[#9a8a78] text-sm">Loading...</div>
        )}
      </div>
    </div>
  );
}
