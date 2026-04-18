import { supabase } from './supabase';

const DEFAULT_MAX_TOKENS = 10000;

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
  tokensUsed: number;
  maxTokens: number;
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
    console.log('[sessions] New user — inserting with max_tokens =', DEFAULT_MAX_TOKENS);
    const { error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        email: email,
        sessions_used: 1,
        week_start_date: weekStart,
        last_session_at: new Date().toISOString(),
        tokens_used: 0,
        max_tokens: DEFAULT_MAX_TOKENS,
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
      tokensUsed: 0,
      maxTokens: DEFAULT_MAX_TOKENS,
      message: 'Session started',
    };
  }

  const resolvedMaxTokens = existingSession.max_tokens ?? DEFAULT_MAX_TOKENS;
  const resolvedTokensUsed = existingSession.tokens_used ?? 0;

  if (existingSession.week_start_date !== weekStart) {
    console.log('[sessions] New week — resetting. tokens_used was:', resolvedTokensUsed);
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
      tokensUsed: 0,
      maxTokens: resolvedMaxTokens,
      message: 'New week, session reset',
    };
  }

  const tokensExhausted = resolvedTokensUsed >= resolvedMaxTokens;
  console.log(
    '[sessions] checkAndUpdateSession — tokens_used:', resolvedTokensUsed,
    'max_tokens:', resolvedMaxTokens,
    'exhausted:', tokensExhausted
  );

  if (tokensExhausted) {
    return {
      canUseSession: false,
      sessionsUsed: existingSession.sessions_used,
      maxSessions,
      tokensUsed: resolvedTokensUsed,
      maxTokens: resolvedMaxTokens,
      message: 'Token limit reached. Resets every Monday.',
    };
  }

  const { error: updateError } = await supabase
    .from('user_sessions')
    .update({
      sessions_used: Math.max(existingSession.sessions_used, 1),
      last_session_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating session:', updateError);
  }

  return {
    canUseSession: true,
    sessionsUsed: existingSession.sessions_used,
    maxSessions,
    tokensUsed: resolvedTokensUsed,
    maxTokens: resolvedMaxTokens,
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

  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('sessions_used, week_start_date, tokens_used, max_tokens')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching session usage:', error);
    throw error;
  }

  if (!session) {
    console.log('[sessions] getCurrentSessionUsage — no record yet, returning defaults (max_tokens:', DEFAULT_MAX_TOKENS, ')');
    return {
      sessionsUsed: 0,
      maxSessions,
      weekStart,
      tokensUsed: 0,
      maxTokens: DEFAULT_MAX_TOKENS,
    };
  }

  const resolvedMaxTokens = session.max_tokens ?? DEFAULT_MAX_TOKENS;
  const resolvedTokensUsed = session.tokens_used ?? 0;

  if (session.week_start_date !== weekStart) {
    console.log('[sessions] getCurrentSessionUsage — stale week, returning reset values');
    return {
      sessionsUsed: 0,
      maxSessions,
      weekStart,
      tokensUsed: 0,
      maxTokens: resolvedMaxTokens,
    };
  }

  console.log(
    '[sessions] getCurrentSessionUsage — tokens_used:', resolvedTokensUsed,
    'max_tokens:', resolvedMaxTokens
  );

  return {
    sessionsUsed: session.sessions_used ?? 0,
    maxSessions,
    weekStart,
    tokensUsed: resolvedTokensUsed,
    maxTokens: resolvedMaxTokens,
  };
}

export async function ensureUserTokens(userId: string, email: string): Promise<void> {
  const { data: session, error } = await supabase
    .from('user_sessions')
    .select('user_id, max_tokens')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[sessions] ensureUserTokens fetch error:', error);
    return;
  }

  if (!session) {
    console.log('[sessions] ensureUserTokens — no record, creating with', DEFAULT_MAX_TOKENS, 'welcome tokens');
    const weekStart = getWeekStartDate();
    const { error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        email,
        sessions_used: 0,
        week_start_date: weekStart,
        last_session_at: new Date().toISOString(),
        tokens_used: 0,
        max_tokens: DEFAULT_MAX_TOKENS,
        tokens_input: 0,
        tokens_output: 0,
      });

    if (insertError) {
      console.error('[sessions] ensureUserTokens insert error:', insertError);
    }
    return;
  }

  if (session.max_tokens === null || session.max_tokens === undefined) {
    console.log('[sessions] ensureUserTokens — fixing NULL max_tokens → ', DEFAULT_MAX_TOKENS);
    await supabase
      .from('user_sessions')
      .update({ max_tokens: DEFAULT_MAX_TOKENS })
      .eq('user_id', userId);
  }
}
