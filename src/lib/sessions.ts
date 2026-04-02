import { supabase } from './supabase';

interface UserSession {
  id: string;
  user_id: string;
  email: string;
  sessions_used: number;
  week_start_date: string;
  last_session_at: string;
  created_at: string;
  updated_at: string;
  tokens_used: number;
  max_tokens: number;
  tokens_input: number;
  tokens_output: number;
}

function getWeekStartDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

export async function checkAndUpdateSession(userId: string, email: string): Promise<{
  canUseSession: boolean;
  sessionsUsed: number;
  maxSessions: number;
  message?: string;
}> {
  const weekStart = getWeekStartDate();
  const maxSessions = 1;

  const { data: existingSession, error: fetchError } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching session:', fetchError);
    throw fetchError;
  }

  if (!existingSession) {
    const { error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        email: email,
        sessions_used: 1,
        week_start_date: weekStart,
        last_session_at: new Date().toISOString(),
        tokens_used: 0,
        tokens_input: 0,
        tokens_output: 0,
      });

    if (insertError) {
      console.error('Error creating session:', insertError);
      throw insertError;
    }

    return {
      canUseSession: true,
      sessionsUsed: 1,
      maxSessions,
      message: 'Session started',
    };
  }

  if (existingSession.week_start_date !== weekStart) {
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        sessions_used: 1,
        week_start_date: weekStart,
        last_session_at: new Date().toISOString(),
        tokens_used: 0,
        tokens_input: 0,
        tokens_output: 0,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error resetting session:', updateError);
      throw updateError;
    }

    return {
      canUseSession: true,
      sessionsUsed: 1,
      maxSessions,
      message: 'New week, session reset',
    };
  }

  if (existingSession.sessions_used >= maxSessions) {
    return {
      canUseSession: false,
      sessionsUsed: existingSession.sessions_used,
      maxSessions,
      message: 'Weekly session limit reached. Resets every Monday.',
    };
  }

  return {
    canUseSession: true,
    sessionsUsed: existingSession.sessions_used,
    maxSessions,
    message: 'Session active',
  };
}

export async function getCurrentSessionUsage(userId: string): Promise<{
  sessionsUsed: number;
  maxSessions: number;
  weekStart: string;
  tokensUsed: number;
  maxTokens: number;
}> {
  const weekStart = getWeekStartDate();
  const maxSessions = 1;
  const maxTokens = 100000;

  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('sessions_used, week_start_date, tokens_used, max_tokens')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching session usage:', error);
    throw error;
  }

  if (!session || session.week_start_date !== weekStart) {
    return {
      sessionsUsed: 0,
      maxSessions,
      weekStart,
      tokensUsed: 0,
      maxTokens,
    };
  }

  return {
    sessionsUsed: session.sessions_used,
    maxSessions,
    weekStart,
    tokensUsed: session.tokens_used,
    maxTokens: session.max_tokens,
  };
}
