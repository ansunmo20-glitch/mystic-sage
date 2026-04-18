import { useState, useEffect } from 'react';
import { Shield, Users, Settings, Megaphone, LogOut } from 'lucide-react';
import { AdminLogin } from './admin/AdminLogin';
import { UsersTab } from './admin/UsersTab';
import { SettingsTab } from './admin/SettingsTab';
import { AnnouncementsTab } from './admin/AnnouncementsTab';
import { fetchUsers, UserSession } from '../lib/adminApi';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const SESSION_KEY = 'mysticSage_adminAuth';

type Tab = 'users' | 'settings' | 'announcements';

export function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<UserSession[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadUsers();
    }
  }, [authenticated]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      <header className="bg-white border-b border-[#e8ded0] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#c4a96e]" />
            <span className="text-sm font-medium text-[#2c2c2c]">Admin Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-[#9a8a78] hover:text-[#6b6b6b] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-1 mb-6 bg-white border border-[#e8ded0] rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#f5efe7] text-[#2c2c2c] font-medium'
                  : 'text-[#9a8a78] hover:text-[#6b6b6b] hover:bg-[#faf6ef]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <UsersTab users={users} loading={usersLoading} onRefresh={loadUsers} />
        )}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
      </div>
    </div>
  );
}
