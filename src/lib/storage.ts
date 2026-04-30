import { supabase } from './supabase';

export const WEEKLY_SESSIONS = 7;

interface UserSettings {
  user_id: string;
  has_seen_welcome: boolean;
  has_consented: boolean;
  tokens_used: number;
  sessions_used: number;
  week_start: string;
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

async function ensureSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  const currentWeekStart = getWeekStart();

  if (!data) {
    const newSettings: UserSettings = {
      user_id: userId,
      has_seen_welcome: false,
      has_consented: false,
      tokens_used: 0,
      sessions_used: 0,
      week_start: currentWeekStart,
    };
    const { error: insertError } = await supabase
      .from('user_settings')
      .upsert(newSettings, { onConflict: 'user_id' });
    if (insertError) throw insertError;
    return newSettings;
  }

  if (data.week_start !== currentWeekStart) {
    const reset = { sessions_used: 0, week_start: currentWeekStart };
    const { error: updateError } = await supabase
      .from('user_settings')
      .update(reset)
      .eq('user_id', userId);
    if (updateError) throw updateError;
    return { ...data, ...reset } as UserSettings;
  }

  return data as UserSettings;
}

export async function hasSeenWelcome(userId: string): Promise<boolean> {
  const settings = await ensureSettings(userId);
  return settings.has_seen_welcome;
}

export async function markWelcomeSeen(userId: string): Promise<void> {
  await ensureSettings(userId);
  const { error } = await supabase
    .from('user_settings')
    .update({ has_seen_welcome: true })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function hasConsented(userId: string): Promise<boolean> {
  const settings = await ensureSettings(userId);
  return settings.has_consented;
}

export async function markConsented(userId: string): Promise<void> {
  await ensureSettings(userId);
  const { error } = await supabase
    .from('user_settings')
    .update({ has_consented: true })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function getSessionData(userId: string): Promise<{ sessionsUsed: number; weekStart: string }> {
  const settings = await ensureSettings(userId);
  return { sessionsUsed: settings.sessions_used, weekStart: settings.week_start };
}

export async function useSession(userId: string): Promise<void> {
  const settings = await ensureSettings(userId);
  const { error } = await supabase
    .from('user_settings')
    .update({ sessions_used: settings.sessions_used + 1 })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function getSessionCapacity(userId: string): Promise<{ used: number; total: number; percentage: number }> {
  const settings = await ensureSettings(userId);
  return {
    used: settings.sessions_used,
    total: WEEKLY_SESSIONS,
    percentage: (settings.sessions_used / WEEKLY_SESSIONS) * 100,
  };
}

export async function hasSessionsRemaining(userId: string): Promise<boolean> {
  const settings = await ensureSettings(userId);
  return settings.sessions_used < WEEKLY_SESSIONS;
}
