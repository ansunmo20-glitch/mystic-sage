import { supabase } from './supabase';

export interface UserSession {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  tokens_used: number;
  max_tokens: number;
  suspended: boolean;
  subscription_status: string;
}

export interface AdminSetting {
  key: string;
  value: string;
}

export interface Announcement {
  id: string;
  message: string;
  active: boolean;
  created_at: string;
}

const SETTINGS_KEY = 'mysticSage_adminSettings';
const ANNOUNCEMENTS_KEY = 'mysticSage_announcements';

export async function fetchUsers(): Promise<UserSession[]> {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('id, user_id, email, created_at, tokens_used, max_tokens, suspended, subscription_status')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function grantTokens(sessionId: string, currentTokensUsed: number, bonusAmount: number): Promise<void> {
  const newTokensUsed = Math.max(0, currentTokensUsed - bonusAmount);
  const { error } = await supabase
    .from('user_sessions')
    .update({ tokens_used: newTokensUsed })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function setTokenLimit(sessionId: string, newLimit: number): Promise<void> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ max_tokens: newLimit })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function toggleSuspended(sessionId: string, suspended: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ suspended: !suspended })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function fetchSettings(): Promise<Record<string, string>> {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const current = await fetchSettings();
  current[key] = value;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Announcement[];
  } catch {
    return [];
  }
}

export async function createAnnouncement(message: string): Promise<void> {
  const existing = await fetchAnnouncements();
  const updated = existing.map((a) => ({ ...a, active: false }));
  const newAnnouncement: Announcement = {
    id: crypto.randomUUID(),
    message,
    active: true,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify([newAnnouncement, ...updated]));
}

export async function deactivateAnnouncement(id: string): Promise<void> {
  const existing = await fetchAnnouncements();
  const updated = existing.map((a) => (a.id === id ? { ...a, active: false } : a));
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(updated));
}

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const announcements = await fetchAnnouncements();
  return announcements.find((a) => a.active) || null;
}
