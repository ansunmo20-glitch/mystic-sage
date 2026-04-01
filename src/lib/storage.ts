const WEEKLY_SESSIONS = 7;

interface SessionData {
  sessionsUsed: number;
  weekStart: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

export function getSessionData(): SessionData {
  const stored = localStorage.getItem('mysticSage_sessions');
  const currentWeekStart = getWeekStart();

  if (!stored) {
    const newData: SessionData = {
      sessionsUsed: 0,
      weekStart: currentWeekStart,
    };
    localStorage.setItem('mysticSage_sessions', JSON.stringify(newData));
    return newData;
  }

  const data: SessionData = JSON.parse(stored);

  if (data.weekStart !== currentWeekStart) {
    const resetData: SessionData = {
      sessionsUsed: 0,
      weekStart: currentWeekStart,
    };
    localStorage.setItem('mysticSage_sessions', JSON.stringify(resetData));
    return resetData;
  }

  return data;
}

export function useSession(): void {
  const data = getSessionData();
  data.sessionsUsed += 1;
  localStorage.setItem('mysticSage_sessions', JSON.stringify(data));
}

export function getSessionCapacity(): { used: number; total: number; percentage: number } {
  const data = getSessionData();
  return {
    used: data.sessionsUsed,
    total: WEEKLY_SESSIONS,
    percentage: (data.sessionsUsed / WEEKLY_SESSIONS) * 100,
  };
}

export function hasSessionsRemaining(): boolean {
  const data = getSessionData();
  return data.sessionsUsed < WEEKLY_SESSIONS;
}

export function saveMessages(messages: Message[]): void {
  localStorage.setItem('mysticSage_messages', JSON.stringify(messages));
}

export function loadMessages(): Message[] {
  const stored = localStorage.getItem('mysticSage_messages');
  return stored ? JSON.parse(stored) : [];
}

export function clearMessages(): void {
  localStorage.removeItem('mysticSage_messages');
}

export function hasSeenWelcome(): boolean {
  return localStorage.getItem('mysticSage_welcomed') === 'true';
}

export function markWelcomeSeen(): void {
  localStorage.setItem('mysticSage_welcomed', 'true');
}

export { WEEKLY_SESSIONS };
