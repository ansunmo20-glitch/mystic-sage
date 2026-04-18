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
  const { data, error } = await supabase.from('admin_settings').select('key, value');
  if (error) throw error;
  const map: Record<string, string> = {};
  (data || []).forEach((row: AdminSetting) => { map[row.key] = row.value; });
  return map;
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('admin_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createAnnouncement(message: string): Promise<void> {
  await supabase.from('announcements').update({ active: false }).eq('active', true);
  const { error } = await supabase
    .from('announcements')
    .insert({ message, active: true });
  if (error) throw error;
}

export async function deactivateAnnouncement(id: string): Promise<void> {
  const { error } = await supabase
    .from('announcements')
    .update({ active: false })
    .eq('id', id);
  if (error) throw error;
}
